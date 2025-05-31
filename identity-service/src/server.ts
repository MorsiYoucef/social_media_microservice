import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import logger from './utils/logger';
import helmet from 'helmet';
import cors from 'cors';

dotenv.config();

const app = express();


mongoose.connect(process.env.MONGO_URI as string)
.then(() => logger.info("Connected to MongoDB"))
.catch(e => logger.error("MongoDB connection error:", e));


/** 
 * !XSS is when an attacker injects malicious JavaScript into a website — and that script runs in other users' browsers.
 * !Clickjacking is when a malicious site loads your site inside a hidden iframe, tricking users into clicking buttons they don’t see.
 * !MIME-sniffing is when a browser tries to guess the file type (MIME type) of a response — even if the server tells it otherwise.
 * !Injection is when untrusted data is sent to a command interpreter, like a database, in a way that changes its behavior.
 * !CORS (Cross-Origin Resource Sharing) is a security feature in browsers that restricts access between different origins (domains).
 * !🔐 Helmet sets secure headers to prevent or reduce these threats.
 */
app.use(helmet());
app.use(cors());
/** 
 * !A brute force attack is when a hacker tries to guess a username + password or token by repeatedly trying thousands or millions of combinations.
 * !A DDoS attack floods your server with a massive amount of fake traffic, often from many computers at once (a botnet)
 */
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body: ${(req.body)}`);
    next();
})
