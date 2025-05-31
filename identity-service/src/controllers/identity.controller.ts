import { Request, Response } from "express";
import logger from "../utils/logger";
import { validateRegistration } from "../utils/validation";
import User from "../models/User";
import { generateTokens } from "../utils/generateToken";


// user registration
export const RegisterUser = async (req: Request, res: any) => {
    logger.info("Registration endpoint hit", { body: req.body });
    try {
        const { error } = validateRegistration(req.body);

        if (error) {
            logger.warn("Validation error", error.details[0].message);
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const { username, email, password } = req.body;
        let user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) {
            logger.warn("User already exists");
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        user = new User({ username, email, password });
        await user.save();
        logger.info("User registered successfully", { userId: user._id });

        const {accessToken, refreshToken} = await generateTokens(user);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        logger.error("Error during user registration", { error: error instanceof Error ? error.message : "Unknown error" });
        return res.status(500).json({ success: false, message: "Internal Server Error" });

    }
}


// user login



// refresh token


// logout