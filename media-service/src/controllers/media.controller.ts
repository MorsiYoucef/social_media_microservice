import logger from "../utils/logger";
import { uploadMediaToCloudinary } from "../utils/cloudinary";
import Media from "../models/Media";
import { Request, Response } from "express";
import cloundinary from "cloudinary";

// interface FileReq extends Request {
//   originalname?: string;
//   mimetype?: string;
// }

class MediaController {
  public static uploadMedia = async (req: Request, res: Response) => {
    logger.info("Media upload endpoint hit...");
    try {
      if (!req.file) {
        logger.warn("No file uploaded");
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
      }
      const { originalname, mimetype } = req.file;
      const userId = req?.user?.userId;

      logger.info("Uploading media to Cloudinary", { originalname, mimetype });

      const media = (await uploadMediaToCloudinary(req.file)) as {
        public_id: string;
        [key: string]: any;
      };
      logger.info("Media uploaded successfully to Cloudinary", media.public_id);

      const newlyCreateMedia = new Media({
        publicId: media.public_id,
        originalName: originalname,
        mimeType: mimetype,
        url: media.secure_url,
        userId,
      });
      await newlyCreateMedia.save();
      res
        .status(200)
        .json({ message: "Media uploaded successfully", newlyCreateMedia });
    } catch (error: any) {
      logger.error("Error uploading media to Cloudinary", error);
      res.status(500).json({ message: "Error uploading media" });
    }
  };

  public static getAllMedia = async (req: Request, res: Response) => {
    try {
      const media = await Media.find({});
      res.status(200).json({ success: true, media });
    } catch (error) {
      logger.error("Error getting all media", error);
      res.status(500).json({ success: false, message: "Error getting media" });
    }
  };
}

export default MediaController
