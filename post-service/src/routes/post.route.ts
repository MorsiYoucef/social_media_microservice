import express from 'express';
import { createPost } from '../controllers/post.controller';
import { authenticateRequest } from '../middlewares/auth.middleware';

const router = express.Router();


router.use(authenticateRequest);
router.post('/create-posts',createPost);

export default router;