export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export interface LoginData {
  email: string;
  contrasena: string;
}

export interface UsuarioFormData {
  nombre: string;
  email: string;
  contrasena: string;
  rol: string;
}
