package com.sanvalero.reforest.controller;

import com.sanvalero.reforest.exception.ErrorResponse;
import com.sanvalero.reforest.exception.UsuarioNotFoundException;
import com.sanvalero.reforest.model.Usuario;
import com.sanvalero.reforest.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*")
@Tag(name = "Usuarios", description = "Gestión de usuarios del sistema")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Operation(summary = "Obtener lista de todos los usuarios", description = "Devuelve una lista con todos los usuarios registrados en el sistema.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de usuarios obtenida con éxito", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Usuario.class), examples = @ExampleObject(value = """
                    [
                        {
                            "id": 1,
                            "nombre": "Juan Pérez",
                            "email": "juan.perez@example.com",
                            "rol": "USER"
                        },
                        {
                            "id": 2,
                            "nombre": "Ana López",
                            "email": "ana.lopez@example.com",
                            "rol": "ADMIN"
                        }
                    ]
                """))),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = """
                    {
                        "code": "INTERNAL_SERVER_ERROR",
                        "message": "Ha ocurrido un error inesperado en el servidor."
                    }
                """)))
    })
    @GetMapping
    public ResponseEntity<List<Usuario>> getAllUsuarios() {
        List<Usuario> usuarios = usuarioService.findAll();
        return ResponseEntity.ok(usuarios);
    }

    @Operation(summary = "Obtener un usuario por su ID", description = "Devuelve los detalles de un usuario específico buscando por su ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Usuario.class), examples = @ExampleObject(value = """
                    {
                        "id": 1,
                        "nombre": "Juan Pérez",
                        "email": "juan.perez@example.com",
                        "rol": "USER"
                    }
                """))),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = """
                    {
                        "code": "USER_NOT_FOUND",
                        "message": "Usuario no encontrado con ID: 99"
                    }
                """))),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = """
                    {
                        "code": "INTERNAL_SERVER_ERROR",
                        "message": "Ha ocurrido un error inesperado en el servidor."
                    }
                """)))
    })
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable long id) {
        // ✅ CORREGIDO: El servicio ya lanza la excepción si no encuentra el usuario
        Usuario usuario = usuarioService.findById(id);
        return ResponseEntity.ok(usuario);
    }

    @Operation(summary = "Crear un nuevo usuario", description = "Registra un nuevo usuario en el sistema. La contraseña debe ser manejada de forma segura (ej. hashing) en la capa de servicio.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuario creado con éxito", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Usuario.class), examples = @ExampleObject(value = """
                    {
                        "id": 3,
                        "nombre": "Carlos Gomez",
                        "email": "carlos.gomez@example.com",
                        "rol": "USER"
                    }
                """))),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = """
                    {
                        "code": "BAD_REQUEST",
                        "message": "El campo 'email' no puede ser nulo y debe tener un formato válido."
                    }
                """))),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = """
                    {
                        "code": "INTERNAL_SERVER_ERROR",
                        "message": "Ha ocurrido un error inesperado en el servidor."
                    }
                """)))
    })
    @PostMapping
    public ResponseEntity<Usuario> createUsuario(@RequestBody Usuario usuario) {
        Usuario nuevoUsuario = usuarioService.save(usuario);
        return new ResponseEntity<>(nuevoUsuario, HttpStatus.CREATED);
    }

    @Operation(summary = "Actualizar un usuario existente (completo)", description = "Modifica todos los datos de un usuario existente buscando por su ID. Requiere el objeto completo.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario actualizado con éxito", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Usuario.class), examples = @ExampleObject(value = """
                    {
                        "id": 1,
                        "nombre": "Juan Pérez Actualizado",
                        "email": "juan.perez.new@example.com",
                        "rol": "USER"
                    }
                """))),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = """
                    {
                        "code": "BAD_REQUEST",
                        "message": "El campo 'nombre' no puede estar vacío."
                    }
                """))),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = """
                    {
                        "code": "USER_NOT_FOUND",
                        "message": "Usuario no encontrado con ID: 99"
                    }
                """))),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = """
                    {
                        "code": "INTERNAL_SERVER_ERROR",
                        "message": "Ha ocurrido un error inesperado en el servidor."
                    }
                """)))
    })
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> updateUsuario(@PathVariable long id, @RequestBody Usuario usuario) {
        Usuario usuarioActualizado = usuarioService.update(id, usuario);
        return ResponseEntity.ok(usuarioActualizado);
    }

    @Operation(summary = "Actualizar parcialmente un usuario", description = "Actualiza uno o más campos de un usuario existente. A diferencia de PUT, no es necesario enviar el objeto completo.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario actualizado con éxito", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Usuario.class), examples = @ExampleObject(value = """
            {
                "id": 1,
                "nombre": "Juan Pérez",
                "email": "juan.perez.new@example.com",
                "rol": "USER"
            }
        """))),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = """
            {
                "code": "BAD_REQUEST",
                "message": "El formato del campo 'email' es inválido."
            }
        """))),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = """
            {
                "code": "USER_NOT_FOUND",
                "message": "Usuario no encontrado con ID: 99"
            }
        """))),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = """
            {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "Ha ocurrido un error inesperado en el servidor."
            }
        """)))
    })
    @PatchMapping("/{id}")
    public ResponseEntity<Usuario> patchUsuario(@PathVariable long id, @RequestBody Map<String, Object> updates) {
        Usuario updatedUsuario = usuarioService.patch(id, updates);
        return ResponseEntity.ok(updatedUsuario);
    }

    @Operation(summary = "Eliminar un usuario por su ID", description = "Elimina un usuario del sistema de forma permanente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Usuario eliminado con éxito. No hay contenido en la respuesta."),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = """
                    {
                        "code": "USER_NOT_FOUND",
                        "message": "Usuario no encontrado con ID: 99"
                    }
                """))),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = """
                    {
                        "code": "INTERNAL_SERVER_ERROR",
                        "message": "Ha ocurrido un error inesperado en el servidor."
                    }
                """)))
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable long id) {
        usuarioService.delete(id);
        return ResponseEntity.noContent().build();
    }
}