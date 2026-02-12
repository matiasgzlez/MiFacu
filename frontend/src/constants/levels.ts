export interface Level {
  level: number;
  xpRequired: number;
  title: string;
  description: string;
}

export const LEVELS: Level[] = [
  { level: 1, xpRequired: 0, title: 'Ingresante', description: 'Primer dia en la facu, todo es nuevo' },
  { level: 2, xpRequired: 1, title: 'Cachorro de Aula', description: 'Ya encontraste tu primer aula sin perderte' },
  { level: 3, xpRequired: 30, title: 'Mate Cebador', description: 'No hay estudio sin un buen mate' },
  { level: 4, xpRequired: 80, title: 'Apuntero', description: 'Coleccionas apuntes como figuritas' },
  { level: 5, xpRequired: 150, title: 'Sobreviviente de TP', description: 'Entregaste tu primer TP a las 3am' },
  { level: 6, xpRequired: 250, title: 'Fichero Serial', description: 'La fotocopiadora ya te conoce por nombre' },
  { level: 7, xpRequired: 400, title: 'Parcialero', description: 'Aprobaste tu primer parcial a pura garra' },
  { level: 8, xpRequired: 600, title: 'Madrugador de Cursada', description: 'Te bancas las clases de 7:30 sin dormirte' },
  { level: 9, xpRequired: 850, title: 'Recuperador Nato', description: 'Si hay recuperatorio, hay esperanza' },
  { level: 10, xpRequired: 1150, title: 'Domador de Finales', description: 'Ya rendiste tu primer final y seguis vivo' },
  { level: 11, xpRequired: 1500, title: 'Rata de Biblioteca', description: 'La biblio es tu segunda casa' },
  { level: 12, xpRequired: 1900, title: 'Promocionador', description: 'Promocionar es un arte y vos lo dominas' },
  { level: 13, xpRequired: 2400, title: 'Matero Academico', description: 'Cebas mate y resolvemos parciales a la vez' },
  { level: 14, xpRequired: 3000, title: 'Rey del Resumen', description: 'Tus resumenes valen oro en el grupo' },
  { level: 15, xpRequired: 3700, title: 'Cazabecas', description: 'Conseguis las becas antes que nadie' },
  { level: 16, xpRequired: 4500, title: 'Miliciano del Estudio', description: 'Disciplina militar aplicada a los libros' },
  { level: 17, xpRequired: 5400, title: 'Pasillo Fighter', description: 'Sobreviviste la cola de inscripcion a materias' },
  { level: 18, xpRequired: 6400, title: 'Gladiador de Mesa', description: 'Rendis finales como si fueran batallas epicas' },
  { level: 19, xpRequired: 7500, title: 'Veterano de Cursada', description: 'Los profes ya te saludan por tu nombre' },
  { level: 20, xpRequired: 8800, title: 'Leyenda del Buffer', description: 'Tu bar universitario favorito te fía' },
  { level: 21, xpRequired: 10300, title: 'Sensei de Catedra', description: 'Le explicas a los pibes lo que el profe no pudo' },
  { level: 22, xpRequired: 12000, title: 'Crack del Promedio', description: 'Tu promedio es la envidia de la comision' },
  { level: 23, xpRequired: 13900, title: 'Maratonista Academico', description: 'Tres finales en una semana y ni pestaneas' },
  { level: 24, xpRequired: 16000, title: 'Titan de la Facu', description: 'Nada te frena, ni correlativas imposibles' },
  { level: 25, xpRequired: 18300, title: 'Maestro del Mate Amargo', description: 'Estudias de corrido sin azucar y sin parar' },
  { level: 26, xpRequired: 20800, title: 'Decano Honorario', description: 'Conoces la facu mejor que el propio decano' },
  { level: 27, xpRequired: 23500, title: 'Emperador de TPs', description: 'Los trabajos practicos tiemblan ante vos' },
  { level: 28, xpRequired: 26400, title: 'General de Estudio', description: 'Comandas grupos de estudio como un estratega' },
  { level: 29, xpRequired: 29500, title: 'Bestia Academica', description: 'Rendis todo en fecha y con buena nota' },
  { level: 30, xpRequired: 32800, title: 'Leyenda Universitaria', description: 'Tu nombre circula en los pasillos de la facu' },
  { level: 31, xpRequired: 36300, title: 'Samurai del Saber', description: 'El conocimiento es tu katana' },
  { level: 32, xpRequired: 40000, title: 'Semidios de Parciales', description: 'Los parciales se rinden ante vos' },
  { level: 33, xpRequired: 44000, title: 'Arquitecto de Promedios', description: 'Cada nota esta estrategicamente calculada' },
  { level: 34, xpRequired: 48200, title: 'Fenomeno de Catedra', description: 'Los profes te ponen de ejemplo' },
  { level: 35, xpRequired: 52600, title: 'Monarca del Aula', description: 'Tu presencia eleva el nivel de la clase' },
  { level: 36, xpRequired: 57200, title: 'Dios del Apunte', description: 'Tus apuntes son material de estudio oficial' },
  { level: 37, xpRequired: 62000, title: 'Cosmonauta Academico', description: 'Explorando fronteras del conocimiento' },
  { level: 38, xpRequired: 67000, title: 'Maquina de Aprobar', description: 'Aprobas todo lo que tocas, es un don' },
  { level: 39, xpRequired: 72200, title: 'Eterno Estudioso', description: 'Superaste los limites de la concentracion humana' },
  { level: 40, xpRequired: 77600, title: 'Trascendente Academico', description: 'Tu mente opera en otro plano' },
  { level: 41, xpRequired: 83200, title: 'Señor de las Correlativas', description: 'Desbloqueaste todo el arbol de materias' },
  { level: 42, xpRequired: 89000, title: 'Rompe Promedios', description: 'Tu promedio desafia la estadistica' },
  { level: 43, xpRequired: 95000, title: 'Caminante de Facultades', description: 'Dominas el saber de multiples carreras' },
  { level: 44, xpRequired: 101000, title: 'Maestro Cuantico', description: 'Estudias en todas las dimensiones a la vez' },
  { level: 45, xpRequired: 107500, title: 'Regente del Conocimiento', description: 'Todo el saber universitario ante tus pies' },
  { level: 46, xpRequired: 114500, title: 'Overlord Universitario', description: 'Gobernas la facu con sabiduria suprema' },
  { level: 47, xpRequired: 122000, title: 'Rey de la Disciplina', description: 'Tu constancia es leyenda entre generaciones' },
  { level: 48, xpRequired: 130000, title: 'Maquina Imparable', description: 'Ni los paros ni los feriados te frenan' },
  { level: 49, xpRequired: 138500, title: 'Ascendido Supremo', description: 'Mas alla de toda leyenda universitaria' },
  { level: 50, xpRequired: 147000, title: 'Leyenda Eterna', description: 'Tu legado perdura en los pasillos para siempre' },
  { level: 51, xpRequired: 157000, title: 'El Graduado Mitico', description: 'Recien empezas la verdadera aventura...' },
];

/**
 * Returns the tier accent color for a given level.
 * Changes every ~5-10 levels to reflect progression.
 */
export function getTierColor(level: number): string {
  if (level >= 40) return '#FF6B6B';  // Rojo
  if (level >= 30) return '#A855F7';  // Violeta
  if (level >= 20) return '#F59E0B';  // Dorado
  if (level >= 10) return '#3B82F6';  // Azul
  if (level >= 5) return '#10B981';   // Verde
  return '#6B7280';                    // Gris
}

/**
 * Returns the current level info for a given XP amount.
 * Finds the highest level whose xpRequired <= xp.
 */
export function getLevelForXP(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

/**
 * Returns the next level info, or null if already at max level.
 */
export function getNextLevel(xp: number): Level | null {
  const current = getLevelForXP(xp);
  const nextIndex = LEVELS.findIndex((l) => l.level === current.level + 1);
  return nextIndex !== -1 ? LEVELS[nextIndex] : null;
}

/**
 * Returns XP progress towards the next level as a number between 0 and 1.
 * Returns 1 if at max level.
 */
export function getXPProgress(xp: number): number {
  const current = getLevelForXP(xp);
  const next = getNextLevel(xp);
  if (!next) return 1;

  const xpIntoLevel = xp - current.xpRequired;
  const xpNeeded = next.xpRequired - current.xpRequired;
  return xpNeeded > 0 ? xpIntoLevel / xpNeeded : 1;
}

/**
 * XP rules for session completion.
 */
export const XP_RULES = {
  /** XP gained per minute of study */
  PER_MINUTE: 1,
  /** Bonus XP per streak day */
  STREAK_DAILY_BONUS: 20,
  /** Bonus XP for sessions longer than LONG_SESSION_THRESHOLD */
  LONG_SESSION_BONUS: 5,
  /** Minimum minutes to qualify as a "long session" */
  LONG_SESSION_THRESHOLD: 25,
} as const;

/**
 * Calculates total XP earned for a completed session.
 */
export function calculateSessionXP(
  durationMinutes: number,
  isStreakDay: boolean,
): number {
  let xp = durationMinutes * XP_RULES.PER_MINUTE;

  if (isStreakDay) {
    xp += XP_RULES.STREAK_DAILY_BONUS;
  }

  if (durationMinutes >= XP_RULES.LONG_SESSION_THRESHOLD) {
    xp += XP_RULES.LONG_SESSION_BONUS;
  }

  return xp;
}
