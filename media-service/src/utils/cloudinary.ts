import cloudinary from 'cloudinary';
import logger from './logger'
import dotenv from 'dotenv';

dotenv.config();


cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export const uploadMediaToCloudinary = (file : any) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream({ resource_type: "auto" }, (err, result) => {
            if (err) {
                logger.error('Error uploading media to cloudinary:', err)
                reject(err)
            } else {
                resolve(result)
            }
        })
        uploadStream.end(file.buffer)
    })
}

export const deleteMediaFromCloudinary = async (publicId : string) => {
    try {
        const result = await cloudinary.v2.uploader.destroy(publicId);
        logger.info('Media deleted successfully from cloudinary', publicId);
        return result;
        
    } catch (error) {
        logger.error('Error deleting media from cloudinary:', error)
        throw error
        
    }
}