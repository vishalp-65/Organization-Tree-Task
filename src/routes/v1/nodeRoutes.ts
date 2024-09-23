import { Router } from "express";
import { createNode } from "../../controllers/node.controller";

const router = Router();

// Checking api is live
router.post("/", createNode);

export default router;
