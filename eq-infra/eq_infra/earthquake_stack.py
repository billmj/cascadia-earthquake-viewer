from aws_cdk import (
    Stack,
    RemovalPolicy,
    aws_ec2 as ec2,
    aws_s3 as s3,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_s3_deployment as s3_deployment,
    aws_iam as iam,
    CfnOutput,
)
from constructs import Construct


class EarthquakeStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        # Import VPC
        vpc = ec2.Vpc.from_lookup(
            self, "ExistingVpc",
            vpc_id="vpc-0e7aacf72d6e093e7"
        )

        # Security group for backend server
        backend_sg = ec2.SecurityGroup(
            self, "BackendSecurityGroup",
            vpc=vpc,
            description="Backend Docker server with PostGIS + Martin + API",
            allow_all_outbound=True,
        )

        # Allow Martin tile server access
        backend_sg.add_ingress_rule(
            ec2.Peer.any_ipv4(),
            ec2.Port.tcp(3001),
            "Allow Martin tile server access"
        )

        # Allow API access
        backend_sg.add_ingress_rule(
            ec2.Peer.any_ipv4(),
            ec2.Port.tcp(3002),
            "Allow API server access"
        )

        # EC2 Role with SSM access
        backend_role = iam.Role(
            self, "BackendRole",
            assumed_by=iam.ServicePrincipal("ec2.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("AmazonSSMManagedInstanceCore")
            ]
        )

        # User data script to set up Docker environment
        user_data = ec2.UserData.for_linux()
        user_data.add_commands(
            "#!/bin/bash",
            "set -e",
            "exec > >(tee /var/log/user-data.log) 2>&1",
            
            # Update system
            "echo '=== Installing Docker ==='",
            "yum update -y",
            "yum install -y docker git",
            "systemctl start docker",
            "systemctl enable docker",
            "usermod -aG docker ec2-user",
            
            # Install docker-compose
            "echo '=== Installing Docker Compose ==='",
            "curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose",
            "chmod +x /usr/local/bin/docker-compose",
            
            # Clone repository
            "echo '=== Cloning Repository ==='",
            "cd /home/ec2-user",
            "git clone https://github.com/billmj/cascadia-earthquake-viewer.git",
            "cd cascadia-earthquake-viewer",
            "chown -R ec2-user:ec2-user /home/ec2-user/cascadia-earthquake-viewer",
            
            # Start Docker Compose
            "echo '=== Starting Docker Compose ==='",
            "sudo -u ec2-user docker-compose up -d",
            
            # Wait for services to be ready
            "echo '=== Waiting for services to start ==='",
            "sleep 60",
            
            # Check service status
            "echo '=== Service Status ==='",
            "sudo -u ec2-user docker-compose ps",
            
            # Log success
            "echo '=== Deployment Complete ==='",
            "echo 'Deployment completed at $(date)' > /home/ec2-user/deployment.log",
        )

        # EC2 Instance
        backend_instance = ec2.Instance(
            self, "BackendInstance",
            vpc=vpc,
            instance_type=ec2.InstanceType.of(
                ec2.InstanceClass.BURSTABLE3,
                ec2.InstanceSize.LARGE  # 2 vCPU, 8GB RAM for 745k events + restore
            ),
            machine_image=ec2.MachineImage.latest_amazon_linux2023(),
            security_group=backend_sg,
            role=backend_role,
            user_data=user_data,
            vpc_subnets=ec2.SubnetSelection(
                subnet_type=ec2.SubnetType.PUBLIC
            ),
            block_devices=[
                ec2.BlockDevice(
                    device_name="/dev/xvda",
                    volume=ec2.BlockDeviceVolume.ebs(
                        volume_size=50,  # 50GB for database + backup file
                        volume_type=ec2.EbsDeviceVolumeType.GP3,
                        delete_on_termination=True
                    )
                )
            ]
        )

        # Import S3 bucket
        site_bucket = s3.Bucket.from_bucket_name(
            self, "ExistingReactBucket",
            "crescent-react-hosting"
        )

        # CloudFront Distribution
        distribution = cloudfront.Distribution(
            self, "EqDistribution",
            default_root_object="index.html",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3BucketOrigin.with_origin_access_control(
                    site_bucket,
                    origin_path="/earthquake-viewer"
                ),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            ),
        )

        # Deploy files to S3
        s3_deployment.BucketDeployment(
            self, "DeployEqViewer",
            sources=[s3_deployment.Source.asset("../frontend/dist")],
            destination_bucket=site_bucket,
            destination_key_prefix="earthquake-viewer",
            distribution=distribution,
            distribution_paths=["/*"],
        )

        # Outputs
        CfnOutput(self, "FrontendURL",
            value=f"https://{distribution.distribution_domain_name}",
            description="🌐 Earthquake Viewer (745k events, 8 catalogs, 1995-2024)"
        )

        CfnOutput(self, "BackendIP",
            value=backend_instance.instance_public_ip,
            description="🖥️ Backend Server IP"
        )

        CfnOutput(self, "MartinTileURL",
            value=f"http://{backend_instance.instance_public_ip}:3000",
            description="🗺️ Martin Tiles - Use in .env.production"
        )

        CfnOutput(self, "ApiURL",
            value=f"http://{backend_instance.instance_public_ip}:3002",
            description="📡 API - Use in .env.production"
        )

        CfnOutput(self, "DebugCommand",
            value=f"aws ssm start-session --target {backend_instance.instance_id}",
            description="🔧 Debug: Connect to server"
        )

        CfnOutput(self, "LogCommand",
            value=f"aws ssm start-session --target {backend_instance.instance_id} --document-name AWS-StartInteractiveCommand --parameters command='tail -f /var/log/user-data.log'",
            description="📋 Debug: View deployment logs"
        )