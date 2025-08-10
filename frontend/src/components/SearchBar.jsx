import React, { useState, useEffect, useRef } from 'react';

export default function SearchBar({ initialSearch = '', onSearch }) {
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const isFirstRun = useRef(true);

    useEffect(() => {
        setSearchTerm(initialSearch);
    }, [initialSearch]);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        const handler = setTimeout(() => {
            onSearch(searchTerm.trim());
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, onSearch]);

    return (
        <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 20, fontSize: 16 }}
        />
    );
}
