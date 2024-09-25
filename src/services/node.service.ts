import { Node } from "../entities/Node";
import { ApiError } from "../utils/ApiError";
import AppDataSource from "../data-source";
import { validateNodeInput } from "../validations/node.validations";
import { assignColor } from "../utils/color";
import httpStatus from "http-status";

class NodeService {
    public static createNode = async (data: any) => {
        const nodeRepo = AppDataSource.getRepository(Node);
        const validatedData = validateNodeInput(data); // Sanitized data

        let parent = null;

        // If parentId is not provided, create a root node (parent node)
        if (!validatedData.parentId) {
            parent = nodeRepo.create({
                name: "Root Node",
                type: "ORGANIZATION", // Root-level node type
                color: "#FFFFFF",
            });
            await nodeRepo.save(parent);
        } else {
            // Use findOneBy to find by specific fields
            parent = await nodeRepo.findOneBy({
                id: validatedData.parentId,
            });
            if (!parent) {
                throw new ApiError(
                    "Parent node not found",
                    httpStatus.NOT_FOUND
                );
            }
        }

        const newNode = nodeRepo.create(validatedData);
        newNode.parent = parent;

        // Handle color assignment for Location and Department
        if (["LOCATION", "DEPARTMENT"].includes(newNode.type)) {
            newNode.color = assignColor();
        }

        const savedNode = await nodeRepo.save(newNode);

        // Propagate color to children
        if (["LOCATION", "DEPARTMENT"].includes(newNode.type)) {
            await this.propagateColor(savedNode);
        }

        return savedNode;
    };

    // Propagate color to children
    private static propagateColor = async (parentNode: Node) => {
        const nodeRepo = AppDataSource.getTreeRepository(Node);

        const descendants = await nodeRepo.findDescendants(parentNode);

        descendants.forEach(async (child) => {
            if (!["LOCATION", "DEPARTMENT"].includes(child.type)) {
                child.color = parentNode.color; // Apply parent's color to children
                await nodeRepo.save(child);
            }
        });
    };

    // Get all nodes
    public static getAllNodes = async () => {
        const nodeRepo = AppDataSource.getTreeRepository(Node);

        try {
            const nodes = await nodeRepo.findTrees();

            return nodes;
        } catch (error) {
            throw new ApiError(
                "Error fetching nodes",
                httpStatus.INTERNAL_SERVER_ERROR
            );
        }
    };

    // Update Node
    public static updateNode = async (
        nodeId: number,
        newParentId: number,
        option: "move" | "shift"
    ) => {
        const nodeRepo = AppDataSource.getTreeRepository(Node);

        try {
            // Fetch the node with its children
            const node = await nodeRepo.findOne({
                where: { id: nodeId },
                relations: ["children", "parent"],
            });

            if (!node) {
                throw new ApiError("Node not found", 404);
            }

            const newParent = newParentId
                ? await nodeRepo.findOne({ where: { id: newParentId } })
                : null;

            if (!newParent) {
                throw new ApiError("New parent node not found", 404);
            }

            if (newParent.id === node.id) {
                throw new ApiError("Cannot set a node as its own parent", 400);
            }

            // Handle the "move" option: Move the node and its children to the new parent
            if (option === "move") {
                node.parent = newParent; // Move the node and its entire subtree to the new parent
                await nodeRepo.save(node);
            }

            // Handle the "shift" option: Move only the node, but shift its children up to the current node's parent
            else if (option === "shift") {
                const currentParent = node.parent;

                if (!currentParent) {
                    throw new ApiError(
                        "Current parent not found, cannot shift children",
                        400
                    );
                }

                // Reassign the children to the current parent (shift children up)
                for (const child of node.children) {
                    child.parent = currentParent;
                    await nodeRepo.save(child);
                }

                // Now move only the node to the new parent
                node.parent = newParent;
                await nodeRepo.save(node);
            }

            return node;
        } catch (error) {
            throw new ApiError("Error updating node", 500);
        }
    };

    // Delete Node with two options (Remove children or shift children)
    public static deleteNode = async (
        nodeId: number,
        option: "remove-all" | "shift-children"
    ) => {
        const nodeRepo = AppDataSource.getTreeRepository(Node);

        try {
            const node = await nodeRepo.findOne({
                where: { id: nodeId },
                relations: ["children", "parent"],
            });

            if (!node) {
                throw new ApiError("Node not found", httpStatus.NOT_FOUND);
            }

            if (option === "remove-all") {
                // Now you can safely remove the node, and all children will be deleted automatically
                await nodeRepo.remove(node);
            } else if (option === "shift-children") {
                const parentNode = node.parent;

                if (!parentNode) {
                    throw new ApiError(
                        "Cannot shift children without a parent node",
                        httpStatus.BAD_REQUEST
                    );
                }

                // Reassign all children to the parent of the node being deleted
                for (const child of node.children) {
                    child.parent = parentNode; // Shift the child to the node's parent
                    await nodeRepo.save(child); // Save the updated child
                }

                // Now safely remove the node after reassigning its children
                await nodeRepo.remove(node);
            }

            return { message: "Node deleted successfully" };
        } catch (error) {
            throw new ApiError(
                "Error deleting node",
                httpStatus.INTERNAL_SERVER_ERROR
            );
        }
    };
}

export default NodeService;
