import express, { NextFunction, Request, Response } from 'express';
import multer from'multer';
import logger from '../utils/logger';
import { authenticateRequest } from '../middlewares/auth.middleware';
import { getAllMedia, uploadMedia } from '../controllers/media.controller';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('file');

router.post("/upload", authenticateRequest, (req: Request, res: any, next: NextFunction) =>{
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            logger.error("Error during file upload", err);
            return res.status(400).json({ success: false, message: "Invalid file format", error: err.message, stack: err.stack });
        }else if(err){
            logger.error("Unknown Error during file upload", err);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }

        if(!req.file){
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        next()
    });
}, uploadMedia)

router.get("/all-media", authenticateRequest, getAllMedia)

export default router;