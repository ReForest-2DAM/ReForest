package com.sanvalero.reforest.controller;

import com.sanvalero.reforest.model.Especie;
import com.sanvalero.reforest.service.EspecieService;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
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
@RequestMapping("/especies")
@CrossOrigin(origins = "*")
@Tag(name = "Especies", description = "Operaciones sobre el catálogo de especies arbóreas")
public class EspecieController {

    @Autowired
    private EspecieService especieService;

    @Operation(summary = "Listar todas las especies o filtrar por criterios",
            description = "Devuelve un listado de especies. Se puede filtrar por disponibilidad y/o zona geográfica.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de especies obtenido correctamente",
                    content = @Content(schema = @Schema(implementation = Especie.class)))
    })
    @GetMapping
    public ResponseEntity<List<Especie>> listar(
            @Parameter(description = "Filtrar por si la especie está disponible (true/false)") @RequestParam(required = false) Boolean disponible,
            @Parameter(description = "Filtrar por zona geográfica (búsqueda parcial)") @RequestParam(required = false) String zonaGeografica) {
        List<Especie> especies = especieService.findAll(disponible, zonaGeografica);
        return ResponseEntity.ok(especies);
    }

    @Operation(summary = "Obtener detalle de una especie", description = "Devuelve la información completa de una especie por su ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Especie encontrada",
                    content = @Content(schema = @Schema(implementation = Especie.class))),
            @ApiResponse(responseCode = "404", description = "Especie no encontrada",
                    content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<Especie> detalle(@PathVariable long id) {
        Especie especie = especieService.findById(id);
        return ResponseEntity.ok(especie);
    }

    @Operation(summary = "Registrar una nueva especie", description = "Crea una nueva especie en el catálogo")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Especie creada correctamente",
                    content = @Content(schema = @Schema(implementation = Especie.class))),
            @ApiResponse(responseCode = "400", description = "Datos de la especie no válidos",
                    content = @Content)
    })
    @PostMapping
    public ResponseEntity<Especie> crear(@Valid @RequestBody Especie especie) {
        Especie nuevaEspecie = especieService.save(especie);
        return new ResponseEntity<>(nuevaEspecie, HttpStatus.CREATED);
    }

    @Operation(summary = "Modificar una especie (completo)", description = "Actualiza todos los datos de una especie existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Especie modificada correctamente",
                    content = @Content(schema = @Schema(implementation = Especie.class))),
            @ApiResponse(responseCode = "404", description = "Especie no encontrada",
                    content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<Especie> modificar(@PathVariable long id, @Valid @RequestBody Especie especie) {
        Especie especieActualizada = especieService.update(id, especie);
        return ResponseEntity.ok(especieActualizada);
    }

    @Operation(summary = "Modificar una especie (parcial)", description = "Actualiza solo algunos campos de una especie existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Especie modificada correctamente",
                    content = @Content(schema = @Schema(implementation = Especie.class))),
            @ApiResponse(responseCode = "404", description = "Especie no encontrada",
                    content = @Content)
    })
    @PatchMapping("/{id}")
    public ResponseEntity<Especie> modificarParcialmente(@PathVariable long id, @RequestBody Map<String, Object> updates) {
        Especie especieActualizada = especieService.patch(id, updates);
        return ResponseEntity.ok(especieActualizada);
    }

    @Operation(summary = "Eliminar una especie", description = "Elimina una especie del catálogo")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Especie eliminada correctamente"),
            @ApiResponse(responseCode = "404", description = "Especie no encontrada",
                    content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable long id) {
        especieService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
