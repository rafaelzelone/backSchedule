import { Router } from "express";

import authRoutes from "./auth.routes";
import schedulingRoutes from "./scheduling.routes";
import clientRoutes from './clients.routes'
import roomRoutes from './room.routes'
import logRoutes from "./log.routes";

const router = Router();


router.use("/schedule/backendserver/auth", authRoutes);
router.use("/schedule/backendserver/rooms", roomRoutes); 

router.use("/schedule/backendserver/clients", clientRoutes);
router.use("/schedule/backendserver/schedules", schedulingRoutes);
router.use("/schedule/backendserver/logs", logRoutes);

export default router;
