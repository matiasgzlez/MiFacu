import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys';
import { DataRepository } from '../services/dataRepository';
import { useAuth } from '../context/AuthContext';

// ─── Queries ───

export function useRecordatorios() {
  return useQuery({
    queryKey: queryKeys.recordatorios(),
    queryFn: () => DataRepository.getRecordatorios(),
  });
}

export function useMisMaterias() {
  const { user } = useAuth();
  const userId = user?.id;
  return useQuery({
    queryKey: queryKeys.misMaterias(userId || ''),
    queryFn: () => DataRepository.getMisMaterias(userId!),
    enabled: !!userId,
  });
}

export function useMateriasDisponibles() {
  const { user } = useAuth();
  const userId = user?.id;
  return useQuery({
    queryKey: queryKeys.materiasDisponibles(userId || ''),
    queryFn: () => DataRepository.getMateriasDisponibles(userId!),
    enabled: !!userId,
  });
}

export function useFinales() {
  return useQuery({
    queryKey: queryKeys.finales(),
    queryFn: () => DataRepository.getFinales(),
  });
}

export function useUserProfile() {
  const { user } = useAuth();
  const userId = user?.id;
  return useQuery({
    queryKey: queryKeys.userProfile(userId || ''),
    queryFn: () => DataRepository.getUserProfile(userId!),
    enabled: !!userId,
  });
}

export function useAllMaterias(carreraId?: string | null) {
  return useQuery({
    queryKey: queryKeys.allMaterias(carreraId),
    queryFn: () => DataRepository.getAllMaterias(carreraId),
    enabled: !!carreraId,
  });
}

export function useLinks() {
  return useQuery({
    queryKey: queryKeys.links(),
    queryFn: () => DataRepository.getLinks(),
  });
}

// ─── Mutations: Recordatorios ───

export function useCreateRecordatorio() {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();
  return useMutation({
    mutationFn: (data: any) => DataRepository.createRecordatorio(isGuest, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recordatorios() });
    },
  });
}

export function useUpdateRecordatorio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      DataRepository.updateRecordatorio(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recordatorios() });
    },
  });
}

export function useDeleteRecordatorio() {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();
  return useMutation({
    mutationFn: (id: number) => DataRepository.deleteRecordatorio(isGuest, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recordatorios() });
    },
  });
}

// ─── Mutations: Finales ───

export function useCreateFinal() {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();
  return useMutation({
    mutationFn: (data: any) => DataRepository.createFinal(isGuest, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finales() });
    },
  });
}

export function useDeleteFinal() {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();
  return useMutation({
    mutationFn: (id: number) => DataRepository.deleteFinal(isGuest, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finales() });
    },
  });
}

// ─── Mutations: Materias ───

export function useAddMateria() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id || '';
  return useMutation({
    mutationFn: ({ materiaId, estado, schedule }: { materiaId: number; estado: string; schedule?: any }) =>
      DataRepository.addMateriaToUsuario(userId, materiaId, estado, schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.misMaterias(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.materiasDisponibles(userId) });
    },
  });
}

export function useUpdateEstadoMateria() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id || '';
  return useMutation({
    mutationFn: ({ materiaId, estado, schedule }: { materiaId: number; estado: string; schedule?: any }) =>
      DataRepository.updateEstadoMateria(userId, materiaId, estado, schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.misMaterias(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.materiasDisponibles(userId) });
    },
  });
}

export function useRemoveMateria() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id || '';
  return useMutation({
    mutationFn: (materiaId: number) =>
      DataRepository.removeMateriaFromUsuario(userId, materiaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.misMaterias(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.materiasDisponibles(userId) });
    },
  });
}

// ─── Mutations: Links ───

export function useCreateLink() {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();
  return useMutation({
    mutationFn: (data: any) => DataRepository.createLink(isGuest, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.links() });
    },
  });
}

export function useUpdateLink() {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      DataRepository.updateLink(isGuest, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.links() });
    },
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();
  return useMutation({
    mutationFn: (id: number) => DataRepository.deleteLink(isGuest, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.links() });
    },
  });
}
