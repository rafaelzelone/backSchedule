import { Router } from "express";
import { SchedulingController } from "../controllers/scheduling.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, SchedulingController.create);
router.get("/", authMiddleware, SchedulingController.list);

router.patch("/:id/confirm", authMiddleware, SchedulingController.confirm);
router.patch("/:id/cancel", authMiddleware, SchedulingController.cancel);

export default router;
