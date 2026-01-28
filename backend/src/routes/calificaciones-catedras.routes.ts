import { Router } from "express";
import { calificacionCatedraController } from "../controllers/calificacion-catedra.controller";
import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateUser);

// Rutas por materia (deben ir primero para evitar conflicto con /:id)
router.get("/materia/:id/promedio", calificacionCatedraController.getPromedioMateria);
router.get("/materia/:id/profesores", calificacionCatedraController.getProfesoresSugeridos);

// CRUD principal
router.get("/", calificacionCatedraController.getAll);
router.get("/:id", calificacionCatedraController.getById);
router.post("/", calificacionCatedraController.create);
router.put("/:id", calificacionCatedraController.update);
router.delete("/:id", calificacionCatedraController.delete);

// Acciones adicionales
router.post("/:id/voto", calificacionCatedraController.votar);
router.post("/:id/reportar", calificacionCatedraController.reportar);

export default router;
