import express from 'express';
import dotenv from 'dotenv';
import { configureCors } from './config/cors.config';
import { addTimesStamp, requestLogger } from './middlewares/custom.middleware';
import { globalErrorHandler } from './middlewares/errorHandler';
import { urlVersioning } from './middlewares/apiVersionning';
import { createBasicRateLimiter } from './middlewares/rateLimiting';
import itemRoutes from './routes/item-routes';
import { connectRedis } from './middlewares/redis.config';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to log requests and add timestamps
//Why Use It:
//For debugging: Helps you see what’s happening in real time
//For monitoring: Understand how users are interacting with your server
app.use(requestLogger);
app.use(addTimesStamp);

app.use(express.json());
app.use(createBasicRateLimiter(100, 15*60*1000)); // 100 requests per 15 minutes
app.use(configureCors());

app.use(urlVersioning('v1') )
app.use('/api/v1', itemRoutes);

app.use(globalErrorHandler);
connectRedis();


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});