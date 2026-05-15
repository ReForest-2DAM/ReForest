package com.sanvalero.reforest.service;

import com.sanvalero.reforest.exception.UsuarioNotFoundException;
import com.sanvalero.reforest.model.Usuario;
import com.sanvalero.reforest.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional
public class UsuarioService {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Obtiene todos los usuarios
     * @return Lista de todos los usuarios
     */
    @Transactional(readOnly = true)
    public List<Usuario> findAll() {
        logger.info("Obteniendo todos los usuarios");
        return usuarioRepository.findAll();
    }

    /**
     * Busca un usuario por su ID
     * @param id ID del usuario
     * @return Usuario encontrado
     * @throws UsuarioNotFoundException si no se encuentra el usuario
     */
    @Transactional(readOnly = true)
    public Usuario findById(long id) {
        logger.info("Buscando usuario con ID: {}", id);
        return usuarioRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Usuario no encontrado con ID: {}", id);
                    return new UsuarioNotFoundException(id);
                });
    }

    /**
     * Crea un nuevo usuario
     * @param usuario Datos del usuario a crear
     * @return Usuario creado con ID asignado
     */
    public Usuario save(Usuario usuario) {
        logger.info("Creando nuevo usuario: {}", usuario.getEmail());

        // Rol por defecto si no viene informado
        if (usuario.getRol() == null || usuario.getRol().isBlank()) {
            usuario.setRol("USER");
        }

        // Validaciones de negocio (valida la contraseña en claro, antes de hashear)
        validarUsuario(usuario);

        // [LEARN] BCrypt: hash de un solo sentido con salt. Nunca se guarda la
        // contraseña en claro; al loguear se comparan hashes, no textos.
        usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));

        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        logger.info("Usuario creado con ID: {}", usuarioGuardado.getId());

        return usuarioGuardado;
    }

    /**
     * Actualiza un usuario existente (PUT - actualización completa)
     * @param id ID del usuario a actualizar
     * @param usuarioActualizado Datos actualizados del usuario
     * @return Usuario actualizado
     * @throws UsuarioNotFoundException si no se encuentra el usuario
     */
    public Usuario update(long id, Usuario usuarioActualizado) {
        logger.info("Actualizando usuario con ID: {}", id);

        // Verificar que el usuario existe
        Usuario usuarioExistente = findById(id);

        // Validar los nuevos datos
        validarUsuario(usuarioActualizado);

        // Actualizar todos los campos manteniendo el ID original
        usuarioExistente.setNombre(usuarioActualizado.getNombre());
        usuarioExistente.setEmail(usuarioActualizado.getEmail());
        usuarioExistente.setRol(usuarioActualizado.getRol());

        // Solo actualizar contraseña si viene informada
        if (usuarioActualizado.getContrasena() != null && !usuarioActualizado.getContrasena().isEmpty()) {
            usuarioExistente.setContrasena(passwordEncoder.encode(usuarioActualizado.getContrasena()));
        }

        Usuario usuarioGuardado = usuarioRepository.save(usuarioExistente);
        logger.info("Usuario actualizado con ID: {}", id);

        return usuarioGuardado;
    }

    /**
     * Actualiza parcialmente un usuario (PATCH - actualización parcial)
     * @param id ID del usuario a actualizar
     * @param updates Mapa con los campos a actualizar
     * @return Usuario actualizado
     * @throws UsuarioNotFoundException si no se encuentra el usuario
     */
    public Usuario patch(long id, Map<String, Object> updates) {
        logger.info("Actualizando parcialmente usuario con ID: {}", id);

        // Verificar que el usuario existe
        Usuario usuario = findById(id);

        // Actualizar solo los campos proporcionados
        updates.forEach((key, value) -> {
            switch (key) {
                case "nombre":
                    usuario.setNombre((String) value);
                    break;
                case "email":
                    String nuevoEmail = (String) value;
                    validarEmail(nuevoEmail);
                    usuario.setEmail(nuevoEmail);
                    break;
                case "contrasena":
                    usuario.setContrasena(passwordEncoder.encode((String) value));
                    break;
                case "rol":
                    String nuevoRol = (String) value;
                    validarRol(nuevoRol);
                    usuario.setRol(nuevoRol);
                    break;
                case "id":
                    logger.warn("Intento de modificar ID del usuario ignorado");
                    break;
                default:
                    logger.warn("Campo desconocido en PATCH: {}", key);
            }
        });

        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        logger.info("Usuario actualizado parcialmente con ID: {}", id);

        return usuarioGuardado;
    }

    /**
     * Elimina un usuario por su ID
     * @param id ID del usuario a eliminar
     * @throws UsuarioNotFoundException si no se encuentra el usuario
     */
    public void delete(long id) {
        logger.info("Eliminando usuario con ID: {}", id);

        // Verificar que el usuario existe
        Usuario usuario = findById(id);

        usuarioRepository.delete(usuario);
        logger.info("Usuario eliminado con ID: {}", id);
    }

    /**
     * Valida los datos de un usuario antes de guardar
     * @param usuario Usuario a validar
     * @throws IllegalArgumentException si algún dato es inválido
     */
    private void validarUsuario(Usuario usuario) {
        // Validar nombre
        if (usuario.getNombre() == null || usuario.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre no puede estar vacío");
        }

        // Validar email
        validarEmail(usuario.getEmail());

        // Validar contraseña (solo en creación o si viene informada)
        if (usuario.getContrasena() != null && usuario.getContrasena().length() < 6) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres");
        }

        // Validar rol
        validarRol(usuario.getRol());

        logger.debug("Validación de usuario exitosa: {}", usuario.getEmail());
    }

    /**
     * Valida el formato del email
     * @param email Email a validar
     * @throws IllegalArgumentException si el email es inválido
     */
    private void validarEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("El email no puede estar vacío");
        }

        // Validación básica de formato de email
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new IllegalArgumentException("El formato del email es inválido");
        }
    }

    /**
     * Valida que el rol sea válido
     * @param rol Rol a validar
     * @throws IllegalArgumentException si el rol es inválido
     */
    private void validarRol(String rol) {
        if (rol == null || rol.trim().isEmpty()) {
            throw new IllegalArgumentException("El rol no puede estar vacío");
        }

        // Validar que el rol sea uno de los permitidos
        if (!rol.equals("USER") && !rol.equals("ADMIN")) {
            throw new IllegalArgumentException("El rol debe ser USER o ADMIN");
        }
    }
}