import { Router } from "express";

import authRoutes from "./auth.routes";
import schedulingRoutes from "./scheduling.routes";
import clientRoutes from './clients.routes'
import roomRoutes from './room.routes'
import logRoutes from "./log.routes";

const router = Router();


router.use("/auth", authRoutes);
router.use("/rooms", roomRoutes); 

router.use("/clients", clientRoutes);
router.use("/schedules", schedulingRoutes);
router.use("/logs", logRoutes);

export default router;
