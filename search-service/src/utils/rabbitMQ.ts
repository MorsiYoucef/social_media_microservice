import { connect, Connection, Channel } from 'amqplib';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

let connection = null;
let channel: Channel | null = null;

const EXCHANGE_NAME = 'facebook_events';

export const connectToRabbitMQ = async (): Promise<Channel> => {
    try {
        const rabbitUrl = process.env.RABBITMQ_URL;
        if (!rabbitUrl) {
            throw new Error('RABBITMQ_URL environment variable is not defined');
        }

        const conn = await connect(rabbitUrl);
        const ch: Channel = await conn.createChannel();

        await ch.assertExchange(EXCHANGE_NAME, 'topic', { durable: false });

        connection = conn;
        channel = ch;

        logger.info('Connected to RabbitMQ');
        return ch;
    } catch (error) {
        logger.error('Error connecting to RabbitMQ:', error);
        throw error;
    }
};

export const consumeEvent = async (routingKey: string, callback: (content: any) => void) => {
    if(!channel){
        await connectToRabbitMQ();
    }
    if (!channel) {
        throw new Error('Channel is not initialized');
    }
    const q = await channel.assertQueue("",{ exclusive: true})
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey)
    channel.consume(q.queue, (msg)=>{
        if (msg && msg.content) {
            const content = JSON.parse(msg.content.toString());
            callback(content);
            channel?.ack(msg);
        }
    })
    logger.info(`Consumed messages from ${routingKey}`);
}
