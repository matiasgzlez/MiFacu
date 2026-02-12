export const queryKeys = {
  recordatorios: () => ['recordatorios'] as const,
  misMaterias: (userId: string) => ['mis-materias', userId] as const,
  materiasDisponibles: (userId: string) => ['materias-disponibles', userId] as const,
  finales: () => ['finales'] as const,
  userProfile: (userId: string) => ['user-profile', userId] as const,
  allMaterias: (carreraId?: string | null) => ['all-materias', carreraId] as const,
  correlativas: () => ['correlativas'] as const,
  links: () => ['links'] as const,
  calificaciones: (materiaId: number) => ['calificaciones', materiaId] as const,
  temasFinales: (materiaId: number) => ['temas-finales', materiaId] as const,
  gamification: (userId: string) => ['gamification', userId] as const,
};
