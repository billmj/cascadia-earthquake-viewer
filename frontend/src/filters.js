import noUiSlider from 'nouislider';
import { EarthquakeFilterConfig } from './earthquake-filters-config.js';
import { buildFilterHTML } from './filter-builder.js';

let currentFilters = {
    depth: [0, 100],
    regions: ['W1', 'W2', 'W3', 'E1', 'E2', 'E3'],
    maxError: 5,
    gap: 150,
    nsta: 3
};

export function initFilters(map) {
    const cfg = EarthquakeFilterConfig;
    const container = document.getElementById('filters-panel');
    
    container.innerHTML = buildFilterHTML();
    
    // 1. Initialize Sliders
    const depthSlider = document.getElementById('depth-slider');
    noUiSlider.create(depthSlider, {
        start: cfg.depth.default,
        connect: true,
        range: { min: cfg.depth.min, max: cfg.depth.max },
        step: cfg.depth.step
    });
    
    depthSlider.noUiSlider.on('update', (values) => {
        document.getElementById('depth-min-val').textContent = Math.round(values[0]);
        document.getElementById('depth-max-val').textContent = Math.round(values[1]);
        currentFilters.depth = [parseFloat(values[0]), parseFloat(values[1])];
    });

    const maxerrSlider = document.getElementById('maxerr-slider');
    noUiSlider.create(maxerrSlider, {
        start: cfg.quality.maxError.default[1],
        connect: [true, false],
        range: { min: cfg.quality.maxError.min, max: cfg.quality.maxError.max },
        step: cfg.quality.maxError.step
    });
    
    maxerrSlider.noUiSlider.on('update', (values) => {
        document.getElementById('maxerr-max-val').textContent = parseFloat(values[0]).toFixed(1);
        currentFilters.maxError = parseFloat(values[0]);
    });

    const gapSlider = document.getElementById('gap-slider');
    noUiSlider.create(gapSlider, {
        start: cfg.quality.gap.default[1],
        connect: [true, false],
        range: { min: cfg.quality.gap.min, max: cfg.quality.gap.max },
        step: cfg.quality.gap.step
    });
    
    gapSlider.noUiSlider.on('update', (values) => {
        document.getElementById('gap-max-val').textContent = Math.round(values[0]);
        currentFilters.gap = parseFloat(values[0]);
    });

    // 2. Min Stations Input
    const nstaSlider = document.getElementById('nsta-slider');
    const nstaVal = document.getElementById('nsta-val');
    
    nstaSlider.addEventListener('input', (e) => {
        nstaVal.textContent = e.target.value;
        currentFilters.nsta = parseInt(e.target.value);
    });

    // 3. Chip Logic
    const chipContainer = document.getElementById('region-chips');
    const chips = chipContainer.querySelectorAll('.chip-option');
    
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('active');
            const selected = [];
            chips.forEach(c => {
                if (c.classList.contains('active')) selected.push(c.dataset.value);
            });
            currentFilters.regions = selected;
        });
    });

    // 4. Buttons
    document.getElementById('apply-filters').addEventListener('click', () => {
        applyFiltersToMap(map, currentFilters);
    });

    document.getElementById('reset-filters').addEventListener('click', () => {
        depthSlider.noUiSlider.set(cfg.depth.default);
        maxerrSlider.noUiSlider.set(cfg.quality.maxError.default[1]);
        gapSlider.noUiSlider.set(cfg.quality.gap.default[1]);
        nstaSlider.value = cfg.quality.nsta.default;
        nstaVal.textContent = cfg.quality.nsta.default;
        chips.forEach(chip => chip.classList.add('active'));
        
        currentFilters = {
            depth: cfg.depth.default,
            regions: cfg.regions.default,
            maxError: cfg.quality.maxError.default[1],
            gap: cfg.quality.gap.default[1],
            nsta: cfg.quality.nsta.default
        };
        
        map.setFilter('eq-points', null);
        console.log('✅ Filters reset');
    });
}

function applyFiltersToMap(map, filters) {
    const regions = filters.regions.length > 0 ? filters.regions : ['NONE'];
    const filterExpr = [
        'all',
        ['>=', ['get', 'depth'], filters.depth[0]],
        ['<=', ['get', 'depth'], filters.depth[1]],
        ['in', ['get', 'region'], ['literal', regions]],
        ['<=', ['get', 'max_err'], filters.maxError],
        ['<=', ['get', 'gap'], filters.gap],
        ['>=', ['get', 'nsta'], filters.nsta]
    ];
    map.setFilter('eq-points', filterExpr);
}