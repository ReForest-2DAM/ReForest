import api from '../config/apiClient';
import type { Donacion, DonacionFormData } from '../types';

// Obtener todas las donaciones
export const getAllDonaciones = async (): Promise<Donacion[]> => {
  const response = await api.get<Donacion[]>('/donaciones');
  return response.data;
};

// Obtener una donación por ID
export const getDonacionById = async (id: number): Promise<Donacion> => {
  const response = await api.get<Donacion>(`/donaciones/${id}`);
  return response.data;
};

// Crear una nueva donación
export const createDonacion = async (donacion: DonacionFormData): Promise<Donacion> => {
  const response = await api.post<Donacion>('/donaciones', donacion);
  return response.data;
};

// Actualizar una donación existente
export const updateDonacion = async (id: number, donacion: Partial<DonacionFormData>): Promise<Donacion> => {
  const response = await api.put<Donacion>(`/donaciones/${id}`, donacion);
  return response.data;
};

// Eliminar una donación
export const deleteDonacion = async (id: number): Promise<void> => {
  await api.delete(`/donaciones/${id}`);
};

// Obtener donaciones por usuario
export const getDonacionesByUsuario = async (idUsuario: number): Promise<Donacion[]> => {
  const response = await api.get<Donacion[]>(`/donaciones/usuario/${idUsuario}`);
  return response.data;
};

// Obtener donaciones por especie
export const getDonacionesByEspecie = async (idEspecie: number): Promise<Donacion[]> => {
  const response = await api.get<Donacion[]>(`/donaciones/especie/${idEspecie}`);
  return response.data;
};
