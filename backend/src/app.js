// backend/src/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productsRouter from './routes/products.js';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// health
app.get('/', (req,res) => res.send('Product Catalog API (MySQL)'));

// products
app.use('/api/products', productsRouter);

export default app;
