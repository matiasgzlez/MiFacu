import { Router } from "express";
import { carrerasController } from "../controllers/carreras.controller";

const router = Router();

router.get("/universidades", carrerasController.getUniversidades);
router.get("/universidades/:universidadId/carreras", carrerasController.getCarreras);

export default router;
