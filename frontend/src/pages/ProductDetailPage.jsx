import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ProductDetailPage() {
    const { id } = useParams(); // get product id from URL
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`/api/products/${id}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Product not found');
                }
                return res.json();
            })
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || 'Error fetching product');
                setLoading(false);
            });
    }, [id]);

    if (loading) return <p>Loading product details...</p>;

    if (error) return (
        <div style={{ padding: '20px' }}>
            <button onClick={() => navigate(-1)}>← Back to products</button>
            <p style={{ color: 'red' }}>{error}</p>
        </div>
    );

    return (
        <div style={{ padding: '20px' }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
                ← Back to products
            </button>

            <h1>{product.name}</h1>
            <img
                src={product.image_url}
                alt={product.name}
                style={{ maxWidth: '300px', marginBottom: '20px' }}
            />

            <p><strong>Price:</strong> ${product.price}</p>
            <p><strong>Description:</strong> {product.description}</p>
            <p><strong>Brand:</strong> {product.brand}</p>
            <p><strong>Categories:</strong> {product.categories.join(', ')}</p>

            {product.attrs && Object.entries(product.attrs).map(([key, val]) => (
                <p key={key}>
                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{' '}
                    {Array.isArray(val) ? val.join(', ') : val}
                </p>
            ))}
        </div>
    );
}
