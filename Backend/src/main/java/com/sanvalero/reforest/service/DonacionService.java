package com.sanvalero.reforest.service;

import com.sanvalero.reforest.exception.DonacionNotFoundException;
import com.sanvalero.reforest.exception.EspecieNotFoundException;
import com.sanvalero.reforest.exception.UsuarioNotFoundException;
import com.sanvalero.reforest.model.Donacion;
import com.sanvalero.reforest.model.Especie;
import com.sanvalero.reforest.model.Usuario;
import com.sanvalero.reforest.repository.DonacionRepository;
import com.sanvalero.reforest.repository.EspecieRepository;
import com.sanvalero.reforest.repository.UsuarioRepository;
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
public class DonacionService {

    private static final Logger logger = LoggerFactory.getLogger(DonacionService.class);

    @Autowired
    private DonacionRepository donacionRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EspecieRepository especieRepository;

    @Transactional(readOnly = true)
    public List<Donacion> findAll(String estado, Long usuarioId) {
        logger.info("Buscando donaciones con filtros: estado='{}', usuarioId={}", estado, usuarioId);

        if (estado != null && !estado.trim().isEmpty() && usuarioId != null) {
            logger.warn("Filtrando por estado y usuario en memoria. Considerar optimizar con una query específica.");
            Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow(() -> new UsuarioNotFoundException(usuarioId));
            return donacionRepository.findByUsuario(usuario).stream()
                    .filter(donacion -> donacion.getEstado().equalsIgnoreCase(estado))
                    .toList();
        } else if (estado != null && !estado.trim().isEmpty()) {
            return donacionRepository.findByEstado(estado);
        } else if (usuarioId != null) {
            Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow(() -> new UsuarioNotFoundException(usuarioId));
            return donacionRepository.findByUsuario(usuario);
        } else {
            return donacionRepository.findAll();
        }
    }

    @Transactional(readOnly = true)
    public Donacion findById(long id) {
        logger.info("Buscando donación con ID: {}", id);
        return donacionRepository.findById(id)
                .orElseThrow(() -> new DonacionNotFoundException(id));
    }

    public Donacion save(Donacion donacion) {
        logger.info("Creando nueva donación");

        Usuario usuario = usuarioRepository.findById(donacion.getUsuario().getId())
                .orElseThrow(() -> new UsuarioNotFoundException(donacion.getUsuario().getId()));

        Especie especie = especieRepository.findById(donacion.getEspecie().getId())
                .orElseThrow(() -> new EspecieNotFoundException(donacion.getEspecie().getId()));

        if (!especie.isDisponible()) {
            throw new IllegalStateException("The species '" + especie.getNombreComun() + "' is not available for donation.");
        }

        donacion.setUsuario(usuario);
        donacion.setEspecie(especie);
        donacion.setFecha(LocalDate.now());
        donacion.setEstado("COMPLETADA");
        donacion.setTotalDonado(donacion.getCantidadArboles() * especie.getPrecioPlantacion());

        Donacion nuevaDonacion = donacionRepository.save(donacion);
        logger.info("Donación creada con ID: {}", nuevaDonacion.getId());
        return nuevaDonacion;
    }

    public Donacion update(long id, Donacion donacionActualizada) {
        logger.info("Actualizando completamente donación con ID: {}", id);
        Donacion donacionExistente = findById(id);

        Usuario usuario = usuarioRepository.findById(donacionActualizada.getUsuario().getId())
                .orElseThrow(() -> new UsuarioNotFoundException(donacionActualizada.getUsuario().getId()));
        Especie especie = especieRepository.findById(donacionActualizada.getEspecie().getId())
                .orElseThrow(() -> new EspecieNotFoundException(donacionActualizada.getEspecie().getId()));

        donacionExistente.setNombreDonante(donacionActualizada.getNombreDonante());
        donacionExistente.setCantidadArboles(donacionActualizada.getCantidadArboles());
        donacionExistente.setEstado(donacionActualizada.getEstado());
        donacionExistente.setPagado(donacionActualizada.isPagado());
        donacionExistente.setUsuario(usuario);
        donacionExistente.setEspecie(especie);
        donacionExistente.setTotalDonado(donacionExistente.getCantidadArboles() * especie.getPrecioPlantacion());

        return donacionRepository.save(donacionExistente);
    }

    public Donacion patch(long id, Map<String, Object> updates) {
        logger.info("Actualizando parcialmente donación con ID: {}", id);
        Donacion donacion = findById(id);

        updates.forEach((key, value) -> {
            switch (key) {
                case "estado":
                    donacion.setEstado((String) value);
                    break;
                case "pagado":
                    donacion.setPagado((Boolean) value);
                    break;
                case "nombre_donante":
                    donacion.setNombreDonante((String) value);
                    break;
                default:
                    logger.warn("Campo desconocido en PATCH para donación: {}", key);
            }
        });

        return donacionRepository.save(donacion);
    }

    /**
     * Realiza un borrado lógico de una donación, cambiando su estado a 'CANCELADA'.
     * @param id ID de la donación a cancelar.
     * @throws DonacionNotFoundException si no se encuentra la donación.
     */
    public void delete(long id) {
        logger.info("Realizando borrado lógico de donación con ID: {}", id);
        Donacion donacion = findById(id);
        donacion.setEstado("CANCELADA");
        donacionRepository.save(donacion);
        logger.info("Donación con ID {} marcada como CANCELADA", id);
    }
}
