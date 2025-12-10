# Earthquake Catalog Dataset Analysis

Analysis of 5 earthquake catalogs for unified schema design.

## Datasets Analyzed

1. **Brenton et al. (Current Production)** - 279,148 events
   - File: `filt_events_duplicates_removed_v2.csv`
   - Pacific Northwest ML catalog

2. **Littel et al. 2024** - 18,442 events
   - File: `hypreloc_fix5_4pr_all.reloc`
   - Queen Charlotte Triple Junction
   - DOI: https://doi.org/10.1029/2022TC007494

3. **Merrill et al.** - 108,676 events
   - File: `Merrill_et_al_REST_Catalogue.dat`
   - Nootka Fault Zone (REST algorithm)
   - DOI: https://doi.org/10.1029/2021GC010205

4. **Morton et al. 2023** - 5,282 events
   - File: `ds01.xlsx`
   - Cascadia Subduction Zone
   - DOI: https://doi.org/10.1029/2023JB026607

5. **Shelly et al. 2025** - 61,441 events
   - Files: `LFEcat_MTJ_2018-2024.csv` + `lfe_family_locations.txt`
   - Low-Frequency Earthquakes (LFE)
   - DOI: https://doi.org/10.1029/2025GL116116

**Total: 472,989 events**

## Analysis Outputs

- **`dataset_analysis.ipynb`** - Jupyter notebook with full analysis
- **`dataset_field_comparison.xlsx`** - Field mapping across all datasets

## Key Findings

### ✅ Universal Fields (present in ALL datasets)
- Latitude, Longitude, Depth
- Date/Time components (Year, Month, Day, Hour, Minute, Second)

### ⚠️ Inconsistent Fields
- **Magnitude**: Only 2/5 datasets (Littel: MAG, Morton: Md)
- **Event ID**: Missing in Morton
- **Error metrics**: Different formats (horizontal vs x/y, vertical vs z)

## Recommended Unified Schema

### Required Fields
- `id` - Event identifier (generate if missing)
- `latitude` - Decimal degrees
- `longitude` - Decimal degrees
- `depth_km` - Depth in kilometers
- `origin_time` - ISO 8601 timestamp
- `catalog_source` - Source dataset name

### Optional Fields (null if not available)
- `magnitude`
- `num_stations`
- `azimuthal_gap`
- `horizontal_error_km`
- `vertical_error_km`
- `rms_residual`

## Next Steps

1. Get schema approval
2. Write transformation scripts for each dataset
3. Load unified data into PostGIS
4. Build catalog dropdown UI
5. Remove region-specific filters (W1/W2/E1/E2)
6. Add universal filters (lat/lon bounds, depth, date range)

## Running the Analysis
```bash
conda activate "your enmv name"
jupyter notebook dataset_analysis.ipynb
```

**Note:** Raw dataset files are not included in the repository due to size constraints.