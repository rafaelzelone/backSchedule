import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, UserController.list);
router.get("/me", authMiddleware, UserController.me);
router.put("/:id", authMiddleware, UserController.update);
router.delete("/:id", authMiddleware, UserController.delete);

export default router;
