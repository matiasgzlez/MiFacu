import { Platform } from 'react-native';

// Configuración de la API
// IMPORTANTE: Si usas un celular físico, cambia 'localhost' por tu IP local (ej: 192.168.1.10)
const LOCAL_IP = '192.168.0.20'; // <--- PON TU IP LOCAL AQUÍ si usas celular físico

export const BASE_URL = __DEV__
  ? (Platform.OS === 'web' ? 'http://localhost:4000' : `http://${LOCAL_IP}:4000`)
  : 'http://TU_IP_VPS:4000';

export const API_ENDPOINTS = {
  HEALTH: '/',
  MATERIAS: '/materias',
  RECORDATORIOS: '/recordatorios',
  FINALES: '/finales',
  USUARIO_MATERIAS: '/usuario-materias',
};
