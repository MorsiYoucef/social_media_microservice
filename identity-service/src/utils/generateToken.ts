import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken';
dotenv.config();

export const generateTokens = async (user: any) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const accessToken = jwt.sign({
        id: user._id,   
        username: user.username,
        email: user.email
    }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Refresh token valid for 7 days

    await RefreshToken.create({
        user: user._id,
        token: refreshToken,
        expiresAt: expiresAt
    })
    return {newAccessToken: accessToken,newRefreshToken: refreshToken};
}