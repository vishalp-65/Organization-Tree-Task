import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import NodeService from "../services/node.service";
import { ApiError } from "../utils/ApiError";

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

export const updateNodeValue = catchAsync(
    async (req: Request, res: Response) => {
        const node = await NodeService.updateNodeValue(req.body);
        res.status(httpStatus.OK).json({
            status: "success",
            data: { node },
        });
    }
);

// Update Node
export const updateNode = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { newParentId } = req.body;
        const id = req.params.id;

        if (!id || !newParentId) {
            throw new ApiError(
                "ID and newParentId are required",
                httpStatus.BAD_REQUEST
            );
        }
        const option = req.query.option || "move"; // Default to "move" if no option is provided

        const node = await NodeService.updateNode(
            +id,
            +newParentId,
            option as "move" | "shift"
        );
        res.status(httpStatus.OK).json({
            status: "success",
            data: {
                node,
            },
        });
    }
);

export const deleteNode = catchAsync(async (req: Request, res: Response) => {
    const parentId = req.params.id;
    if (!parentId) {
        throw new ApiError("parentId is required", httpStatus.BAD_REQUEST);
    }

    const option = req.query.option || "remove-all";

    await NodeService.deleteNode(+parentId, option as "remove-all");

    res.status(httpStatus.NO_CONTENT).json({ status: "success" });
});
