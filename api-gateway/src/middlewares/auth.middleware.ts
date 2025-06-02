import { NextFunction,Request,Response } from "express";
import logger from "../utils/logger";
import  jwt  from "jsonwebtoken";


export const validateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        logger.info("Access attempt without valide token!");
        return res.status(401).json({ succss: false,message: "Token is required" });
    }
    jwt.verify(token, process.env.JWT_SECRET || '', (err: any, user: any) => {
        if (err) {
            logger.info("Invalid token!");
            return res.status(403).json({ success: false, message: "Invalid token" });
        }
        req.user = user;
        next();
    });
}