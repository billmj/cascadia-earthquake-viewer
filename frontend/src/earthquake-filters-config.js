// Earthquake filter configuration

export const EarthquakeFilterConfig = {
    depth: {
        label: 'Depth (km)',
        min: 0,
        max: 100,
        step: 1,
        default: [0, 100]
    },
    
    dateRange: {
        label: 'Date Range',
        min: new Date('2002-01-01'),
        max: new Date('2020-12-31'),
        default: [new Date('2002-01-01'), new Date('2020-12-31')]
    },
    
    regions: {
        label: 'Region',
        options: [
            { value: 'W1', label: 'W1 (West 1)' },
            { value: 'W2', label: 'W2 (West 2)' },
            { value: 'W3', label: 'W3 (West 3)' },
            { value: 'E1', label: 'E1 (East 1)' },
            { value: 'E2', label: 'E2 (East 2)' },
            { value: 'E3', label: 'E3 (East 3)' }
        ],
        default: ['W1', 'W2', 'W3', 'E1', 'E2', 'E3']
    },
    
    quality: {
        maxError: {
            label: 'Max Error (km)',
            min: 0,
            max: 20,
            step: 0.5,
            default: [0, 5]
        },
        gap: {
            label: 'Azimuthal Gap (°)',
            min: 0,
            max: 360,
            step: 10,
            default: [0, 150]
        },
        nsta: {
            label: 'Min Stations',
            min: 0,
            max: 50,
            step: 1,
            default: 3
        }
    }
};