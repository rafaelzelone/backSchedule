import { Router } from "express";
import { ScheduleTimeController } from "../controllers/scheduleTime.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, ScheduleTimeController.create);
router.get("/", authMiddleware, ScheduleTimeController.list);
router.put("/:id", authMiddleware, ScheduleTimeController.update);
router.get("/:id", authMiddleware, ScheduleTimeController.getById);
router.delete("/:id", authMiddleware, ScheduleTimeController.delete);

export default router;
