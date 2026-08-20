import {redis} from "../index.js";
const rateLimitter = async (req, res, next) => {
    const ip = req.ip;
    const key = `rate-limit:${ip}`;
    const requests = await redis.incr(key); //it will increment the value of the key by 1 and return the new value
    if(requests === 1){ // when the first request is made, set the expiration of the key to 60 seconds
        await redis.expire(key, 60); //set the expiration of the key to 60 seconds ,
        //after expiration, the key will be deleted automatically and the next request will be treated as the first request again
    }
    if(requests>5){
        return res.status(429).json({
            success: false,
            message: "Too many requests, please try again later"
        });
    }
    next();
}

export default rateLimitter;