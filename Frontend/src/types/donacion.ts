export interface Donacion {
  id: number;
  fecha: string;
  nombre_donante: string;
  cantidad_arboles: number;
  total_donado: number;
  estado: string;
  pagado: boolean;
  id_especie?: number; // Compatibilidad con respuesta flat
  id_usuario?: number; // Compatibilidad con respuesta flat
  especie?: { id: number; [key: string]: unknown }; // Objeto anidado del backend
  usuario?: { id: number; [key: string]: unknown }; // Objeto anidado del backend
}

export interface DonacionFormData {
  fecha: string;
  nombre_donante: string;
  cantidad_arboles: number;
  total_donado: number;
  estado: string;
  pagado: boolean;
  id_especie: number;
  id_usuario: number;
}
