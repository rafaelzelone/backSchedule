import { Router } from "express";
import { LogController } from "../controllers/log.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, LogController.list);

export default router;
