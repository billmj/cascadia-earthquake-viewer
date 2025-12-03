import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN;

const viewer = new Cesium.Viewer('cesiumContainer', {
    terrain: Cesium.Terrain.fromWorldTerrain(),
    baseLayerPicker: false,
    geocoder: false,
    homeButton: true,
    sceneModePicker: true,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: true,
    infoBox: true,
    selectionIndicator: true
});

// Fly to Cascadia region
viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(-123.0, 44.0, 800000),
    orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-60),
        roll: 0.0
    }
});

// Color by depth
function getColorByDepth(depth) {
    if (depth < 20) return Cesium.Color.YELLOW.withAlpha(0.8);
    if (depth < 40) return Cesium.Color.ORANGE.withAlpha(0.8);
    return Cesium.Color.RED.withAlpha(0.8);
}

// Load real earthquake data
async function loadEarthquakes(filters = {}) {
    try {
        const params = new URLSearchParams({
            minDepth: filters.minDepth || 0,
            maxDepth: filters.maxDepth || 100,
            limit: filters.limit || 10000,
            regions: filters.regions || 'W1,W2,W3,E1,E2,E3'
        });

        const response = await fetch(`http://localhost:3002/api/earthquakes?${params}`);
        const data = await response.json();

        console.log(`Loading ${data.count} earthquakes...`);

        // Clear existing entities
        viewer.entities.removeAll();

        // Add earthquake points
        data.earthquakes.forEach(eq => {
            viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(
                    eq.longitude,
                    eq.latitude,
                    -eq.depth * 1000 // Depth in meters (negative = underground)
                ),
                point: {
                    pixelSize: 6,
                    color: getColorByDepth(eq.depth),
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 1,
                    heightReference: Cesium.HeightReference.NONE
                },
                description: `
                    <div style="font-family: system-ui; padding: 10px;">
                        <h3 style="margin: 0 0 10px 0;">Earthquake Event</h3>
                        <table style="width: 100%; font-size: 13px;">
                            <tr><td><strong>Event ID:</strong></td><td>${eq.evid}</td></tr>
                            <tr><td><strong>Depth:</strong></td><td>${eq.depth.toFixed(2)} km</td></tr>
                            <tr><td><strong>Location:</strong></td><td>${eq.latitude.toFixed(3)}°N, ${Math.abs(eq.longitude).toFixed(3)}°W</td></tr>
                            <tr><td><strong>Time:</strong></td><td>${new Date(eq.origin_time).toLocaleString()}</td></tr>
                            <tr><td><strong>Region:</strong></td><td>${eq.region}</td></tr>
                            <tr><td><strong>Stations:</strong></td><td>${eq.nsta}</td></tr>
                            <tr><td><strong>Gap:</strong></td><td>${eq.gap.toFixed(1)}°</td></tr>
                            <tr><td><strong>Max Error:</strong></td><td>${eq.max_err.toFixed(2)} km</td></tr>
                        </table>
                    </div>
                `
            });
        });

        console.log('✅ Earthquakes loaded successfully');
    } catch (error) {
        console.error('❌ Error loading earthquakes:', error);
    }
}

// Initial load
loadEarthquakes({ limit: 10000 });