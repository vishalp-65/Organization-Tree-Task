import { Node } from "../entities/Node";
import { ApiError } from "../utils/ApiError";
import AppDataSource from "../data-source";
import { validateNodeInput } from "../validations/node.validations";
import { assignColor } from "../utils/color";

class NodeService {
    public static createNode = async (data: any) => {
        const nodeRepo = AppDataSource.getRepository(Node);
        const validatedData = validateNodeInput(data); // Sanitized data

        let parent = null;

        try {
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
                    throw new ApiError("Parent node not found", 404);
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
        } catch (error) {
            console.log("error in service", error);
            throw new ApiError("Error creating node", 500);
        }
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
            throw new ApiError("Error fetching nodes", 500);
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
                throw new ApiError("Node not found", 404);
            }

            if (option === "remove-all") {
                // Now you can safely remove the node, and all children will be deleted automatically
                await nodeRepo.remove(node);
            } else if (option === "shift-children") {
                const parentNode = node.parent;

                if (!parentNode) {
                    throw new ApiError(
                        "Cannot shift children without a parent node",
                        400
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
            throw new ApiError("Error deleting node", 500);
        }
    };
}

export default NodeService;
