-- backend/src/schema.sql
CREATE DATABASE IF NOT EXISTS product_catalog;
USE product_catalog;

DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(512) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  image_url VARCHAR(1000),
  brand VARCHAR(255),
  categories JSON,        -- JSON array of strings
  attrs JSON,             -- JSON object for dynamic attributes, e.g. {"color":"Red","memory_gb":16}
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT KEY ft_name_desc (name, description),
  INDEX idx_brand (brand),
  INDEX idx_price (price)
);

-- Helpful function: ensure categories default to JSON array when omitted
