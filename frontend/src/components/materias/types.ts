export type EstadoMateriaKey = 'no_cursado' | 'cursado' | 'regular' | 'aprobado';

export interface Materia {
  id: number;
  nombre: string;
  nivel?: string;
  numero?: number;
  carreraId?: string;
}

export interface UsuarioMateria {
  id: number;
  usuarioId: string;
  materiaId: number;
  estado: EstadoMateriaKey;
  createdAt: string;
  updatedAt: string;
  materia: Materia;
  dia?: string;
  hora?: number;
  duracion?: number;
  aula?: string;
}

export interface EstadoInfo {
  label: string;
  color: string;
  bgColor: string;
}

export type EstadosMateria = {
  [key in EstadoMateriaKey]: EstadoInfo;
};
