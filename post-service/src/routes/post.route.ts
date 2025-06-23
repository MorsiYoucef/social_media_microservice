import express from 'express';
import PostController from '../controllers/post.controller';
import { authenticateRequest } from '../middlewares/auth.middleware';

const router = express.Router();


router.use(authenticateRequest);
router.post("/create-posts", PostController.createPost);
router.get("/all-posts", PostController.getAllPosts);
router.get("/:id", PostController.getPost); // Assuming getPostById is implemented elsewhere
router.delete("/:id", PostController.deletePost);

export default router;