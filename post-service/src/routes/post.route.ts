import express from 'express';
import { createPost, deletePost, getAllPosts, getPost } from '../controllers/post.controller';
import { authenticateRequest } from '../middlewares/auth.middleware';

const router = express.Router();


router.use(authenticateRequest);
router.post('/create-posts',createPost);
router.get('/all-posts', getAllPosts);
router.get('/:id', getPost); // Assuming getPostById is implemented elsewhere
router.delete('/:id', deletePost);

export default router;