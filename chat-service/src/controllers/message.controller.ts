import { Request, Response } from "express";
import logger from "../utils/logger";
import Message from "../models/Message";
import axios from "axios";

class MessageController {
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
      res.json(response.data);
    } catch (error) {
      logger.error("Error fetching users for sidebar:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };
}

export default MessageController;
