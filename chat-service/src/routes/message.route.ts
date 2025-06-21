import express from 'express'
import { authenticateRequest } from '../middlewares/auth.middleware';
import MessageController from '../controllers/message.controller';
const router = express.Router();

router.use(authenticateRequest);
router.get("/users", MessageController.getUsersForSidebar)


export default router