import { Router } from "express";
import { gamificationController } from "../controllers/gamification.controller";

const router = Router();

router.get("/:userId", gamificationController.getProfile);
router.post("/complete-session", gamificationController.completeSession);

export default router;
