import { Router } from "express";
import {
    createNode,
    getAllNode,
    deleteNode,
} from "../../controllers/node.controller";

const router = Router();

// Node routes
router.post("/", createNode);
router.get("/", getAllNode);
router.delete("/:id", deleteNode);

export default router;
