import express from 'express';
import { asyncHandler } from '../middlewares/errorHandler';

const router = express.Router();

const items = [
    { id: 1, name: 'Item 1', price: 10 },
    { id: 2, name: 'Item 2', price: 20 },
    { id: 3, name: 'Item 3', price: 30 },
    { id: 4, name: 'Item 4', price: 30 },
    { id: 5, name: 'Item 5', price: 30 },
]

router.get('/items', asyncHandler(async (req, res) => {
    res.json(items);
}))

export default router;