import { Router } from "express";
import { pomodoroController } from "../controllers/pomodoro.controller";

const router = Router();

router.post("/", pomodoroController.createSession);
router.get("/stats/:userId", pomodoroController.getStats);
router.get("/history/:userId", pomodoroController.getHistory);

export default router;
