import { Request, Response } from "express";
import logger from "../utils/logger";
import Message from "../models/Message";

class MessageController {
    public static getUsersForSidebar = async (req: Request, res: Response) => {
        logger.info("Chat endpoint hit!");
        try {
            
        } catch (error) {
            
        }
    }
}



export default MessageController