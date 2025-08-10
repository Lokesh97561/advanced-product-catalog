import React, { useState, useEffect } from 'react';

export default function FacetedFilters({ filters, onFilterChange }) {
    const categoriesOptions = ['Electronics', 'Apparel', 'Books', 'Home & Kitchen'];
    const brandsOptions = ['Brand1','Brand2','Brand41','Sony', 'Samsung', 'Nike', 'HP'];
    const colorOptions = ['Red', 'Blue', 'Green', 'Black'];
    const priceRanges = [
        { label: '$0-50', min: 0, max: 50 },
        { label: '$50-100', min: 50, max: 100 },
        { label: 'Above $100', min: 100, max: null },
    ];

    const [selectedCategories, setSelectedCategories] = useState(filters.categories || []);
    const [selectedBrands, setSelectedBrands] = useState(filters.brands || []);
    const [selectedColors, setSelectedColors] = useState(filters.attrs.color || []);
    const [selectedPriceRange, setSelectedPriceRange] = useState({
        min: filters.price_min,
        max: filters.price_max,
    });

    useEffect(() => {
        setSelectedCategories(filters.categories || []);
        setSelectedBrands(filters.brands || []);
        setSelectedColors(filters.attrs.color || []);
        setSelectedPriceRange({
            min: filters.price_min,
            max: filters.price_max,
        });
    }, [filters]);

    const toggleSelection = (array, value) =>
        array.includes(value) ? array.filter(item => item !== value) : [...array, value];

    const onCategoryToggle = (cat) => {
        const newCats = toggleSelection(selectedCategories, cat);
        setSelectedCategories(newCats);
        onFilterChange({ categories: newCats });
    };

    const onBrandToggle = (brand) => {
        const newBrands = toggleSelection(selectedBrands, brand);
        setSelectedBrands(newBrands);
        onFilterChange({ brands: newBrands });
    };

    const onColorToggle = (color) => {
        const newColors = toggleSelection(selectedColors, color);
        setSelectedColors(newColors);
        onFilterChange({ attrs: { color: newColors } });
    };

    const onPriceRangeChange = (range) => {
        setSelectedPriceRange({ min: range.min, max: range.max });
        onFilterChange({ price_min: range.min, price_max: range.max });
    };

    const clearPriceFilter = () => {
        setSelectedPriceRange({ min: null, max: null });
        onFilterChange({ price_min: null, price_max: null });
    };

    return (
        <div style={{ padding: '10px', borderRight: '1px solid #ccc', minWidth: '220px' }}>
            <h3>Filters</h3>

            <div>
                <h4>Categories</h4>
                {categoriesOptions.map(cat => (
                    <label key={cat} style={{ display: 'block' }}>
                        <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => onCategoryToggle(cat)}
                        />
                        {cat}
                    </label>
                ))}
            </div>

            <div>
                <h4>Brands</h4>
                {brandsOptions.map(brand => (
                    <label key={brand} style={{ display: 'block' }}>
                        <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => onBrandToggle(brand)}
                        />
                        {brand}
                    </label>
                ))}
            </div>

            <div>
                <h4>Price Range</h4>
                {priceRanges.map(range => (
                    <label key={range.label} style={{ display: 'block' }}>
                        <input
                            type="radio"
                            name="priceRange"
                            checked={
                                selectedPriceRange.min === range.min &&
                                selectedPriceRange.max === range.max
                            }
                            onChange={() => onPriceRangeChange(range)}
                        />
                        {range.label}
                    </label>
                ))}
                <button onClick={clearPriceFilter}>Clear Price</button>
            </div>

            <div>
                <h4>Color</h4>
                {colorOptions.map(color => (
                    <label key={color} style={{ display: 'block' }}>
                        <input
                            type="checkbox"
                            checked={selectedColors.includes(color)}
                            onChange={() => onColorToggle(color)}
                        />
                        {color}
                    </label>
                ))}
            </div>
        </div>
    );
}
