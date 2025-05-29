import express from 'express';
import dotenv from 'dotenv';
import { configureCors } from './config/cors.config';
import { addTimesStamp, requestLogger } from './middlewares/custom.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(requestLogger);
app.use(addTimesStamp);

app.use(express.json());
app.use(configureCors());

// app.use(cors());


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});