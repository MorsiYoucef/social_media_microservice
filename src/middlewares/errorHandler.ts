import { Request, Response, NextFunction } from 'express';

// ✅ Custom error class
export class APIError extends Error {
    public statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'APIError';

        // Maintains proper stack trace for where our error was thrown 
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, APIError);
        }
    }
}

// Async handler 
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handler middleware
export const globalErrorHandler = (
    err: any,
    req: Request,
    res: any,
    next: NextFunction
) => {
    console.error(err.stack || err);

    // Handle custom API errors
    if (err instanceof APIError) {
        return res.status(err.statusCode).json({
            status: 'Error',
            message: err.message,
        });
    }

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'Error',
            message: err.message,
            errors: (err as any).errors,
        });
    }

    // Generic error fallback
    return res.status(500).json({
        status: 'Error',
        message: 'Internal Server Error',
    });
};
