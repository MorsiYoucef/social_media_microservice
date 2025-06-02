import { Response, Request } from "express";
import logger from "../utils/logger";
import Post from "../models/Post";

// Extend Express Request interface to include 'user'
interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        // add other user properties if needed
    };
}

export const createPost = async (req: AuthenticatedRequest, res: any) => {
    try {
        const { content, mediaIds } = req.body;
        if (!content || !mediaIds) {
            return res.status(400).json({
                success: false,
                message: "Content and mediaIds are required"
            });
        }
        const newlyCreatedPost = new Post({
            user: req.user.userId,
            content,
            mediaIds: mediaIds || []
        });
        await newlyCreatedPost.save();
        logger.info("Post created successfully", newlyCreatedPost);
        res.status(201).json({
            success: true,
            message: "Post created successfully",
        })

    } catch (error) {
        logger.error("Error during post creation", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const getAllPosts = async (req: Request, res: Response) => {
    try {

    } catch (error) {
        logger.error("Error during post retrieval", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const getPost = async (req: AuthenticatedRequest, res: Response) => {
    try {


    } catch (error) {
        logger.error("Error during post retrieval", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const deletePost = async (req: Request, res: Response) => {
    try {

    } catch (error) {
        logger.error("Error during post deletion", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}









