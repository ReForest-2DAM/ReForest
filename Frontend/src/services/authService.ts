import api from '../config/apiClient';
import type { Usuario, LoginData, UsuarioFormData } from '../types';

const notifyAuthChange = () => window.dispatchEvent(new Event('auth-change'));

export const login = async (credentials: LoginData): Promise<Usuario> => {
  const response = await api.post<{ token: string; usuario: Usuario }>('/auth/login', {
    email: credentials.email,
    contrasena: credentials.contrasena
  });
  const { token, usuario } = response.data;
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
  notifyAuthChange();
  return usuario;
};

export const register = async (userData: UsuarioFormData): Promise<Usuario> => {
  const response = await api.post<{ token: string; usuario: Usuario }>('/auth/register', userData);
  const { token, usuario } = response.data;
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
  notifyAuthChange();
  return usuario;
};

export const logout = (): void => {
  localStorage.removeItem('usuario');
  localStorage.removeItem('token');
  notifyAuthChange();
};

export const getCurrentUser = async (): Promise<Usuario> => {
  const data = localStorage.getItem('usuario');
  if (!data) throw new Error('No hay usuario logueado');
  return JSON.parse(data) as Usuario;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};
