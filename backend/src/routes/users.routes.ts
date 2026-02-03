import { Router } from "express";
import { usersController } from "../controllers/users.controller";

const router = Router();

router.get("/:userId", usersController.getProfile);
router.put("/:userId/career", usersController.updateCareer);

export default router;
