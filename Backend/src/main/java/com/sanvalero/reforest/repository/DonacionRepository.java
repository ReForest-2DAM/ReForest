package com.sanvalero.reforest.repository;

import com.sanvalero.reforest.model.Donacion;
import com.sanvalero.reforest.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonacionRepository extends JpaRepository<Donacion, Long> {

    /**
     * Encuentra donaciones por su estado.
     * @param estado El estado a buscar (ej. "COMPLETADA", "CANCELADA").
     * @return Lista de donaciones.
     */
    List<Donacion> findByEstado(String estado);

    /**
     * Encuentra todas las donaciones realizadas por un usuario específico.
     * @param usuario El objeto Usuario por el cual filtrar.
     * @return Lista de donaciones.
     */
    List<Donacion> findByUsuario(Usuario usuario);
}
