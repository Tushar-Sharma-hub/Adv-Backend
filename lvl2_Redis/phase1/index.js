import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // Import the connectDB function
import User from "./model/user.model.js"; // Import the User model
import Redis from "ioredis"; 
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const redis = new Redis(process.env.REDIS_URL);

app.use(express.json()); // Middleware to parse JSON request bodies
app.get("/", (req, res) => {
    res.send("Hello from Redis!");
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
    return res.status(201).json({
        success: true,
        message: "User created successfully",
        user
    });
});

app.get("/get", async (req, res) => {
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

app.listen(PORT, () => {
    connectDB(); // Call the connectDB function to establish the MongoDB connection
    console.log(`Server is running on port ${PORT}`);
});