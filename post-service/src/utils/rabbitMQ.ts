import amqp from 'amqplib';
import logger from './logger';
import dotenv from 'dotenv';

dotenv.config();


let connection = null;
let channel = null;

const EXCHANGE_NAME = 'facebook_events';

export const connectToRabbitMQ = async () => {
    try {
        
        const rabbitUrl = process.env.RABBITMQ_URL;
        if (!rabbitUrl) {
            throw new Error('RABBITMQ_URL environment variable is not defined');
        }
        connection = await amqp.connect(rabbitUrl);
        channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: false });
        return channel;
    } catch (error) {
        logger.error('Error connecting to RabbitMQ', error);
        throw error;
        
    }
}