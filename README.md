# Advanced Product Catalog

This repository contains a full-stack product catalog application with advanced features such as faceted navigation filters, pagination, sorting, and search functionality.

The project is organized into two main folders:
- **frontend** — React-based User Interface
- **backend** — Node.js/Express API server

---

## Features

- Product Listing with grid view
- Faceted filters (Categories, Brands, Color, Price Range)
- Dynamic filtering and search
- Pagination with page number navigation
- Product detail pages
- URL synchronization with filters, search, and pagination (deep linking)
- Responsive and user-friendly UI

---

## Prerequisites

- Node.js (v16 or later recommended)
- npm or yarn
- MySQL
- React
- Git

---
## Setup & Run

### 1. Clone the repository

```bash
git clone https://github.com/Lokesh97561/advanced-product-catalog.git
cd advance-product-catalog

cd backend
# Install dependencies
npm install
#Create database 'product_catalog' and table 'products' with schema using schema.sql dump giving in backend
#Insert data into Products table by this script
node src/seed/seed.js  
# Create a `.env` file in the backend folder with required environment variables:
# Example `.env` content:
# PORT=4000
# DB_HOST=localhost
# DB_USER=your_mysql_user
# DB_PASSWORD=your_mysql_password
# DB_NAME=product_catalog
# Start the backend server
npm start

cd ../frontend
# Install dependencies
npm install
# Add "proxy": "http://localhost:4000" in package.json
# Start the frontend React app
npm start
