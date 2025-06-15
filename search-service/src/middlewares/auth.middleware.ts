import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

// Extend Express Request interface to include 'user'
interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        // add other user properties if needed
    };
}

export const authenticateRequest = (req: Request, res: Response, next: NextFunction) => {
    const userIdHeader = req.headers['x-user-id'];
    const userId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;

    if (!userId) {
        logger.warn("Aceess attempt without user ID");
        res.status(401).json({ success: false, message: "User ID not provided" });
        return;
    }
    req.user = { userId }
    next();
}
