import api from '../config/apiClient';
import type { Usuario, LoginData, UsuarioFormData } from '../types';

const notifyAuthChange = () => window.dispatchEvent(new Event('auth-change'));

interface AuthResponse {
  token: string;
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

function saveSession(data: AuthResponse): Usuario {
  const usuario: Usuario = { id: data.id, nombre: data.nombre, email: data.email, rol: data.rol };
  localStorage.setItem('token', data.token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
  notifyAuthChange();
  return usuario;
}

export const login = async (credentials: LoginData): Promise<Usuario> => {
  const response = await api.post<AuthResponse>('/auth/login', {
    email: credentials.email,
    contrasena: credentials.contrasena
  });
  return saveSession(response.data);
};

export const register = async (userData: UsuarioFormData): Promise<Usuario> => {
  const response = await api.post<AuthResponse>('/auth/register', userData);
  return saveSession(response.data);
};

export const logout = (): void => {
  localStorage.removeItem('usuario');
  localStorage.removeItem('token');
  notifyAuthChange();
};

export const getCurrentUser = async (): Promise<Usuario> => {
  const data = localStorage.getItem('usuario');
  if (!data || data === 'undefined' || data === 'null') {
    localStorage.removeItem('usuario');
    throw new Error('No hay usuario logueado');
  }
  try {
    return JSON.parse(data) as Usuario;
  } catch {
    localStorage.removeItem('usuario');
    throw new Error('Sesión corrupta, vuelve a iniciar sesión');
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token') || !!localStorage.getItem('usuario');
};
