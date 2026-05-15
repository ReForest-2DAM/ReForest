package com.sanvalero.reforest.repository;

import com.sanvalero.reforest.model.Especie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EspecieRepository extends JpaRepository<Especie, Long> {

    /**
     * Encuentra especies por su estado de disponibilidad.
     * @param disponible true para disponibles, false para no disponibles.
     * @return Lista de especies.
     */
    List<Especie> findByDisponible(boolean disponible);

    /**
     * Encuentra especies por zona geográfica (ignorando mayúsculas/minúsculas).
     * @param zonaGeografica La zona geográfica a buscar.
     * @return Lista de especies.
     */
    List<Especie> findByZonaGeograficaContainingIgnoreCase(String zonaGeografica);
}
