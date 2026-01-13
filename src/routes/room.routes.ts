import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { RoomController } from "../controllers/room.controller";

const router = Router();

router.post("/", authMiddleware, RoomController.create);
router.get("/", authMiddleware, RoomController.list);
router.get("/:id", authMiddleware, RoomController.findById);
router.put("/:id", authMiddleware, RoomController.update);
router.delete("/:id", authMiddleware, RoomController.delete);

export default router;
