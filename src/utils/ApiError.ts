import httpStatus from "http-status";

class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

const handleInvalidNodeError = () =>
    new ApiError("Invalid Node", httpStatus.BAD_REQUEST);
const handleCycleError = () =>
    new ApiError(
        "Cycle detected in the organization tree",
        httpStatus.CONFLICT
    );

export { ApiError, handleInvalidNodeError, handleCycleError };
