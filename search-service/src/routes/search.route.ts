import express from 'express';
import { authenticateRequest } from '../middlewares/auth.middleware';
import SearchController from '../controllers/search.controller';

const router = express.Router()

router.use(authenticateRequest);
router.get("/posts", SearchController.searchPost);

export default router