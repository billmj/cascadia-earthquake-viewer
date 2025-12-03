import { EarthquakeFilterConfig } from './earthquake-filters-config.js';

export function buildFilterHTML() {
    const cfg = EarthquakeFilterConfig;
    
    return `
        <div class="panel-header">
            <span>Catalog Filters</span>
        </div>

        <div class="panel-content">
            
            <div class="group-title">Spatial Filters</div>

            <div class="filter-section">
                <div class="input-label">
                    ${cfg.depth.label} 
                    <span style="font-weight:400; color:#94a3b8; margin-left:4px; font-size:10px;">
                        (<span id="depth-min-val">${cfg.depth.default[0]}</span> - 
                        <span id="depth-max-val">${cfg.depth.default[1]}</span> km)
                    </span>
                </div>
                <div id="depth-slider" class="slider"></div>
            </div>

            <div class="filter-section">
                <div class="input-label">${cfg.regions.label}</div>
                <div class="chip-grid" id="region-chips">
                    ${cfg.regions.options.map(opt => `
                        <div class="chip-option active" data-value="${opt.value}">
                            ${opt.label.split(' ')[0]}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="group-title" style="margin-top: 10px;">Data Quality</div>

            <div class="filter-section">
                <div style="margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; font-size:10px; color:#64748b; margin-bottom:4px;">
                        <span>${cfg.quality.nsta.label}</span>
                        <span id="nsta-val" style="font-weight:600; color:#334155;">${cfg.quality.nsta.default}</span>
                    </div>
                    <input type="range" id="nsta-slider" 
                           min="${cfg.quality.nsta.min}" max="${cfg.quality.nsta.max}" 
                           value="${cfg.quality.nsta.default}" 
                           style="width:100%; accent-color:var(--primary);">
                </div>

                <div style="margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; font-size:10px; color:#64748b; margin-bottom:4px;">
                        <span>${cfg.quality.maxError.label}</span>
                        <span style="font-weight:600; color:#334155;"><span id="maxerr-max-val">${cfg.quality.maxError.default[1]}</span> km</span>
                    </div>
                    <div id="maxerr-slider" class="slider"></div>
                </div>

                <div>
                    <div style="display:flex; justify-content:space-between; font-size:10px; color:#64748b; margin-bottom:4px;">
                        <span>${cfg.quality.gap.label}</span>
                        <span style="font-weight:600; color:#334155;"><span id="gap-max-val">${cfg.quality.gap.default[1]}</span>°</span>
                    </div>
                    <div id="gap-slider" class="slider"></div>
                </div>
            </div>

            <div style="display:flex; gap:8px; margin-top:16px;">
                <button id="reset-filters" style="
                    flex:1; padding:8px; border-radius:4px; border:none; 
                    background:#f1f5f9; color:#64748b; font-weight:600; cursor:pointer; font-size:12px;">
                    Reset
                </button>
                <button id="apply-filters" style="
                    flex:2; padding:8px; border-radius:4px; border:none; 
                    background:var(--primary); color:white; font-weight:600; cursor:pointer; font-size:12px;">
                    Update Map
                </button>
            </div>
            
        </div>
    `;
}