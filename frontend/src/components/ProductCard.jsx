// src/components/ProductCard.jsx
import React from 'react';

export default function ProductCard({ product, onClick }) {
    return (
        <div className="product-card" onClick={() => onClick(product.id)} style={{ cursor: 'pointer', border: '1px solid #ddd', padding: '10px' }}>
            <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '150px', objectFit: 'contain' }} />
            <h3>{product.name}</h3>
            <p>₹{product.price}</p>
        </div>
    );
}
