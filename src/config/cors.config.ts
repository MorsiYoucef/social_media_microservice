import cors from 'cors';

export const configureCors = () => {
    return cors({
        origin: (origin, callback) => {
            const allowedOrigins = ['http://localhost:3000', 'https://custom-domain.com'];
            if( !origin || allowedOrigins.indexOf(origin) !== -1 ) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept-version'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        credentials: true, // Allow cookies to be sent with requests
        preflightContinue: false,
        maxAge: 600, // Cache preflight response for 10 minutes ==> avoid sending options requests multiple times
        optionsSuccessStatus: 204 // For legacy browser support
    })
}