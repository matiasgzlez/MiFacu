/**
 * Domain model interfaces for the Home screen
 */

export interface Recordatorio {
  id: number;
  nombre: string;
  materiaId?: number;
  tipo: string;
  fecha: string;
  hora: string;
  color?: string;
  descripcion?: string;
}

export interface ProximaClase {
  materia: string;
  hora: string;
  aula: string;
  tipo: 'Clase Actual' | 'Próxima Clase' | 'Horarios';
}

export interface Stats {
  aprobadas: number;
  cursando: number;
  regulares: number;
  totalPlan: number;
  noCursadas: number;
}

export interface Universidad {
  id: string;
  nombre: string;
  abreviatura?: string;
}

export interface Carrera {
  id: string;
  universidadId: string;
  nombre: string;
  universidad?: Universidad;
}
