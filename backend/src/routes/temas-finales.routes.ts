import { Router } from "express";
import { temaFinalController } from "../controllers/tema-final.controller";
import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

// Todas las rutas requieren autenticacion
router.use(authenticateUser);

// Rutas por materia (deben ir primero para evitar conflicto con /:id)
router.get("/materia/:id/estadisticas", temaFinalController.getEstadisticasMateria);

// CRUD principal
router.get("/", temaFinalController.getAll);
router.get("/:id", temaFinalController.getById);
router.post("/", temaFinalController.create);
router.put("/:id", temaFinalController.update);
router.delete("/:id", temaFinalController.delete);

// Acciones adicionales
router.post("/:id/voto", temaFinalController.votar);
router.post("/:id/reportar", temaFinalController.reportar);

export default router;
