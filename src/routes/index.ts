import { Router } from "express";

import authRoutes from "./auth.routes";
import schedulingRoutes from "./scheduling.routes";
import clientRoutes from './clients.routes'
import roomRoutes from './room.routes'
import logRoutes from "./log.routes";

const router = Router();


router.use("back/auth", authRoutes);
router.use("back/rooms", roomRoutes); 

router.use("back/clients", clientRoutes);
router.use("back/schedules", schedulingRoutes);
router.use("back/logs", logRoutes);

export default router;
