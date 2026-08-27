import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // Import the connectDB function
import User from "./model/user.model.js"; // Import the User model
import Redis from "ioredis"; 
import rateLimitter from "./middleware/rateLimit.js"; // Import the rateLimitter middleware
import emailQueue from "./queue.js"; // Import the emailQueue
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
export const redis = new Redis(process.env.REDIS_URL);

app.use(express.json()); // Middleware to parse JSON request bodies
app.get("/", (req, res) => {
    res.send(`Hello from server ${process.env.SERVER_NAME}! `);
});

app.post("/create", async (req, res) => {
    const {name,email,password} = req.body;
    //when new user is created , delete the cache of all users in redis
    await redis.del("user:all");
    const user = await User.create({
        name,
        email,
        password
    });
    await emailQueue.add("sendEmail", { email }); //add the job to the queue, it will be processed by the worker
    return res.status(201).json({
        success: true,
        message: "User created successfully",
        user
    });
});

app.get("/get", rateLimitter, async (req, res) => {
    const users = await User.find({});
    return res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        users
    });
});

app.get("/get-with-redis", async (req, res) => {
    //check if redis has the data
    const cached = await redis.get("user:all");
    //if redis has the data, return it
    if(cached){
        const user=JSON.parse(cached);
        return res.json(user);
    }
    //if redis does not have the data, fetch it from mongo and store it in redis
    const user = await User.find({});
    await redis.set("user:all", JSON.stringify(user));
    return res.json(user);
})

app.post("/send-otp",async (req,res)=>{
    const {email} = req.body;
    //generate a random 6 digit number
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    //store the otp in redis with a ttl of 5 minutes
    await redis.set(`otp:${email}`, otp, "EX", 300); //here we are writing key as otp:email so that we can easily retrieve the otp for a specific email
    // ex means expiration time in seconds, so 300 seconds = 5 minutes, it will automatically delete the otp after 5 minutes
    // Delete the otp from redis
    await redis.del(`otp:${email}`);
    return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        otp
    });
})

app.post("/verify-otp",async (req,res)=>{
    const {email} = req.body;
    const otp = await redis.get(`otp:${email}`);
    if(!otp){
        return res.status(400).json({
            success: false,
            message: "Invalid or expired OTP"
        });
    }
    return res.status(200).json({
        success: true,
        message: "OTP verified successfully"
    });
});

app.listen(PORT, () => {
    connectDB(); // Call the connectDB function to establish the MongoDB connection
    console.log(`Server is running on port ${PORT}`);
});