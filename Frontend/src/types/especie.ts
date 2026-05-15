export interface Especie {
  id: number;
  nombre_comun: string;
  descripcion: string;
  precio_plantacion: number;
  zona_geografica: string;
  co2_anual_kg: number;
  altura_maxima_m: number;
  disponible: boolean;
  fecha_temporada: string;
  image_url: string;
}

export interface EspecieFormData {
  nombre_comun: string;
  descripcion: string;
  precio_plantacion: number;
  zona_geografica: string;
  co2_anual_kg: number;
  altura_maxima_m: number;
  disponible: boolean;
  fecha_temporada: string;
  image_url: string;
}
