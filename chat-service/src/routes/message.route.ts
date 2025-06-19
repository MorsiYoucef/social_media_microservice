import express from 'express'
import { authenticateRequest } from '../middlewares/auth.middleware';
import MessageController from '../controllers/message.controller';
const router = express.Router();


router.get("/users", authenticateRequest, MessageController.getUsersForSidebar)


export default router