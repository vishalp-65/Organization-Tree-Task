import { Router } from "express";
import httpStatus from "http-status";

const router = Router();

// router.use("/",);

// Checking api is live
router.get("/info", (req, res) => {
    res.status(httpStatus.OK).json("Api is working fine");
});

export default router;
