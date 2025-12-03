# Cascadia Earthquake Catalog Viewer
A web-based geospatial application for exploring and analyzing earthquake data from the Cascadia subduction zone. This application provides interactive visualization, dynamic clustering, and advanced filtering capabilities for 279,000+ seismic events.

## Features

### Interactive Mapping
- **Satellite Basemap**: High-resolution imagery from Esri World Imagery
- **Dynamic Clustering**: Intelligent grouping at low zoom levels (0-9) for performance
- **Individual Points**: Detailed earthquake locations at high zoom (10+)
- **Color-Coded Depth**: Visual representation of earthquake depth
  - Yellow: Shallow (0-20 km)
  - Orange: Medium (20-40 km)
  - Red/Dark: Deep (40-60+ km)

### Advanced Filtering
- **Spatial Filters**
  - Depth range slider (0-100 km)
  - Regional selection (6 Cascadia zones: W1-W3, E1-E3)
- **Data Quality Filters**
  - Minimum station count
  - Maximum location error
  - Azimuthal gap threshold
- **Collapsible Filter Panels**: Clean, organized interface

### User Interface
- **Resizable Panels**: Draggable divider between filters and map
- **Event Details**: Click any earthquake for comprehensive information
- **Real-time Indicators**: Zoom level and scale bar
- **Responsive Design**: Works on desktop and tablet devices

## Architecture

### Frontend
- **Framework**: Vite 7.2 for fast development and optimized builds
- **Mapping Library**: MapLibre GL JS 5.0 for vector tile rendering
- **UI Components**: 
  - noUiSlider for range filters
  - Custom collapsible panels
  - Professional color schemes matching CRESCENT branding

### Backend
- **Database**: PostgreSQL 16 with PostGIS 3.4 spatial extension
- **Tile Server**: Martin 0.20 for vector tile generation
- **Data Format**: Mapbox Vector Tiles (MVT) for efficient streaming
- **Clustering**: Server-side spatial aggregation with zoom-based grid sizing

## Project Structure

```
cascadia-earthquake-viewer/
├── frontend/
│   ├── src/
│   │   ├── maplibre/
│   │   │   ├── baselayer.js          # Esri satellite basemap configuration
│   │   │   ├── config.js             # Map settings and tile endpoints
│   │   │   ├── layers.js             # Cluster and point layer definitions
│   │   │   └── viewer.js             # Map initialization and interactions
│   │   ├── resources/
│   │   │   └── favicon.ico           # Application icon
│   │   ├── earthquake-filters-config.js  # Filter specifications
│   │   ├── filter-builder.js         # Dynamic filter HTML generation
│   │   ├── filters.js                # Filter logic and event handlers
│   │   ├── resize.js                 # Resizable panel functionality
│   │   ├── style.css                 # Application styling
│   │   └── counter.js                # Utility functions
│   ├── public/
│   │   └── vite.svg                  # Vite logo
│   ├── index.html                    # Main HTML entry point
│   ├── main.js                       # Application initialization
│   ├── package.json                  # Frontend dependencies
│   ├── package-lock.json             # Locked dependency versions
│   └── vite.config.js                # Vite build configuration
├── backend/
│   ├── pgdata/                       # PostgreSQL data directory (gitignored)
│   ├── config.yaml                   # Martin tile server configuration
│   ├── docker-compose.yml            # PostgreSQL + Martin services
│   ├── gis_backup.dump              # Database backup file
│   ├── eq-style.json                 # Map style definition (legacy)
│   ├── index.html                    # Test viewer (legacy)
│   ├── main.js                       # Test script (legacy)
│   └── tile_*.pbf                    # Test tile files (can be removed)
├── .gitignore                        # Git ignore patterns
└── README.md                         # Project documentation
```

### Key Files Explained

**Frontend Core:**
- `main.js` - Application entry point, initializes map and filters
- `index.html` - HTML structure with panels and filter containers

**Configuration Files:**
- `frontend/vite.config.js` - Development server and build settings
- `backend/config.yaml` - Martin connection to PostgreSQL
- `backend/docker-compose.yml` - Container orchestration

**Data Files:**
- `backend/pgdata/` - PostgreSQL data storage (not in git)
- `backend/gis_backup.dump` - Database dump with 279K earthquakes

**Legacy Files (can be removed):**
- `backend/eq-style.json` - Old MapLibre style
- `backend/index.html` - Old test viewer
- `backend/main.js` - Old test script
- `backend/tile_*.pbf` - Test tile files
- `backend/testtile.pbf` - Test tile file



## Prerequisites

- **Node.js**: 18+ (LTS recommended)
- **Docker Desktop**: Latest stable version
- **Git**: For version control
- **Web Browser**: Chrome, Firefox, or Edge (modern versions)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd cascadia-earthquake-viewer
```

### 2. Backend Setup

Start PostgreSQL database and Martin tile server:
```bash
cd backend
docker-compose up -d
```

**Verify services are running:**
```bash
docker ps
```

You should see:
- `postgis-eq` - PostgreSQL database (port 5432)
- `martin-eq` - Tile server (port 3001)

**Check Martin catalog:**
```bash
curl http://localhost:3001/catalog
```

### 3. Database Initialization

If starting fresh, the database will initialize automatically. To restore from backup:
```bash
docker exec postgis-eq psql -U postgres -d gis -c "CREATE EXTENSION IF NOT EXISTS postgis;"
docker cp ./gis_backup.dump postgis-eq:/tmp/gis_backup.dump
docker exec postgis-eq pg_restore -U postgres -d gis -c /tmp/gis_backup.dump
```

**Verify data:**
```bash
docker exec postgis-eq psql -U postgres -d gis -c "SELECT COUNT(*) FROM earthquake.events;"
```

Should return ~279,060 rows.

### 4. Frontend Setup

Install dependencies and start development server:
```bash
cd ../frontend
npm install
npm run dev
```

**Application will be available at:** http://localhost:5173

## Development

### Frontend Development
```bash
cd frontend

# Start dev server with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Clear cache if needed
Remove-Item -Recurse -Force node_modules\.vite
```

### Backend Management
```bash
cd backend

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker logs martin-eq --tail 50
docker logs postgis-eq --tail 50

# Restart services
docker restart martin-eq postgis-eq

# Access PostgreSQL directly
docker exec -it postgis-eq psql -U postgres -d gis
```

### Database Functions

Key PostgreSQL functions for tile generation:

- **earthquake.tiles_zxy(z, x, y)**: Main tile function with clustering
  - Zoom 0-9: Returns clustered data with point counts
  - Zoom 10+: Returns individual earthquake points

## Configuration

### Clustering Parameters

Clustering grid sizes (in `backend/init.sql`):
```sql
grid_size := CASE 
    WHEN z <= 2 THEN 500000  -- Very large clusters at world view
    WHEN z <= 4 THEN 200000
    WHEN z <= 6 THEN 80000
    WHEN z <= 8 THEN 30000
    ELSE 10000
END;
```

### Filter Defaults

Default filter values (in `frontend/src/earthquake-filters-config.js`):

- Depth: 0-100 km
- Regions: All 6 zones enabled
- Min Stations: 3
- Max Error: 8.5 km
- Azimuthal Gap: 200°

## Data Schema

### earthquake.events Table

| Column | Type | Description |
|--------|------|-------------|
| event_id | INTEGER | Primary key |
| evid | TEXT | Event identifier |
| catalog_id | INTEGER | Catalog reference |
| origin_time | TIMESTAMP | Event time (UTC) |
| geom | GEOMETRY(Point, 4326) | Location (WGS84) |
| depth | FLOAT | Depth in kilometers |
| region | TEXT | Geographic region code |
| nsta | INTEGER | Number of stations |
| nphases | INTEGER | Number of phases |
| gap | FLOAT | Azimuthal gap in degrees |
| max_err | FLOAT | Maximum location error (km) |

### Indexes

- `idx_events_geom` - Spatial index (GIST)
- `idx_events_depth` - Depth queries
- `idx_events_region` - Regional filtering
- `idx_events_time` - Temporal queries
- `idx_events_catalog_id` - Catalog lookup

## Deployment

### Production Build
```bash
cd frontend
npm run build
```

Outputs to `frontend/dist/` - ready for static hosting.

### Docker Production

Backend services are production-ready with:
- Automatic restart policies
- Health checks
- Volume persistence
- Network isolation

## Troubleshooting

### No Clusters Appearing

1. Check Martin is healthy: `docker ps`
2. Verify tile endpoint: `curl http://localhost:3001/catalog`
3. Check browser console (F12) for errors
4. Verify database connection in Martin logs

### Frontend Not Loading

1. Clear browser cache: Ctrl+Shift+R
2. Clear Vite cache: `Remove-Item -Recurse -Force node_modules\.vite`
3. Rebuild: `npm run dev`

### Database Connection Issues

1. Check PostgreSQL is running: `docker ps`
2. Verify config.yaml has correct host: `postgis-eq`
3. Restart services: `docker restart martin-eq postgis-eq`

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Build Tool | Vite | 7.2.2 |
| Mapping | MapLibre GL JS | 5.0.0 |
| UI Components | noUiSlider | 15.8.1 |
| Database | PostgreSQL | 16 |
| Spatial Extension | PostGIS | 3.4 |
| Tile Server | Martin | 0.20.1 |
| Container Platform | Docker | Latest |

## Performance Optimizations

- **Vector Tiles**: Efficient MVT format reduces data transfer
- **Server-Side Clustering**: Reduces client-side rendering load
- **Spatial Indexes**: Fast geospatial queries
- **Zoom-Based Rendering**: Appropriate detail levels
- **Connection Pooling**: Martin uses efficient PostgreSQL connections


## Roadmap

### Completed ✅
- Interactive map with satellite basemap
- Dynamic clustering (zoom 0-9)
- Individual point rendering (zoom 10+)
- Multi-criteria filtering system
- Collapsible filter panels
- Event detail sidebar
- Resizable UI panels
- Zoom and scale indicators
- Production-ready monorepo structure

### Next Phase: CI/CD & Deployment 🚀

#### Continuous Integration
- GitHub Actions workflow for automated testing
- Frontend build validation
- Docker image building and versioning
- Automated deployment pipeline

#### AWS Deployment Architecture
- **Frontend**: S3 + CloudFront for static hosting
- **Backend**: 
  - RDS PostgreSQL with PostGIS
  - ECS/Fargate for Martin container
  - Application Load Balancer
- **Infrastructure as Code**: Terraform/CloudFormation
- **Monitoring**: CloudWatch metrics and logs

#### Security Enhancements
- Environment variable management
- SSL/TLS certificates
- Database connection encryption
- API authentication (if needed)


## License

Developed for the Cascadia Region Earthquake Science Center (CRESCENT) with support from the U.S. National Science Foundation.

## Contact

For technical questions or support:
- CRESCENT Development Team


---
