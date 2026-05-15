import api from '../config/apiClient';
import type { Usuario, UsuarioFormData } from '../types';

export const getAllUsuarios = async (): Promise<Usuario[]> => {
  const response = await api.get<Usuario[]>('/usuarios');
  return response.data;
};

export const getUsuarioById = async (id: number): Promise<Usuario> => {
  const response = await api.get<Usuario>(`/usuarios/${id}`);
  return response.data;
};

export const updateUsuario = async (id: number, usuario: Partial<UsuarioFormData>): Promise<Usuario> => {
  const response = await api.put<Usuario>(`/usuarios/${id}`, usuario);
  return response.data;
};

export const createUsuario = async (usuario: UsuarioFormData): Promise<Usuario> => {
  const response = await api.post<Usuario>('/usuarios', usuario);
  return response.data;
};

export const deleteUsuario = async (id: number): Promise<void> => {
  await api.delete(`/usuarios/${id}`);
};
