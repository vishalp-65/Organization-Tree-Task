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

export const deleteNode = catchAsync(async (req: Request, res: Response) => {
    const parentId = req.params.id;
    const option = req.query.option || "remove-all";
    await NodeService.deleteNode(+parentId, option as "remove-all");
    res.status(httpStatus.NO_CONTENT).json({ status: "success" });
});
