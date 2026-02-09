import { api, linksApi, materiasApi, academicApi, usersApi } from './api';

export const DataRepository = {
    async getRecordatorios(isGuest?: boolean) {
        // API call
        try {
            const response = await api.get('/recordatorios');
            // Backend returns { status: 'success', data: [...] }
            return response.data.data;
        } catch (error) {
            console.error("Error fetching recordatorios:", error);
            return [];
        }
    },

    async createRecordatorio(isGuest: boolean, data: any) {
        try {
            const response = await api.post('/recordatorios', data);
            return response.data.data || response.data;
        } catch (error) {
            console.error("Error creating recordatorio:", error);
            throw error;
        }
    },

    async updateRecordatorio(id: number, data: any) {
        try {
            const response = await api.put(`/recordatorios/${id}`, data);
            return response.data.data;
        } catch (error) {
            console.error("Error updating recordatorio:", error);
            throw error;
        }
    },

    async deleteRecordatorio(isGuest: boolean, id: number) {
        try {
            await api.delete(`/recordatorios/${id}`);
        } catch (error) {
            console.error("Error deleting recordatorio:", error);
            throw error;
        }
    },

    async getFinales(isGuest?: boolean) {
        try {
            const response = await api.get('/finales');
            return response.data.data;
        } catch (error) {
            console.error("Error fetching finales:", error);
            return [];
        }
    },

    async createFinal(isGuest: boolean, data: any) {
        try {
            const response = await api.post('/finales', data);
            return response.data.data || response.data;
        } catch (error) {
            console.error("Error creating final:", error);
            throw error;
        }
    },

    async deleteFinal(isGuest: boolean, id: number) {
        try {
            await api.delete(`/finales/${id}`);
        } catch (error) {
            console.error("Error deleting final:", error);
            throw error;
        }
    },

    // --- LINKS (REPOSITORIO) ---
    async getLinks(_isGuest?: boolean) {
        try {
            return await linksApi.getLinks();
        } catch (error) {
            console.error("Error fetching links:", error);
            return [];
        }
    },

    async createLink(_isGuest: boolean, data: any) {
        return await linksApi.createLink(data);
    },

    async updateLink(_isGuest: boolean, id: number, data: any) {
        return await linksApi.updateLink(id, data);
    },

    async deleteLink(_isGuest: boolean, id: number) {
        await linksApi.deleteLink(id);
    },

    // --- MATERIAS ---
    async getMisMaterias(userId: string) {
        try {
            return await materiasApi.getMateriasByUsuario(userId);
        } catch (error) {
            console.error("Error fetching mis materias:", error);
            throw error;
        }
    },

    async getMateriasDisponibles(userId: string) {
        try {
            return await materiasApi.getMateriasDisponibles(userId);
        } catch (error) {
            console.error("Error fetching available materias:", error);
            throw error;
        }
    },

    async getAllMaterias(carreraId?: string | null) {
        try {
            return await materiasApi.getMaterias(carreraId);
        } catch (error) {
            console.error("Error fetching all materias:", error);
            throw error;
        }
    },

    async updateEstadoMateria(userId: string, materiaId: number, estado: string, schedule: any) {
        try {
            return await materiasApi.updateEstadoMateria(userId, materiaId, estado, schedule);
        } catch (error) {
            console.error("Error updating materia status:", error);
            throw error;
        }
    },

    async addMateriaToUsuario(userId: string, materiaId: number, estado: string, schedule?: any) {
        try {
            return await (materiasApi as any).addMateriaToUsuario(userId, materiaId, estado, schedule);
        } catch (error) {
            console.error("Error adding materia to user:", error);
            throw error;
        }
    },

    async removeMateriaFromUsuario(userId: string, materiaId: number) {
        try {
            await materiasApi.removeMateriaFromUsuario(userId, materiaId);
        } catch (error) {
            console.error("Error removing materia from user:", error);
            throw error;
        }
    },

    // --- ACADEMIC ---
    async getUniversidades() {
        try {
            return await academicApi.getUniversidades();
        } catch (error) {
            console.error("Error fetching universities:", error);
            return [];
        }
    },

    async getCarreras(universidadId: string) {
        try {
            return await academicApi.getCarreras(universidadId);
        } catch (error) {
            console.error("Error fetching careers:", error);
            return [];
        }
    },

    async updateCareer(userId: string, carreraId: string) {
        try {
            return await usersApi.updateCareer(userId, carreraId);
        } catch (error) {
            console.error("Error updating career:", error);
            throw error;
        }
    },

    async getUserProfile(userId: string) {
        try {
            return await usersApi.getProfile(userId);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    }
};
