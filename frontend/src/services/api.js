// This file replaces the direct Supabase connection.
// All requests should now go to the backend API.

import { Platform } from 'react-native';

// IMPORTANTE: Para React Native, ajusta esta URL según tu entorno:
// - Web/Desktop: 'http://localhost:4000'
// - Android Emulator: 'http://10.0.2.2:4000'
// - iOS Simulator: 'http://localhost:4000'
// - Dispositivo físico: 'http://TU_IP_LOCAL:4000' (ej: 'http://192.168.1.100:4000')
// 
// Para obtener tu IP local en Windows: ipconfig
// Para obtener tu IP local en Mac/Linux: ifconfig o ip addr

// Detección automática del entorno
let API_URL = 'http://localhost:4000'; // Docker corriendo en localhost

if (Platform.OS === 'android') {
    // Para Android emulator, usar 10.0.2.2 que apunta al localhost de la máquina host
    // Para dispositivo físico Android, usar tu IP local (ej: 192.168.0.20)
    //
    // CAMBIA ESTA LÍNEA según tu caso:
    // - Emulador Android: 'http://10.0.2.2:4000'
    // - Dispositivo físico: 'http://192.168.0.20:4000' (tu IP local)
    API_URL = 'http://10.0.2.2:4000'; // Cambia a 'http://192.168.0.20:4000' si usas dispositivo físico
} else if (Platform.OS === 'ios') {
    // iOS simulator NO puede usar localhost - debe usar IP de la máquina host
    // Para dispositivo físico iOS, usar tu IP local
    API_URL = 'http://192.168.0.20:4000'; // IP de la máquina host para desarrollo con Docker
}

// Para desarrollo web, siempre usar localhost
if (typeof window !== 'undefined' && window.location) {
    API_URL = 'http://localhost:4000';
}

console.log('API_URL configurada para:', Platform.OS, '->', API_URL);

export const api = {
    checkHealth: async () => {
        try {
            const response = await fetch(`${API_URL}/`);
            return await response.text();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Recordatorios
    getRecordatorios: async () => {
        const response = await fetch(`${API_URL}/recordatorios`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error fetching recordatorios');
        }
        const result = await response.json();
        return result.data || result;
    },

    getRecordatorio: async (id) => {
        const response = await fetch(`${API_URL}/recordatorios/${id}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error fetching recordatorio');
        }
        const result = await response.json();
        return result.data || result;
    },

    createRecordatorio: async (data) => {
        const response = await fetch(`${API_URL}/recordatorios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error creating recordatorio');
        }
        const result = await response.json();
        return result.data || result;
    },

    updateRecordatorio: async (id, data) => {
        const response = await fetch(`${API_URL}/recordatorios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error updating recordatorio');
        }
        const result = await response.json();
        return result.data || result;
    },

    deleteRecordatorio: async (id) => {
        const response = await fetch(`${API_URL}/recordatorios/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error deleting recordatorio');
        }
        return true;
    },

    // Finales
    getFinales: async () => {
        const response = await fetch(`${API_URL}/finales`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error fetching finales');
        }
        const result = await response.json();
        return result.data || result;
    },

    getFinal: async (id) => {
        const response = await fetch(`${API_URL}/finales/${id}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error fetching final');
        }
        const result = await response.json();
        return result.data || result;
    },

    createFinal: async (data) => {
        const response = await fetch(`${API_URL}/finales`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error creating final');
        }
        const result = await response.json();
        return result.data || result;
    },

    updateFinal: async (id, data) => {
        const response = await fetch(`${API_URL}/finales/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error updating final');
        }
        const result = await response.json();
        return result.data || result;
    },

    deleteFinal: async (id) => {
        const response = await fetch(`${API_URL}/finales/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error deleting final');
        }
        return true;
    },

    // Materias
    getMaterias: async () => {
        const response = await fetch(`${API_URL}/materias`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error fetching materias');
        }
        const result = await response.json();
        return result.data || result;
    },

    getMateria: async (id) => {
        const response = await fetch(`${API_URL}/materias/${id}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error fetching materia');
        }
        const result = await response.json();
        return result.data || result;
    },

    // Usuario Materias
    getMateriasByUsuario: async (usuarioId) => {
        const response = await fetch(`${API_URL}/usuario-materias/${usuarioId}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error fetching usuario materias');
        }
        const result = await response.json();
        return result.data || result;
    },

    getMateriasDisponibles: async (usuarioId) => {
        const response = await fetch(`${API_URL}/usuario-materias/${usuarioId}/disponibles`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error fetching materias disponibles');
        }
        const result = await response.json();
        return result.data || result;
    },

    addMateriaToUsuario: async (usuarioId, materiaId, estado = null) => {
        const body = { materiaId };
        if (estado) body.estado = estado;

        const response = await fetch(`${API_URL}/usuario-materias/${usuarioId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error adding materia to usuario');
        }
        const result = await response.json();
        return result.data || result;
    },

    updateEstadoMateria: async (usuarioId, materiaId, estado) => {
        const response = await fetch(`${API_URL}/usuario-materias/${usuarioId}/${materiaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error updating materia estado');
        }
        const result = await response.json();
        return result.data || result;
    },

    removeMateriaFromUsuario: async (usuarioId, materiaId) => {
        const response = await fetch(`${API_URL}/usuario-materias/${usuarioId}/${materiaId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error removing materia from usuario');
        }
        return true;
    }
};
