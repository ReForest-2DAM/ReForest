import apiClient from '../config/apiClient';
import type { Especie, EspecieFormData } from '../types';

// Obtener todas las especies
export const getAllEspecies = async (): Promise<Especie[]> => {
  const response = await apiClient.get<Especie[]>('/especies');
  return response.data;
};

// Obtener una especie por ID
export const getEspecieById = async (id: number): Promise<Especie> => {
  const response = await apiClient.get<Especie>(`/especies/${id}`);
  return response.data;
};

// Crear una nueva especie
export const createEspecie = async (especie: EspecieFormData): Promise<Especie> => {
  const response = await apiClient.post<Especie>('/especies', especie);
  return response.data;
};

// Actualizar una especie existente
export const updateEspecie = async (id: number, especie: Partial<EspecieFormData>): Promise<Especie> => {
  const response = await apiClient.put<Especie>(`/especies/${id}`, especie);
  return response.data;
};

// Eliminar una especie
export const deleteEspecie = async (id: number): Promise<void> => {
  await apiClient.delete(`/especies/${id}`);
};

// Obtener especies disponibles
export const getEspeciesDisponibles = async (): Promise<Especie[]> => {
  const response = await apiClient.get<Especie[]>('/especies/disponibles');
  return response.data;
};
