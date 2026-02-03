import { Router } from 'express';
import { comentarioCalificacionController } from '../controllers/comentario-calificacion.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateUser);

// GET /comentarios-calificaciones/:calificacionId - Obtener comentarios de una calificación
router.get('/:calificacionId', comentarioCalificacionController.getByCalificacion);

// GET /comentarios-calificaciones/:calificacionId/count - Obtener cantidad de comentarios
router.get('/:calificacionId/count', comentarioCalificacionController.getCount);

// POST /comentarios-calificaciones/:calificacionId - Crear comentario
router.post('/:calificacionId', comentarioCalificacionController.create);

// DELETE /comentarios-calificaciones/:id - Eliminar comentario
router.delete('/:id', comentarioCalificacionController.delete);

export default router;
