import express from 'express';
import {searchPost} from '../controllers/search.controller'
import { authenticateRequest } from '../middlewares/auth.middleware';

const router = express.Router()

router.use(authenticateRequest);
router.get('/posts', searchPost)

export default router