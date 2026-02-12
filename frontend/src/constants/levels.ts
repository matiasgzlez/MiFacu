export interface Level {
  level: number;
  xpRequired: number;
  title: string;
  description: string;
}

export const LEVELS: Level[] = [
  { level: 1, xpRequired: 0, title: 'Beginner', description: 'Primer paso hacia el enfoque' },
  { level: 2, xpRequired: 1, title: 'Focused Starter', description: 'Empiezas a crear un hábito de concentración' },
  { level: 3, xpRequired: 30, title: 'Concentrated Beginner', description: 'Luchas por cada minuto de enfoque' },
  { level: 4, xpRequired: 80, title: 'Focus Fighter', description: 'Estudias como un verdadero guerrero' },
  { level: 5, xpRequired: 150, title: 'Study Warrior', description: 'Maestro de tu propia atención' },
  { level: 6, xpRequired: 250, title: 'Attention Master', description: 'Profesional del deep work' },
  { level: 7, xpRequired: 400, title: 'Deep Work Pro', description: 'Concentración legendaria en flow' },
  { level: 8, xpRequired: 600, title: 'Zone Legend', description: 'Estado de flow real' },
  { level: 9, xpRequired: 850, title: 'Flow State King', description: 'Enfoque mental bestial' },
  { level: 10, xpRequired: 1150, title: 'Mindful Beast', description: 'Nivel divino de concentración' },
  { level: 11, xpRequired: 1500, title: 'Concentration God', description: 'Regente de todas las distracciones' },
  { level: 12, xpRequired: 1900, title: 'Focus Overlord', description: 'Máquina de aprendizaje sin límites' },
  { level: 13, xpRequired: 2400, title: 'Study Machine', description: 'Enfoque láser en el objetivo' },
  { level: 14, xpRequired: 3000, title: 'Laser Focus', description: 'Monje meditando sobre el conocimiento' },
  { level: 15, xpRequired: 3700, title: 'Mental Monk', description: 'Ninja escondido en libros' },
  { level: 16, xpRequired: 4500, title: 'Brain Ninja', description: 'Rey de la productividad y la eficiencia' },
  { level: 17, xpRequired: 5400, title: 'Productivity King', description: 'Greatest Of All Time en aprendizaje' },
  { level: 18, xpRequired: 6400, title: 'Study GOAT', description: 'Emperador del imperio del enfoque' },
  { level: 19, xpRequired: 7500, title: 'Focus Emperor', description: 'Leyenda viva de la concentración' },
  { level: 20, xpRequired: 8800, title: 'Shadow Sensei', description: 'Maestro supremo de zen y enfoque' },
  { level: 21, xpRequired: 10300, title: 'Ultimate Zen Master', description: 'Guerrero de enfoque de élite' },
  { level: 22, xpRequired: 12000, title: 'Focus Elite', description: 'Comandante de tu propia mente' },
  { level: 23, xpRequired: 13900, title: 'Mind Commander', description: 'Señor de todas las sesiones de estudio' },
  { level: 24, xpRequired: 16000, title: 'Study Overlord', description: 'Señor del estado de flujo supremo' },
  { level: 25, xpRequired: 18300, title: 'Flow State Lord', description: 'Titán de fuerza mental y enfoque' },
  { level: 26, xpRequired: 20800, title: 'Mental Titan', description: 'Emperador de disciplina inquebrantable' },
  { level: 27, xpRequired: 23500, title: 'Discipline Emperor', description: 'Rey del trabajo profundo' },
  { level: 28, xpRequired: 26400, title: 'Deep Work King', description: 'Habilidades cognitivas nivel bestia' },
  { level: 29, xpRequired: 29500, title: 'Cognitive Beast', description: 'Leyenda del enfoque' },
  { level: 30, xpRequired: 32800, title: 'Focus Legend', description: 'Ascendido a reinos mentales superiores' },
  { level: 31, xpRequired: 36300, title: 'Mind Ascendant', description: 'Maestría del flow de nivel semidiós' },
  { level: 32, xpRequired: 40000, title: 'Flow Demigod', description: 'Señor de la guerra del zen' },
  { level: 33, xpRequired: 44000, title: 'Zen Warlord', description: 'Poderes divinos de concentración' },
  { level: 34, xpRequired: 48200, title: 'Concentration Deity', description: 'Monarca de la ultra mente' },
  { level: 35, xpRequired: 52600, title: 'Ultra Mind Monarch', description: 'Dios del enfoque eterno' },
  { level: 36, xpRequired: 57200, title: 'Eternal Focus God', description: 'Deidad cósmica del estudio' },
  { level: 37, xpRequired: 62000, title: 'Cosmic Study Deity', description: 'Entidad de enfoque infinito' },
  { level: 38, xpRequired: 67000, title: 'Infinite Focus Entity', description: 'Maestro del grind eterno' },
  { level: 39, xpRequired: 72200, title: 'Timeless Grinder', description: 'Has superado las limitaciones mentales' },
  { level: 40, xpRequired: 77600, title: 'Transcendent Mind', description: 'Señor del enfoque del multiverso' },
  { level: 41, xpRequired: 83200, title: 'Multiverse Focus Lord', description: 'Rompes los límites de la realidad' },
  { level: 42, xpRequired: 89000, title: 'Reality Breaker', description: 'Viajando por dimensiones de estudio' },
  { level: 43, xpRequired: 95000, title: 'Study Dimension Walker', description: 'Maestría de enfoque a nivel cuántico' },
  { level: 44, xpRequired: 101000, title: 'Quantum Focus Master', description: 'Gobernante de mentes galácticas' },
  { level: 45, xpRequired: 107500, title: 'Galactic Mind Ruler', description: 'Señor del estudio infinito' },
  { level: 46, xpRequired: 114500, title: 'Infinity Study Overlord', description: 'Rey de la disciplina eterna' },
  { level: 47, xpRequired: 122000, title: 'Eternal Discipline King', description: 'Máquina imparable de enfoque' },
  { level: 48, xpRequired: 130000, title: 'Unstoppable Focus Machine', description: 'Ascendido con mente ilimitada' },
  { level: 49, xpRequired: 138500, title: 'Limitless Mind Ascendant', description: 'Más allá de todas las leyendas' },
  { level: 50, xpRequired: 147000, title: 'Beyond Legend', description: 'Ícono eterno de excelencia en el estudio' },
  { level: 51, xpRequired: 157000, title: 'Eternal Study Icon', description: 'Recién empiezas...' },
];

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
