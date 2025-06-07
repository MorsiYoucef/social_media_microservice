import Media from "../models/Media";
import { deleteMediaFromCloudinary } from "../utils/cloudinary";
import logger from "../utils/logger";


export const handlePostDeleted = async (event: any) =>{
    console.log(event, "event")
    const { postId, mediaIds  } = event;
    try {
        const mediaDelete = await Media.find({ _id: { $in: mediaIds } });
        for( const media of mediaDelete) {
            await deleteMediaFromCloudinary(media.publicId);
            await Media.findByIdAndDelete(media._id);
            logger.info(`Media deleted ${media._id} associated with the post ${postId}`);
        }
        logger.info("Media deleted successfully from cloudinary", postId);
        
    } catch (error) {
        logger.error("Error during post deletion", error);
        
    }
}