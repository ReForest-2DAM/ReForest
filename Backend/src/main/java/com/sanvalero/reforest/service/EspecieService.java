package com.sanvalero.reforest.service;

import com.sanvalero.reforest.exception.EspecieNotFoundException;
import com.sanvalero.reforest.model.Especie;
import com.sanvalero.reforest.repository.EspecieRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class EspecieService {

    private static final Logger logger = LoggerFactory.getLogger(EspecieService.class);

    @Autowired
    private EspecieRepository especieRepository;

    /**
     * Obtiene todas las especies, con posibilidad de filtrar.
     * @param disponible Filtra por disponibilidad (opcional).
     * @param zonaGeografica Filtra por zona geográfica (búsqueda parcial, opcional).
     * @return Lista de especies.
     */
    @Transactional(readOnly = true)
    public List<Especie> findAll(Boolean disponible, String zonaGeografica) {
        // Por defecto, si no se especifica, solo se buscan las especies disponibles.
        boolean disponibilidadFiltro = (disponible == null) ? true : disponible;
        logger.info("Buscando especies con filtros: disponible={}, zonaGeografica='{}'", disponibilidadFiltro, zonaGeografica);

        if (zonaGeografica != null && !zonaGeografica.trim().isEmpty()) {
            // TODO: Crear un método en el repositorio para buscar por ambos criterios a la vez.
            // De momento, filtramos en memoria, lo cual no es óptimo para grandes volúmenes.
            logger.warn("Filtrando por disponibilidad y zona geográfica en memoria. Considerar optimizar con una query específica.");
            return especieRepository.findByDisponible(disponibilidadFiltro).stream()
                    .filter(especie -> especie.getZonaGeografica().toLowerCase().contains(zonaGeografica.toLowerCase()))
                    .toList();
        } else {
            // Si no hay filtro de zona, se busca directamente por disponibilidad.
            return especieRepository.findByDisponible(disponibilidadFiltro);
        }
    }

    /**
     * Busca una especie por su ID
     * @param id ID de la especie
     * @return Especie encontrada
     * @throws EspecieNotFoundException si no se encuentra la especie
     */
    @Transactional(readOnly = true)
    public Especie findById(long id) {
        logger.info("Buscando especie con ID: {}", id);
        return especieRepository.findById(id)
                .orElseThrow(() -> new EspecieNotFoundException(id));
    }

    /**
     * Crea una nueva especie
     * @param especie Datos de la especie a crear
     * @return Especie creada con ID asignado
     */
    public Especie save(Especie especie) {
        logger.info("Creando nueva especie: {}", especie.getNombreComun());
        validarEspecie(especie);
        Especie especieGuardada = especieRepository.save(especie);
        logger.info("Especie creada con ID: {}", especieGuardada.getId());
        return especieGuardada;
    }

    /**
     * Actualiza una especie existente (PUT - actualización completa)
     * @param id ID de la especie a actualizar
     * @param especieActualizada Datos actualizados de la especie
     * @return Especie actualizada
     * @throws EspecieNotFoundException si no se encuentra la especie
     */
    public Especie update(long id, Especie especieActualizada) {
        logger.info("Actualizando especie con ID: {}", id);
        Especie especieExistente = findById(id);
        validarEspecie(especieActualizada);

        especieExistente.setNombreComun(especieActualizada.getNombreComun());
        especieExistente.setDescripcion(especieActualizada.getDescripcion());
        especieExistente.setPrecioPlantacion(especieActualizada.getPrecioPlantacion());
        especieExistente.setZonaGeografica(especieActualizada.getZonaGeografica());
        especieExistente.setCo2AnualKg(especieActualizada.getCo2AnualKg());
        especieExistente.setAlturaMaximaM(especieActualizada.getAlturaMaximaM());
        especieExistente.setDisponible(especieActualizada.isDisponible());
        especieExistente.setFechaTemporada(especieActualizada.getFechaTemporada());
        especieExistente.setImageUrl(especieActualizada.getImageUrl());

        Especie especieGuardada = especieRepository.save(especieExistente);
        logger.info("Especie actualizada con ID: {}", id);
        return especieGuardada;
    }

    /**
     * Actualiza parcialmente una especie (PATCH - actualización parcial)
     * @param id ID de la especie a actualizar
     * @param updates Mapa con los campos a actualizar
     * @return Especie actualizada
     * @throws EspecieNotFoundException si no se encuentra la especie
     */
    public Especie patch(long id, Map<String, Object> updates) {
        logger.info("Actualizando parcialmente especie con ID: {}", id);
        Especie especie = findById(id);

        updates.forEach((key, value) -> {
            switch (key) {
                case "nombre_comun": especie.setNombreComun((String) value); break;
                case "descripcion": especie.setDescripcion((String) value); break;
                case "precio_plantacion": especie.setPrecioPlantacion(((Number) value).doubleValue()); break;
                case "zona_geografica": especie.setZonaGeografica((String) value); break;
                case "co2_anual_kg": especie.setCo2AnualKg(((Number) value).doubleValue()); break;
                case "altura_maxima_m": especie.setAlturaMaximaM(((Number) value).intValue()); break;
                case "disponible": especie.setDisponible((Boolean) value); break;
                case "fecha_temporada": especie.setFechaTemporada(LocalDate.parse((String) value)); break;
                case "image_url": especie.setImageUrl((String) value); break;
                default: logger.warn("Campo desconocido en PATCH: {}", key);
            }
        });

        Especie especieGuardada = especieRepository.save(especie);
        logger.info("Especie actualizada parcialmente con ID: {}", id);
        return especieGuardada;
    }

    /**
     * Realiza un borrado lógico de una especie, marcándola como "no disponible".
     * La especie no se elimina físicamente, sino que se actualiza su estado.
     * @param id ID de la especie a desactivar
     * @throws EspecieNotFoundException si no se encuentra la especie
     */
    public void delete(long id) {
        logger.info("Desactivando especie con ID: {}", id);
        Especie especie = findById(id);
        especie.setDisponible(false);
        especieRepository.save(especie);
        logger.info("Especie con ID: {} marcada como no disponible.", id);
    }

    private void validarEspecie(Especie especie) {
        if (especie.getNombreComun() == null || especie.getNombreComun().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre común no puede estar vacío");
        }
        if (especie.getPrecioPlantacion() <= 0) {
            throw new IllegalArgumentException("El precio de plantación debe ser mayor a 0");
        }
        if (especie.getCo2AnualKg() < 0) {
            throw new IllegalArgumentException("El CO2 anual no puede ser negativo");
        }
        if (especie.getAlturaMaximaM() <= 0) {
            throw new IllegalArgumentException("La altura máxima debe ser mayor a 0");
        }
        logger.debug("Validación de especie exitosa: {}", especie.getNombreComun());
    }
}
