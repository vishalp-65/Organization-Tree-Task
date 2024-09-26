import { Router } from "express";
import httpStatus from "http-status";
import nodeRoutes from "./nodeRoutes";
import rateLimiter from "../../middlewares/rateLimmiter";

const router = Router();

// Rate limiter based on IP address
router.use(rateLimiter);

// Node routes
router.use("/node", nodeRoutes);

// Checking api is live
router.get("/info", (req, res) => {
    res.status(httpStatus.OK).json("Api is working fine");
});

export default router;
