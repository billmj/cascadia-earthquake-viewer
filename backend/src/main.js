// MapLibre is already loaded via script tag in index.html

const map = new maplibregl.Map({
    container: 'map',
    style: '../eq-style.json',
    center: [-122, 46], // Centered on Cascadia
    zoom: 6,
    hash: true
});

map.addControl(new maplibregl.NavigationControl(), 'top-right');

// Show loading spinner
map.on('dataloading', () => {
    document.getElementById('map-loading').classList.remove('d-none');
});

map.on('idle', () => {
    document.getElementById('map-loading').classList.add('d-none');
});

// Click handler
map.on('load', () => {
    map.on('click', 'eq-points', (e) => {
        if (!e.features || !e.features.length) return;

        const props = e.features[0].properties;
        
        const description = `
            <table class='table table-sm table-borderless m-0'>
                <tbody>
                    <tr><th>Event ID</th><td>${props.evid || 'N/A'}</td></tr>
                    <tr><th>Depth</th><td>${props.depth || 'N/A'} km</td></tr>
                    <tr><th>Time</th><td>${props.origin_time || 'N/A'}</td></tr>
                    <tr><th>Region</th><td>${props.region || 'N/A'}</td></tr>
                    <tr><th>Stations</th><td>${props.nsta || 'N/A'}</td></tr>
                    <tr><th>Max Error</th><td>${props.max_err ? props.max_err.toFixed(2) : 'N/A'} km</td></tr>
                </tbody>
            </table>
        `;

        new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(description)
            .addTo(map);
    });

    map.on('mouseenter', 'eq-points', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'eq-points', () => {
        map.getCanvas().style.cursor = '';
    });
});