import { Request, Response } from "express";
import logger from "../utils/logger";
import Search from "../models/Search";

export const searchPost = async (req: Request, res: Response) => {
  logger.info("Search endpoint hit!");
  try {
    const { query } = req.query;
    if (typeof query !== "string") {
      res
        .status(400)
        .json({ error: "Query parameter is required and must be a string." });
        return
    }
    const results = await Search.find(
      {
        $text: { $search: query },
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);

    res.status(200).json({
      message: "login succefull", // Typo and unrelated
      sucess: true, // Typo: "success"
    });
  } catch (error) {
    logger.error("Error during Searcg Post", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
