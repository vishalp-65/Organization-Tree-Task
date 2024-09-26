import Redis from "ioredis";
import { config } from "./server_config";

export const redis = new Redis(config.REDIS_URL as string, {
    maxRetriesPerRequest: 20,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    connectTimeout: 10000,
});
