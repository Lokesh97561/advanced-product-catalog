import React from 'react';
import ProductCard from './ProductCard';

export default function ProductList({ products, onProductClick }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '15px' }}>
            {products.map(product => (
                <ProductCard key={product.id} product={product} onClick={onProductClick} />
            ))}
        </div>
    );
}
