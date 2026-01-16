import { Router } from "express";
import { recordatoriosController } from "../controllers/recordatorios.controller";
import { validateRecordatorio } from "../middleware/validation.middleware";
import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

// Todas las rutas de recordatorios requieren autenticación
router.use(authenticateUser);

router.get("/", recordatoriosController.getRecordatorios);
router.get("/:id", recordatoriosController.getRecordatorio);
router.post("/", validateRecordatorio, recordatoriosController.createRecordatorio);
router.put("/:id", validateRecordatorio, recordatoriosController.updateRecordatorio);
router.delete("/:id", recordatoriosController.deleteRecordatorio);

export default router;
