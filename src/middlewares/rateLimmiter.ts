import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { redis } from "../config/redis_config";
import httpStatus from "http-status";

const RATE_LIMIT_WINDOW = 10 * 60;
const MAX_REQUESTS = 100;

const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    const userIP = req.ip;
    const key = `rate_limit_${userIP}`;

    try {
        const currentCount = await redis.get(key);

        if (currentCount) {
            if (parseInt(currentCount) >= MAX_REQUESTS) {
                throw new ApiError(
                    "Too many requests. Please try again later.",
                    httpStatus.TOO_MANY_REQUESTS
                );
            } else {
                await redis.incr(key);
            }
        } else {
            await redis.set(key, 1, "EX", RATE_LIMIT_WINDOW);
        }

        next();
    } catch (error) {
        next(error);
    }
};

export default rateLimiter;
