import { Router } from "express";

import orgRoutes from "./v1/index";

const router = Router();

router.use("/v1", orgRoutes);

export default router;
