import { Worker } from "bullmq";
import Redis from "ioredis";
import sendEmail from "./config/sendEmail.js"; // Import the sendEmail function
import dotenv from "dotenv";

dotenv.config();

const connection = new Redis(process.env.REDIS_URL,{
    maxRetriesPerRequest: null, //this will prevent the redis client from throwing an error when the connection is lost and will keep trying to reconnect
}); //create a connection to redis

const worker = new Worker("emailQueue", async (job) => { //worker for the emailQueue, it will process the jobs in the queue
    console.log("Job started for email:", job.data.email);
    const email=job.data.email;
    await sendEmail(email); //simulate the delay of sending email
    console.log(`Job completed successfully for email: ${email}`);
}, { connection }); //create a worker and connect it to redis

export default worker;