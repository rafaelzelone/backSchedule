import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { ClientController } from "../controllers/client.controller";

const router = Router();

router.post("/", authMiddleware, ClientController.create);
router.get("/", authMiddleware, ClientController.list);
router.get("/me", authMiddleware, ClientController.getClientByUserId);
router.get("/:id", authMiddleware, ClientController.findById);
router.put("/:id", authMiddleware, ClientController.update);
router.delete("/:id", authMiddleware, ClientController.delete);

export default router;
