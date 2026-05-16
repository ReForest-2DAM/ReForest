package com.sanvalero.reforest.controller;

import com.sanvalero.reforest.model.Donacion;
import com.sanvalero.reforest.service.DonacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/donaciones")
@Tag(name = "Donaciones", description = "Operaciones sobre las donaciones de reforestación")
public class DonacionController {

    @Autowired
    private DonacionService donacionService;

    @Operation(summary = "Listar todas las donaciones o filtrar por criterios",
            description = "Devuelve un listado de donaciones. Se puede filtrar por estado y/o ID de usuario.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de donaciones obtenido correctamente",
                    content = @Content(schema = @Schema(implementation = Donacion.class)))
    })
    @GetMapping
    public ResponseEntity<List<Donacion>> listar(
            @Parameter(description = "Filtrar por estado de la donación (ej. COMPLETADA, CANCELADA)") @RequestParam(required = false) String estado,
            @Parameter(description = "Filtrar por el ID del usuario que realizó la donación") @RequestParam(required = false) Long usuarioId) {
        List<Donacion> donaciones = donacionService.findAll(estado, usuarioId);
        return ResponseEntity.ok(donaciones);
    }

    @Operation(summary = "Obtener detalle de una donación", description = "Devuelve la información completa de una donación por su ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Donación encontrada",
                    content = @Content(schema = @Schema(implementation = Donacion.class))),
            @ApiResponse(responseCode = "404", description = "Donación no encontrada",
                    content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<Donacion> detalle(@PathVariable long id) {
        Donacion donacion = donacionService.findById(id);
        return ResponseEntity.ok(donacion);
    }

    @Operation(summary = "Registrar una nueva donación", description = "Crea una donación vinculada a un usuario y una especie. El total se calcula automáticamente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Donación creada correctamente",
                    content = @Content(schema = @Schema(implementation = Donacion.class))),
            @ApiResponse(responseCode = "400", description = "Datos de la donación no válidos (ej. ID de usuario o especie no proporcionado)",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario o Especie asociada no encontrada",
                    content = @Content)
    })
    @PostMapping
    public ResponseEntity<Donacion> crear(@Valid @RequestBody Donacion donacion) {
        Donacion nuevaDonacion = donacionService.save(donacion);
        return new ResponseEntity<>(nuevaDonacion, HttpStatus.CREATED);
    }

    @Operation(summary = "Modificar una donación (completo)", description = "Actualiza todos los datos de una donación existente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Donación modificada correctamente",
                    content = @Content(schema = @Schema(implementation = Donacion.class))),
            @ApiResponse(responseCode = "404", description = "Donación no encontrada",
                    content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<Donacion> modificar(@PathVariable long id, @Valid @RequestBody Donacion donacion) {
        Donacion donacionActualizada = donacionService.update(id, donacion);
        return ResponseEntity.ok(donacionActualizada);
    }

    @Operation(summary = "Modificar una donación (parcial)", description = "Actualiza uno o más campos de una donación, como el estado o si ha sido pagada.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Donación modificada correctamente",
                    content = @Content(schema = @Schema(implementation = Donacion.class))),
            @ApiResponse(responseCode = "404", description = "Donación no encontrada",
                    content = @Content)
    })
    @PatchMapping("/{id}")
    public ResponseEntity<Donacion> modificarParcialmente(@PathVariable long id, @RequestBody Map<String, Object> updates) {
        Donacion donacionActualizada = donacionService.patch(id, updates);
        return ResponseEntity.ok(donacionActualizada);
    }

    @Operation(summary = "Eliminar una donación (Borrado lógico)", description = "Realiza un borrado" +
            " lógico de la donación, cambiando su estado a 'CANCELADA'.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Donación cancelada correctamente"),
            @ApiResponse(responseCode = "404", description = "Donación no encontrada",
                    content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable long id) {
        donacionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
