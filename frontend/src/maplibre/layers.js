import { EQ_LAYER_ID } from './config.js';

/**
 * Add clustered earthquake source + layers
 * Called from viewer.js after data is fetched.
 */
export function addEarthquakeLayer(map, geojson) {
    // Remove old source/layers if they exist (for hot reload)
    if (map.getSource('earthquakes')) {
        ['eq-clusters', 'eq-cluster-count', EQ_LAYER_ID].forEach(id => {
            if (map.getLayer(id)) map.removeLayer(id);
        });
        map.removeSource('earthquakes');
    }

    map.addSource('earthquakes', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
    });

    // Cluster circles
    map.addLayer({
        id: 'eq-clusters',
        type: 'circle',
        source: 'earthquakes',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                100,
                '#3b9fc4',
                750,
                '#2a7db3'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40
            ],
            'circle-opacity': 0.85,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
        }
    });

    // Cluster counts
    map.addLayer({
        id: 'eq-cluster-count',
        type: 'symbol',
        source: 'earthquakes',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': 12
        },
        paint: {
            'text-color': '#ffffff'
        }
    });

    // Individual earthquakes – depth-based colors
    map.addLayer({
        id: EQ_LAYER_ID,
        type: 'circle',
        source: 'earthquakes',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                4, 2.5,
                10, 6
            ],
            'circle-color': [
                'step', ['get', 'depth'],
                '#fbbf24', 20,
                '#f97316', 40,
                '#dc2626'
            ],
            'circle-opacity': 0.7,
            'circle-stroke-width': 0
        }
    });
}

/* Cascadia study region boundary */
export function addCascadiaBoundary(map) {
    map.addSource('cascadia-boundary', {
        type: 'geojson',
        data: {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [-130.0, 39.0],
                    [-116.0, 39.0],
                    [-116.0, 52.0],
                    [-130.0, 52.0],
                    [-130.0, 39.0]
                ]]
            }
        }
    });

    map.addLayer({
        id: 'cascadia-line',
        type: 'line',
        source: 'cascadia-boundary',
        paint: {
            'line-color': '#00FFFF',
            'line-width': 1.5,
            'line-opacity': 0.8
        }
    });
}
