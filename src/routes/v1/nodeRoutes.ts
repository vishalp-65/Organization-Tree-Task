import { Router } from "express";
import {
    createNode,
    getAllNode,
    deleteNode,
    updateNode,
} from "../../controllers/node.controller";

const router = Router();

// Node creation route
router.post("/", createNode);

// Get all nodes
router.get("/", getAllNode);

// Update node
router.put("/:id", updateNode);

// Delete node route
router.delete("/:id", deleteNode);

export default router;
