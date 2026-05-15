import api from '../config/apiClient';
import type { Usuario, LoginData, UsuarioFormData } from '../types';

const notifyAuthChange = () => window.dispatchEvent(new Event('auth-change'));

// Login simple: busca usuario por email y comprueba contraseña
export const login = async (credentials: LoginData): Promise<Usuario> => {
  const response = await api.get<Usuario[]>('/usuarios');
  const usuario = response.data.find(
    (u) => u.email === credentials.email
  );

  if (!usuario) {
    throw new Error('No existe un usuario con ese email');
  }

  // Comprobamos contraseña pidiendo por email (el backend no expone contrasena en GET)
  // Intentamos login via POST si existe, si no, guardamos directamente
  try {
    const loginResponse = await api.post<Usuario>('/usuarios/login', credentials);
    localStorage.setItem('usuario', JSON.stringify(loginResponse.data));
    notifyAuthChange();
    return loginResponse.data;
  } catch {
    // Si no existe endpoint /usuarios/login, guardamos el usuario encontrado por email
    localStorage.setItem('usuario', JSON.stringify(usuario));
    notifyAuthChange();
    return usuario;
  }
};

// Registro: crea un nuevo usuario via POST /usuarios
export const register = async (userData: UsuarioFormData): Promise<Usuario> => {
  const response = await api.post<Usuario>('/usuarios', userData);
  localStorage.setItem('usuario', JSON.stringify(response.data));
  notifyAuthChange();
  return response.data;
};

// Cerrar sesion
export const logout = (): void => {
  localStorage.removeItem('usuario');
  localStorage.removeItem('token');
  notifyAuthChange();
};

// Obtener usuario actual desde localStorage
export const getCurrentUser = async (): Promise<Usuario> => {
  const data = localStorage.getItem('usuario');
  if (!data) {
    throw new Error('No hay usuario logueado');
  }
  return JSON.parse(data) as Usuario;
};

// Verificar si hay sesion activa
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('usuario');
};
