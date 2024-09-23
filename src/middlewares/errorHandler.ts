import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { ApiError } from "../utils/ApiError";

const errorHandler = (
    err: ApiError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let { statusCode, message } = err;
    if (!(err instanceof ApiError)) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        message = "Internal Server Error";
    }
    res.status(statusCode).json({
        status: "error",
        statusCode,
        message,
    });
};

export default errorHandler;
