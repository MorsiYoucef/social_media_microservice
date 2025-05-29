import express from 'express';
import dotenv from 'dotenv';
import { configureCors } from './config/cors.config';
import { addTimesStamp, requestLogger } from './middlewares/custom.middleware';
import { globalErrorHandler } from './middlewares/errorHandler';
import { urlVersioning } from './middlewares/apiVersionning';

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
app.use(configureCors());

app.use('/api/v1', urlVersioning('v1') )

app.use(globalErrorHandler);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});