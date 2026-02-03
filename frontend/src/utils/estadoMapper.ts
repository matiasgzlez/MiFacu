// Mapeo bidireccional de estados entre API y visualización del simulador

// Estados de la API del backend
export type EstadoAPI = 'aprobado' | 'regular' | 'cursado' | 'no_cursado' | null;

// Estados visuales del simulador
export type EstadoVisual = 'aprobada' | 'regularizada' | 'pendiente' | 'bloqueada';

// Paleta iOS Premium
export const SIMULADOR_COLORS = {
  // Estados
  aprobada: '#34C759',      // iOS Green
  regularizada: '#FF9500',  // iOS Orange
  pendiente: '#007AFF',     // iOS Blue
  bloqueada: '#8E8E93',     // iOS Gray

  // Fondos
  background: '#F2F2F7',    // iOS Light Gray Background
  backgroundSecondary: '#FFFFFF',
  backgroundTertiary: '#E5E5EA',

  // Conexiones
  lineaActiva: '#34C759',
  lineaInactiva: '#C7C7CC',

  // Texto
  textPrimary: '#000000',
  textSecondary: '#3C3C43',
  textTertiary: '#8E8E93',

  // Separadores
  separator: 'rgba(60, 60, 67, 0.12)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.4)',
} as const;

// Configuración visual por estado - Estilo iOS
export const ESTADO_CONFIG = {
  aprobada: {
    color: SIMULADOR_COLORS.aprobada,
    bgColor: 'rgba(52, 199, 89, 0.12)',
    gradientColors: ['rgba(52, 199, 89, 0.15)', 'rgba(52, 199, 89, 0.05)'],
    icon: 'checkmark-circle-outline' as const,
    iconFilled: 'checkmark-circle' as const,
    iconColor: SIMULADOR_COLORS.aprobada,
    label: 'Aprobada',
    labelShort: 'Apr',
  },
  regularizada: {
    color: SIMULADOR_COLORS.regularizada,
    bgColor: 'rgba(255, 149, 0, 0.12)',
    gradientColors: ['rgba(255, 149, 0, 0.15)', 'rgba(255, 149, 0, 0.05)'],
    icon: 'checkmark-outline' as const,
    iconFilled: 'checkmark' as const,
    iconColor: SIMULADOR_COLORS.regularizada,
    label: 'Regular',
    labelShort: 'Reg',
  },
  pendiente: {
    color: SIMULADOR_COLORS.pendiente,
    bgColor: 'rgba(0, 122, 255, 0.08)',
    gradientColors: ['rgba(0, 122, 255, 0.12)', 'rgba(0, 122, 255, 0.04)'],
    icon: 'ellipse-outline' as const,
    iconFilled: 'ellipse' as const,
    iconColor: SIMULADOR_COLORS.pendiente,
    label: 'Disponible',
    labelShort: 'Disp',
  },
  bloqueada: {
    color: SIMULADOR_COLORS.bloqueada,
    bgColor: 'rgba(142, 142, 147, 0.08)',
    gradientColors: ['rgba(142, 142, 147, 0.1)', 'rgba(142, 142, 147, 0.03)'],
    icon: 'lock-closed-outline' as const,
    iconFilled: 'lock-closed' as const,
    iconColor: SIMULADOR_COLORS.bloqueada,
    label: 'Bloqueada',
    labelShort: 'Bloq',
  },
} as const;

/**
 * Convierte un estado de la API al estado visual del simulador
 */
export function apiToVisual(estadoApi: EstadoAPI): EstadoVisual {
  switch (estadoApi) {
    case 'aprobado':
      return 'aprobada';
    case 'regular':
      return 'regularizada';
    case 'cursado':
      return 'pendiente';
    case 'no_cursado':
    case null:
    default:
      return 'pendiente';
  }
}

/**
 * Convierte un estado visual al estado de la API
 */
export function visualToApi(estadoVisual: EstadoVisual): EstadoAPI {
  switch (estadoVisual) {
    case 'aprobada':
      return 'aprobado';
    case 'regularizada':
      return 'regular';
    case 'pendiente':
      return 'cursado';
    case 'bloqueada':
      return 'no_cursado';
    default:
      return null;
  }
}

/**
 * Obtiene el siguiente estado en el ciclo de cambio
 * pendiente -> regularizada -> aprobada -> pendiente
 */
export function getNextEstado(estadoActual: EstadoVisual): EstadoVisual {
  switch (estadoActual) {
    case 'pendiente':
      return 'regularizada';
    case 'regularizada':
      return 'aprobada';
    case 'aprobada':
      return 'pendiente';
    case 'bloqueada':
      return 'bloqueada';
    default:
      return 'pendiente';
  }
}

/**
 * Verifica si un estado permite desbloquear correlativas
 */
export function puedeDesbloquear(estado: EstadoVisual): boolean {
  return estado === 'aprobada' || estado === 'regularizada';
}

/**
 * Obtiene la configuración visual para un estado
 */
export function getEstadoConfig(estado: EstadoVisual) {
  return ESTADO_CONFIG[estado] || ESTADO_CONFIG.bloqueada;
}
