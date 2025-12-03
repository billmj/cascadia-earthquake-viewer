export const basemapSource = {
    id: 'basemap',
    source: {
        type: 'raster',
        tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        ],
        tileSize: 256,
        attribution: 'Tiles © Esri'
    },
    layer: {
        id: 'basemap-layer',
        type: 'raster',
        source: 'basemap'
    }
};