import { Request, Response } from "express";
import logger from "../utils/logger";
import { validateLogin, validateRegistration } from "../utils/validation";
import User from "../models/User";
import RefreshTokenModel from "../models/RefreshToken";
import { generateTokens } from "../utils/generateToken";

class AuthController {
  // User registration
  public static register = async (req: Request, res: Response) => {
    logger.info("Registration endpoint hit", { body: req.body });

    try {
      // Input validation
      const { error } = validateRegistration(req.body);
      if (error) {
        logger.warn("Validation error", error.details[0].message);
        res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const { username, email, password } = req.body;

      // Check for existing user
      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });
      if (existingUser) {
        logger.warn("User already exists");
        res.status(409).json({
          success: false,
          message: "Username or email already exists",
        });
      }

      // Create new user
      const newUser = new User({ username, email, password });
      await newUser.save();
      logger.info("User registered successfully", { userId: newUser._id });

      // Generate tokens
      const { newAccessToken, newRefreshToken } = await generateTokens(newUser);

      // Return response
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
          },
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      logger.error("Error during user registration", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  };

  // User login
  public static login = async (req: Request, res: Response) => {
    logger.info("Login endpoint hit", { body: req.body });

    try {
      // Input validation
      const { error } = validateLogin(req.body);
      if (error) {
        logger.warn("Validation error", error.details[0].message);
        res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        logger.warn("User not found for email", { email });
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      // Validate password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        logger.warn("Invalid password attempt", { userId: user._id });
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Generate tokens
      const { newAccessToken, newRefreshToken } = await generateTokens(user);
      logger.info("User logged in successfully", { userId: user._id });

      // Return response
      res.json({
        success: true,
        message: "Login successful",
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
      logger.error("Error during user login", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  };

  // Refresh token
  public static refreshToken = async (req: Request, res: Response) => {
    logger.info("Refresh token endpoint hit");

    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        logger.warn("Refresh token not provided");
        res.status(400).json({
          success: false,
          message: "Refresh token is required",
        });
      }

      // Find valid token
      const storedToken = await RefreshTokenModel.findOne({
        token: refreshToken,
      }).populate("user");

      // Validate token existence and expiration
      if (!storedToken || storedToken.expiresAt < new Date()) {
        logger.warn("Invalid or expired refresh token");
        res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
        return;
      }

      // Generate new tokens
      const { newAccessToken, newRefreshToken } = await generateTokens(
        storedToken.user
      );

      // Return new tokens
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
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  };

  // User logout
  public static logout = async (req: Request, res: Response) => {
    logger.info("Logout endpoint hit");

    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        logger.warn("Refresh token not provided");
        res.status(400).json({
          success: false,
          message: "Refresh token is required",
        });
      }

      // Delete refresh token
      const result = await RefreshTokenModel.deleteOne({ token: refreshToken });

      if (result.deletedCount === 0) {
        logger.warn("Refresh token not found during logout");
        res.status(404).json({
          success: false,
          message: "Token not found",
        });
      }

      logger.info("User logged out successfully");
      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      logger.error("Error during user logout", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  };

  public static getAllUsers = async (req: Request, res: Response) => {
    try {
      // Pagination params
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const cacheKey = `users:page:${page}:limit:${limit}`;
      const cachedUsers = await req?.RedisClient?.get(cacheKey);

      console.log("cache data:", req);


      if (cachedUsers) {
        logger.info("Users retrieved from cache", { cacheKey });
        res.json({
          success: true,
          source: "cache",
          ...JSON.parse(cachedUsers),
        });
        return;
      }

      
      // Fetch from DB
      const users = await User.find({}, { username: 1, email: 1 }).skip(skip).limit(limit);
      const totalUsers = await User.countDocuments();
      const totalPages = Math.ceil(totalUsers / limit);
      const result = {
        users,
        page,
        totalPages,
        totalUsers,
      };
      // Cache the result
      await req?.RedisClient?.setex(
        cacheKey,
        300,
        JSON.stringify(result)
      );
      logger.info('Users fetched from DB and cached');
      res.json({ success: true, source: 'db', ...result });
    } catch (error) {
      logger.error('Error fetching users', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

export default AuthController;
