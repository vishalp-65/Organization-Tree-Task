import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "reflect-metadata";
import { config } from "./config/server_config";
import { ApiError } from "./utils/ApiError";
import httpStatus from "http-status";
import errorHandler from "./middlewares/errorHandler";
import apiRoutes from "./routes/index";
import AppDataSource from "./data-source";

const app = express();
dotenv.config();

// Handle cors issue
app.use(cors({ origin: "*" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", apiRoutes);

app.listen(config.PORT, () => {
    AppDataSource; // Database connection
    console.log(`Server running at ${config.PORT}`);
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
    next(new ApiError("Not found", httpStatus.NOT_FOUND));
});

// Error handler
app.use(errorHandler);
