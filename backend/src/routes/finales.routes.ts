import { Router } from "express";
import { finalesController } from "../controllers/finales.controller";
import { validateFinal } from "../middleware/validation.middleware";
import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

// Todas las rutas de finales requieren autenticación
router.use(authenticateUser);

router.get("/", finalesController.getFinales);
router.get("/:id", finalesController.getFinal);
router.post("/", validateFinal, finalesController.createFinal);
router.put("/:id", validateFinal, finalesController.updateFinal);
router.delete("/:id", finalesController.deleteFinal);

export default router;
