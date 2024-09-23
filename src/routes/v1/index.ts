import { Router } from "express";
import httpStatus from "http-status";
import nodeRoutes from "./nodeRoutes";

const router = Router();

router.use("/node", nodeRoutes);

// Checking api is live
router.get("/info", (req, res) => {
    res.status(httpStatus.OK).json("Api is working fine");
});

export default router;
