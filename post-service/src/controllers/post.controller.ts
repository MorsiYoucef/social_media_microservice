import { Response, Request } from "express";
import logger from "../utils/logger";
import Post from "../models/Post";
import { validateCreatePost } from "../utils/validation";
import Redis from "ioredis";
import { publishEvent } from "../utils/rabbitMQ";


class PostController {
  public static createPost = async (req: Request, res: Response) => {
    logger.info("Create post endpoint hit...", { body: req.body });
    try {
      const { error } = validateCreatePost(req.body);
      if (error) {
        logger.warn("Validation error", error.details[0].message);
        res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }
      const { content, mediaIds } = req.body;
      if (!content || !mediaIds) {
        res.status(400).json({
          success: false,
          message: "Content and mediaIds are required",
        });
      }
      const newlyCreatedPost = new Post({
        user: req.user.userId,
        content,
        mediaIds: mediaIds || [],
      });
      await newlyCreatedPost.save();

      await publishEvent(
        "post.created",
        JSON.stringify({
          postId: (
            newlyCreatedPost._id as string | { toString(): string }
          ).toString(),
          userId: (
            newlyCreatedPost.user as string | { toString(): string }
          ).toString(),
          content: newlyCreatedPost.content,
          createAt: newlyCreatedPost.createdAt,
        })
      );
      await this.invalidatePostCashe(req, newlyCreatedPost._id as string);
      logger.info("Post created successfully", newlyCreatedPost);
      res.status(201).json({
        success: true,
        message: "Post created successfully",
      });
    } catch (error) {
      logger.error("Error during post creation", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };

  public static getAllPosts = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const startIndex = (page - 1) * limit;

      const cacheKey = `posts:${page}:${limit}`;
      const cachedPosts = await req?.RedisClient?.get(cacheKey);
      console.log("Cache posts:", cachedPosts);

      if (cachedPosts) {
        logger.info("Post retrieved from cache", { cacheKey });
        res.json(JSON.parse(cachedPosts));
        return;
      }
      const posts = await Post.find({})
        .sort({ createdAt: -1 })
        .skip(startIndex)
        .limit(limit);

      const totalNumPosts = await Post.countDocuments();
      const result = {
        posts,
        currentPage: page,
        totalPages: Math.ceil(totalNumPosts / limit),
        totalPosts: totalNumPosts,
      };
      await req?.RedisClient?.setex(cacheKey, 300, JSON.stringify(result));

      res.json(result);
    } catch (error) {
      logger.error("Error during post retrieval", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  public static getPost = async (req: Request, res: Response) => {
    try {
      const postId = req.params.id;
      const cashedKey = `post:${postId}`;
      const cachedPost = await req?.RedisClient?.get(cashedKey);
      if (cachedPost) {
        logger.info("Post retrieved from cache", { cashedKey });
        res.json(JSON.parse(cachedPost));
      }
      const postDetailsById = await Post.findById(postId);
      if (!postDetailsById) {
        res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }
      await req?.RedisClient?.setex(
        cashedKey,
        3600,
        JSON.stringify(postDetailsById)
      );
      res.json(postDetailsById);
    } catch (error) {
      logger.error("Error during post retrieval", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  public static deletePost = async (req: Request, res: Response) => {
    try {
      const postId = req.params.id;
      if (!req.user || !(req.user as any).userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized: User information missing",
        });
      }
      const userId = (req.user as any).userId;
      const postToDelete = await Post.findOneAndDelete({
        _id: postId,
        user: userId,
      });
      if (!postToDelete) {
        res.status(404).json({
          success: false,
          message: "Post not found",
        });
        return;
      }
  
      // publish post delete method
      await publishEvent(
        "post.deleted",
        JSON.stringify({
          postId: (
            postToDelete._id as string | { toString(): string }
          ).toString(),
          userId: (req.user as { userId: string }).userId,
          mediaIds: postToDelete.mediaIds,
        })
      );
      await this.invalidatePostCashe(req, postId as string);
      res.json({
        success: true,
        message: "Post deleted successfully",
      });
    } catch (error) {
      logger.error("Error during post deletion", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });

    }
  }

  private static invalidatePostCashe = async (req: Request, input: string) => {
    const cashedKey = `posts:${input}`;
    await req?.RedisClient?.del(cashedKey);

    const keys = await req?.RedisClient?.keys("posts:*");
    if (!keys) {
      return logger.error("Keys is underfined");
    }
    if (keys.length > 0) {
      await req?.RedisClient?.del(keys);
    }
  };
}



export default PostController;