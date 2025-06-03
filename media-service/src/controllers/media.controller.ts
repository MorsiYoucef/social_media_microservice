import logger from "../utils/logger";
import { uploadMediaToCloudinary } from "../utils/cloudinary";
import Media from "../models/Media";

export const uploadMedia = async (req, res) =>{
    logger.info("Media upload endpoint hit...", { file: req.file });
    try {
        if (!req.file) {
            logger.warn("No file uploaded");
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        const  { originalName, mimeType, buffer} = req.file
        const userId = req.user.userId

        logger.info("Uploading media to Cloudinary", { originalName, mimeType });


        const media = await uploadMediaToCloudinary(req.file) as { public_id: string; [key: string]: any };
        logger.info("Media uploaded successfully to Cloudinary", media.public_id );

        const newlyCreateMedia = new Media({
            publicId: media.public_id,
            originalName,
            mimeType,
            url: media.secure_url,
            userId
        })
        await newlyCreateMedia.save();
        res.status(200).json({ message: "Media uploaded successfully", newlyCreateMedia });
    } catch (error) {
        logger.error("Error uploading media to Cloudinary", { error });
        res.status(500).json({ message: "Error uploading media" });
    }
}