import { Node } from "../entities/Node";
import { ApiError } from "../utils/ApiError";
import AppDataSource from "../data-source";
import {
    validateNodeInput,
    validateNodeValue,
} from "../validations/node.validations";
import { assignColor } from "../utils/color";
import httpStatus from "http-status";
import { redis } from "../config/redis_config";

class NodeService {
    // Propagate color to children
    private static propagateColor = async (parentNode: Node) => {
        const nodeRepo = AppDataSource.getTreeRepository(Node);
        const descendants = await nodeRepo.findDescendants(parentNode);

        for (const child of descendants) {
            if (!["LOCATION", "DEPARTMENT"].includes(child.type)) {
                child.color = parentNode.color;
                await nodeRepo.save(child);
            }
        }
    };

    // Find the nearest parent with a color to propagate
    public static findNearestColorParent = async (node: Node) => {
        let currentParent = node.parent;

        while (currentParent) {
            if (["LOCATION", "DEPARTMENT"].includes(currentParent.type)) {
                return currentParent.color;
            }
            currentParent = currentParent.parent;
        }

        return "#FFFFFF"; // Default color if no location/department parent is found
    };

    // Create a new node
    public static createNode = async (data: any) => {
        const nodeRepo = AppDataSource.getRepository(Node);
        const validatedData = validateNodeInput(data);

        let parent: Node | null = null;

        if (!validatedData.parentId) {
            parent = nodeRepo.create({
                name: "Root Node",
                type: "ORGANIZATION",
                color: "#FFFFFF",
            });
            await nodeRepo.save(parent);
        } else {
            parent = await nodeRepo.findOneBy({ id: validatedData.parentId });
            if (!parent) {
                throw new ApiError(
                    "Parent node not found",
                    httpStatus.NOT_FOUND
                );
            }
        }

        const newNode = nodeRepo.create(validatedData);
        newNode.parent = parent;

        // Assign colors
        if (["LOCATION", "DEPARTMENT"].includes(newNode.type)) {
            newNode.color = assignColor();
        } else {
            newNode.color = await this.findNearestColorParent(newNode);
        }

        const savedNode = await nodeRepo.save(newNode);

        if (["LOCATION", "DEPARTMENT"].includes(newNode.type)) {
            await this.propagateColor(savedNode);
        }

        // Invalidate cache on creation
        await redis.del("all_nodes");

        return savedNode;
    };

    // Fetch all nodes
    public static getAllNodes = async () => {
        const cachedNodes = await redis.get("all_nodes");
        if (cachedNodes) {
            return JSON.parse(cachedNodes);
        }

        const nodeRepo = AppDataSource.getTreeRepository(Node);
        const nodes = await nodeRepo.findTrees();
        await redis.set("all_nodes", JSON.stringify(nodes), "EX", 3600);

        return nodes;
    };

    public static updateNodeValue = async (data: any) => {
        const nodeRepo = AppDataSource.getTreeRepository(Node);
        const validatedData = validateNodeValue(data); // Validate input (name, type, etc.)

        // Find the node to update
        const node = await nodeRepo.findOne({
            where: { id: validatedData.nodeId },
        });
        if (!node) {
            throw new ApiError("Node not found", httpStatus.NOT_FOUND);
        }

        node.name = validatedData.name || node.name;
        node.type = validatedData.type || node.type;

        // Validate type change (if needed)
        if (
            validatedData.type &&
            ["LOCATION", "DEPARTMENT"].includes(validatedData.type)
        ) {
            node.color = assignColor(); // Reassign color if the node is now a LOCATION or DEPARTMENT
        }

        // Save the updated node
        const updatedNode = await nodeRepo.save(node);

        // Invalidate cache after update
        await redis.del("all_nodes");

        return updatedNode;
    };

    // Update Node (Move or Shift with cyclic check)
    public static updateNode = async (
        nodeId: number,
        newParentId: number,
        option: "move" | "shift"
    ) => {
        const nodeRepo = AppDataSource.getTreeRepository(Node);
        const node = await nodeRepo.findOne({
            where: { id: nodeId },
            relations: ["children", "parent"],
        });

        if (!node) {
            throw new ApiError("Node not found", httpStatus.NOT_FOUND);
        }

        const newParent = await nodeRepo.findOne({
            where: { id: newParentId },
        });
        if (!newParent) {
            throw new ApiError(
                "New parent node not found",
                httpStatus.NOT_FOUND
            );
        }

        // Check for cyclic reference
        const descendants = await nodeRepo.findDescendants(node);
        if (descendants.some((descendant) => descendant.id === newParent.id)) {
            throw new ApiError(
                "Cannot move a node to one of its descendants",
                httpStatus.BAD_REQUEST
            );
        }

        if (option === "move") {
            node.parent = newParent;
            await nodeRepo.save(node);
        } else if (option === "shift") {
            const currentParent = node.parent;
            if (!currentParent) {
                throw new ApiError(
                    "Current parent not found, cannot shift children",
                    httpStatus.BAD_REQUEST
                );
            }

            for (const child of node.children) {
                child.parent = currentParent;
                await nodeRepo.save(child);
            }

            node.parent = newParent;
            await nodeRepo.save(node);
        }

        await redis.del("all_nodes");

        return node;
    };

    // Delete Node (Remove children or shift children)
    public static deleteNode = async (
        nodeId: number,
        option: "remove-all" | "shift-children"
    ) => {
        const nodeRepo = AppDataSource.getTreeRepository(Node);
        const node = await nodeRepo.findOne({
            where: { id: nodeId },
            relations: ["children", "parent"],
        });

        if (!node) {
            throw new ApiError("Node not found", httpStatus.NOT_FOUND);
        }

        if (option === "remove-all") {
            await nodeRepo.remove(node);
        } else if (option === "shift-children") {
            const parentNode = node.parent;
            if (!parentNode) {
                throw new ApiError(
                    "Cannot shift children without a parent node",
                    httpStatus.BAD_REQUEST
                );
            }

            for (const child of node.children) {
                child.parent = parentNode;
                await nodeRepo.save(child);
            }

            await nodeRepo.remove(node);
        }

        await redis.del("all_nodes");

        return { message: "Node deleted successfully" };
    };
}

export default NodeService;
