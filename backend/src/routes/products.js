// backend/src/routes/products.js
import express from 'express';
import {getProduct, getProducts} from '../controllers/productsController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProduct);

export default router;
