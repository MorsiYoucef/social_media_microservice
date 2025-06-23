import { Request, Response } from "express";
import logger from "../utils/logger";
import Message from "../models/Message";
import axios from "axios";
import { getReceiverSocketId } from "../utils/socket";
import { io } from "../utils/socket";
import mongoose from "mongoose";

class MessageController {
  public static getUserId = async (req: Request, res: Response) => {
    logger.info("get userId endpoint hit!");
    try {
      const userId = req.user?.userId;
      if (!userId) {
        logger.warn("Access attempt without user ID");
        res.status(401).json({
          success: false,
          message: "User ID not provided",
        });
        return;
      }
      res.json({
        success: true,
        userId: userId
      })
    } catch (error) {
      logger.error("Error fetching userId:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
      
    }
      
  }
  public static getUsersForSidebar = async (req: Request, res: Response) => {
    logger.info("get users endpoint hit!");
    try {
      const authHeader = req.headers["authorization"];
      console.log("authHeader", authHeader);
      console.log("identity service url", process.env.IDENDITY_SERVICE_URL);
      const response = await axios.get(
        `${process.env.IDENDITY_SERVICE_URL}/users`,
        {
          headers: {
            Authorization: authHeader, // Forward the same header
          },
        }
      );
      res.json({data:response.data, userId:req.user?.userId});
    } catch (error) {
      logger.error("Error fetching users for sidebar:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };
  public static getMessages = async (req: Request, res: Response) => {
    logger.info("get messages endpoint hit!");
    try {
      const authHeader = req.headers["authorization"];
      console.log("authHeader", authHeader);
      const { id: receiverId } = req.params;
      const senderId = req.user?.userId;

      const messages = await Message.find({
        $or: [
          {
            senderId: new mongoose.Types.ObjectId(senderId),
            receiverId: new mongoose.Types.ObjectId(receiverId),
          },
          {
            senderId: new mongoose.Types.ObjectId(receiverId),
            receiverId: new mongoose.Types.ObjectId(senderId),
          },
        ],
      }).sort({ createdAt: 1 });

      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      logger.error("Error fetching messages:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };
  public static sendMessage = async (req: Request, res: Response) => {
    logger.info("send message endpoint hit!");
    try {
      const { text, mediaId } = req.body;
      const { id: receiverId } = req.params;
      const senderId = req.user?.userId;

      if (!senderId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const message = new Message({
        senderId: new mongoose.Types.ObjectId(senderId),
        receiverId: new mongoose.Types.ObjectId(receiverId),
        text: text || null,
        media: mediaId
          ? { url: mediaId, public_id: mediaId, type: "image" }
          : undefined,
      });
      await message.save();
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", message);
      }
      res.json({
        success: true,
        message: "Message sent successfully",
        data: message,
      });
    } catch (error) {
      logger.error("Error sending message:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };
}

export default MessageController;
