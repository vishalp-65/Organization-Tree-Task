import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import NodeService from "../services/node.service";

export const createNode = catchAsync(async (req: Request, res: Response) => {
    const node = await NodeService.createNode(req.body);
    res.status(httpStatus.CREATED).json({
        status: "success",
        data: { node },
    });
});

export const getAllNode = catchAsync(async (req: Request, res: Response) => {
    const node = await NodeService.getAllNodes();
    res.status(httpStatus.CREATED).json({
        status: "success",
        data: { node },
    });
});
