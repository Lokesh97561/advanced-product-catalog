import React from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    const pages = [];

    // Show max 5 pages around current page
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div style={{ marginTop: '20px' }}>
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                Prev
            </button>

            {pages.map(page => (
                <button
                    key={page}
                    style={{ fontWeight: page === currentPage ? 'bold' : 'normal', margin: '0 5px' }}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </button>
            ))}

            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Next
            </button>
        </div>
    );
}
