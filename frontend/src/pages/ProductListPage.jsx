import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductList from '../components/ProductList';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import FacetedFilters from '../components/FacetedFilters';
import ActiveFilters from '../components/ActiveFilters';

export default function ProductListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const initializedRef = useRef(false);

    const parseFiltersFromParams = (params) => ({
        categories: params.get('categories')?.split(',').filter(Boolean) || [],
        brands: params.get('brands')?.split(',').filter(Boolean) || [],
        attrs: {
            color: (() => {
                try {
                    return JSON.parse(params.get('attrs') || '{}').color || [];
                } catch {
                    return [];
                }
            })(),
        },
        price_min: params.get('price_min') ? Number(params.get('price_min')) : null,
        price_max: params.get('price_max') ? Number(params.get('price_max')) : null,
    });

    // States
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        categories: [],
        brands: [],
        attrs: { color: [] },
        price_min: null,
        price_max: null,
    });
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const pageSize = 14;

    // Initialize state from URL params only once on mount
    useEffect(() => {
        if (!initializedRef.current) {
            const p = Number(searchParams.get('page'));
            setPage(isNaN(p) || p < 1 ? 1 : p);

            setSearch(searchParams.get('search') || '');

            setFilters(parseFiltersFromParams(searchParams));

            initializedRef.current = true;
        }
    }, []);

    // Update URL when page, search or filters change (but only after init)
    useEffect(() => {
        if (!initializedRef.current) return;

        const params = {};

        if (search) params.search = search;
        if (page && page > 1) params.page = page;
        if (filters.categories.length) params.categories = filters.categories.join(',');
        if (filters.brands.length) params.brands = filters.brands.join(',');
        if (filters.attrs.color.length) params.attrs = JSON.stringify({ color: filters.attrs.color });
        if (filters.price_min !== null) params.price_min = filters.price_min;
        if (filters.price_max !== null) params.price_max = filters.price_max;

        const newParamsStr = new URLSearchParams(params).toString();
        if (newParamsStr !== searchParams.toString()) {
            setSearchParams(params, { replace: true });
        }
    }, [page, search, filters]);

    // Fetch products from backend on page/search/filters change
    useEffect(() => {
        if (!initializedRef.current) return;

        setLoading(true);

        const params = new URLSearchParams();

        params.set('page', page);
        params.set('pageSize', pageSize);

        if (search) params.set('search', search);
        if (filters.categories.length) params.set('categories', filters.categories.join(','));
        if (filters.brands.length) params.set('brands', filters.brands.join(','));
        if (filters.attrs.color.length) params.set('attrs', JSON.stringify({ color: filters.attrs.color }));
        if (filters.price_min !== null) params.set('price_min', filters.price_min);
        if (filters.price_max !== null) params.set('price_max', filters.price_max);

        fetch(`/api/products?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setProducts(data.products || []);
                const totalCount = data.total || 0;
                setTotalCount(totalCount);
                setTotalPages(Math.ceil(totalCount / pageSize));
                setLoading(false);
            })
            .catch(err => {
                console.error('Fetch error:', err);
                setLoading(false);
            });
    }, [page, search, filters]);

    // Handlers
    const handlePageChange = (newPage) => {
        if (newPage !== page) setPage(newPage);
    };

    const handleSearch = (term) => {
        if (term !== search) {
            setPage(1);
            setSearch(term);
        }
    };

    const handleFilterChange = (newFilters) => {
        setPage(1);
        setFilters(prev => ({
            ...prev,
            ...newFilters,
            attrs: {
                color: newFilters.attrs?.color || prev.attrs.color || [],
            },
        }));
    };

    const handleRemoveFilter = (type, value) => {
        setPage(1);
        setFilters(prev => {
            const newFilters = { ...prev };
            if (type === 'categories') {
                newFilters.categories = prev.categories.filter(c => c !== value);
            } else if (type === 'brands') {
                newFilters.brands = prev.brands.filter(b => b !== value);
            } else if (type === 'attrs.color') {
                newFilters.attrs = {
                    ...prev.attrs,
                    color: prev.attrs.color.filter(c => c !== value),
                };
            } else if (type === 'price') {
                newFilters.price_min = null;
                newFilters.price_max = null;
            }
            return newFilters;
        });
    };

    const handleClearAllFilters = () => {
        setPage(1);
        setFilters({
            categories: [],
            brands: [],
            attrs: { color: [] },
            price_min: null,
            price_max: null,
        });
        setSearch('');
    };

    const handleProductClick = (id) => {
        navigate(`/product/${id}`);
    };

    return (
        <div style={{ display: 'flex', padding: 20 }}>
            <FacetedFilters filters={filters} onFilterChange={handleFilterChange} />
            <div style={{ flex: 1, marginLeft: 20 }}>
                <h1>Advanced Product Catalog</h1>
                <SearchBar initialSearch={search} onSearch={handleSearch} />
                <ActiveFilters filters={filters} onRemoveFilter={handleRemoveFilter} onClearAll={handleClearAllFilters} />
                {loading && <p>Loading products...</p>}
                {!loading && products.length === 0 && <p>No products found.</p>}
                {!loading && products.length > 0 && (
                    <>
                            <ProductList products={products} onProductClick={handleProductClick} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                                <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
                                <div style={{ fontSize: 16, color: '#555', marginLeft: 'auto', paddingLeft: '20px', marginTop: 10 }}>
                                    <h3>Total items: <strong>{totalCount}</strong></h3>
                                </div>
                            </div>
                    </>
                )}
            </div>
        </div>
    );
}
