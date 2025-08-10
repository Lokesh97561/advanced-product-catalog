import React from 'react';

export default function ActiveFilters({ filters, onRemoveFilter, onClearAll }) {
    const renderFilterChips = () => {
        const chips = [];

        filters.categories.forEach(cat => {
            chips.push({
                label: `Category: ${cat}`,
                type: 'categories',
                value: cat,
            });
        });

        filters.brands.forEach(brand => {
            chips.push({
                label: `Brand: ${brand}`,
                type: 'brands',
                value: brand,
            });
        });

        (filters.attrs.color || []).forEach(color => {
            chips.push({
                label: `Color: ${color}`,
                type: 'attrs.color',
                value: color,
            });
        });

        if (filters.price_min !== null || filters.price_max !== null) {
            let label = 'Price: ';
            if (filters.price_min !== null && filters.price_max !== null) {
                label += `$${filters.price_min} - $${filters.price_max}`;
            } else if (filters.price_min !== null) {
                label += `Above $${filters.price_min}`;
            } else if (filters.price_max !== null) {
                label += `Below $${filters.price_max}`;
            }
            chips.push({
                label,
                type: 'price',
                value: { min: filters.price_min, max: filters.price_max },
            });
        }

        return chips;
    };

    const chips = renderFilterChips();

    if (chips.length === 0) return null;

    return (
        <div style={{ marginBottom: '15px' }}>
            <strong>Active Filters:</strong>
            <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
                {chips.map(({ label, type, value }, idx) => (
                    <div
                        key={idx}
                        style={{
                            padding: '5px 10px',
                            backgroundColor: '#eee',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        onClick={() => onRemoveFilter(type, value)}
                        title="Click to remove filter"
                    >
                        <span>{label}</span>
                        <span style={{ marginLeft: '6px', fontWeight: 'bold' }}>×</span>
                    </div>
                ))}
                <button
                    style={{ marginLeft: '10px', padding: '5px 10px' }}
                    onClick={onClearAll}
                >
                    Clear All
                </button>
            </div>
        </div>
    );
}
