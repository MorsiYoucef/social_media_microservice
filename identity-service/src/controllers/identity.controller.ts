import { Request, Response } from "express";
import logger from "../utils/logger";
import { validateLogin, validateRegistration } from "../utils/validation";
import User from "../models/User";
import RefreshTokenModel from "../models/RefreshToken";
import { generateTokens } from "../utils/generateToken";
// import RefreshToken from "../models/RefreshToken";

// user registration
export const RegisterUser = async (req: Request, res: Response) => {
  logger.info("Registration endpoint hit", { body: req.body });
  try {
    const { error } = validateRegistration(req.body);

    if (error) {
      logger.warn("Validation error", error.details[0].message);
      res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    const { username, email, password } = req.body;
    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      logger.warn("User already exists");
      res.status(400).json({ success: false, message: "User already exists" });
    }
    user = new User({ username, email, password });
    await user.save();
    logger.info("User registered successfully", { userId: user._id });

    const { newAccessToken, newRefreshToken } = await generateTokens(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    logger.error("Error during user registration", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// user login

export const LoginUser = async (req: Request, res: Response) => {
  logger.info("Login endpoint hit...", { body: req.body });
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn("User not found");
      res.status(404).json({ success: false, message: "User not found" });
    }
    const isMatch = await user?.comparePassword(password);
    if (!isMatch) {
      logger.warn("Invalid password");
      res.status(401).json({ success: false, message: "Invalid password" });
    }
    logger.info("User logged in successfully", { userId: user?._id });
    const { newAccessToken, newRefreshToken } = await generateTokens(user);
    res.json({
      success: true,
      message: "User logged in successfully",
      data: {
        user: {
          id: user?._id,
          username: user?.username,
          email: user?.email,
        },
        accesToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    logger.error("Error during user login", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// refresh token

export const handleRefreshToken = async (req: Request, res: any) => {
  logger.info("Refresh token endpoint hit...");
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh token not provided");
      res
        .status(400)
        .json({ success: false, message: "Refresh token is required" });
    }
    // Validate and decode the refresh token
    const storedToken = await RefreshTokenModel.findOne({
      token: refreshToken,
    });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn("Invalid refresh token");
      res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }
    const user = await User.findById(storedToken?.user);
    if (!user) {
      logger.warn("User not found");
      res.status(404).json({ success: false, message: "User not found" });
    }
    const { newAccessToken, newRefreshToken } = await generateTokens(user);
    res.json({
      success: true,
      message: "Tokens refreshed successfully",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    logger.error("Error during token refresh", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// logout
export const LogoutUser = async (req: Request, res: any) => {
  logger.info("Logout endpoint hit...");
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh token not provided");
      res
        .status(400)
        .json({ success: false, message: "Refresh token is required" });
    }

    await RefreshTokenModel.deleteOne({ token: refreshToken });
    logger.info("User logged out successfully");
    res.json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    logger.error("Error during user logout", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
