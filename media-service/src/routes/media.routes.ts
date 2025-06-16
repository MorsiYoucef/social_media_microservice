    import express, { NextFunction, Request, Response } from 'express';
    import multer from'multer';
    import logger from '../utils/logger';
    import { authenticateRequest } from '../middlewares/auth.middleware';
    import MediaController from '../controllers/media.controller';

    const router = express.Router();

    const upload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }).single('file');

    router.post(
      "/upload",
      authenticateRequest,
      (req: Request, res: Response, next: NextFunction) => {
        upload(req, res, (err) => {
          if (err instanceof multer.MulterError) {
            logger.error("Error during file upload", err);
            res
              .status(400)
              .json({
                success: false,
                message: "Invalid file format",
                error: err.message,
                stack: err.stack,
              });
            return;
          } else if (err) {
            logger.error("Unknown Error during file upload", err);
            res
              .status(500)
              .json({ success: false, message: "Internal Server Error" });
            return;
          }

          if (!req.file) {
            res
              .status(400)
              .json({ success: false, message: "No file uploaded" });
            return;
          }
          next();
        });
      },
      MediaController.uploadMedia
    );

    router.get("/all-media", authenticateRequest, MediaController.getAllMedia)

    export default router;