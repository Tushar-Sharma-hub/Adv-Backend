import { Queue } from "bullmq";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const connection = new Redis(process.env.REDIS_URL,{
    maxRetriesPerRequest: null, //this will prevent the redis client from throwing an error when the connection is lost and will keep trying to reconnect
}); //create a connection to redis

const emailQueue = new Queue("emailQueue", { connection }); //create a queue named email and connect it to redis

export default emailQueue;