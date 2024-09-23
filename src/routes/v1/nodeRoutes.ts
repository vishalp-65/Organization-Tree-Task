import { Router } from "express";
import { createNode, getAllNode } from "../../controllers/node.controller";

const router = Router();

// Node routes
router.post("/", createNode);
router.get("/", getAllNode);

export default router;
