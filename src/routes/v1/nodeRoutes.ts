import { Router } from "express";
import {
    createNode,
    getAllNode,
    deleteNode,
    updateNode,
} from "../../controllers/node.controller";

const router = Router();

// Node routes
router.post("/", createNode);
router.get("/", getAllNode);
// Update node
router.put("/:id", updateNode);
router.delete("/:id", deleteNode);

export default router;
