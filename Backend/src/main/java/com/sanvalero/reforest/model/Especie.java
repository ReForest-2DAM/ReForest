package com.sanvalero.reforest.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "especies")
@Data                    // ✅ Genera getters, setters, toString, equals, hashCode
@NoArgsConstructor       // ✅ Constructor vacío
@AllArgsConstructor      // ✅ Constructor con todos los campos
public class Especie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotBlank(message = "Common name is mandatory")
    @Column(name = "nombre_comun", nullable = false)
    private String nombreComun;    // ✅ IMPORTANTE: camelCase, no snake_case

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Positive(message = "Planting price must be greater than 0")
    @Column(name = "precio_plantacion", nullable = false)
    private double precioPlantacion;

    @Column(name = "zona_geografica")
    private String zonaGeografica;

    @Min(value = 0, message = "Annual CO2 must be 0 or greater")
    @Column(name = "co2_anual_kg")
    private double co2AnualKg;

    @Min(value = 0, message = "Maximum height must be 0 or greater")
    @Column(name = "altura_maxima_m")
    private int alturaMaximaM;

    @Column(name = "disponible")
    private boolean disponible = true;

    @Column(name = "fecha_temporada")
    private LocalDate fechaTemporada;

    @Column(name = "image_url")
    private String imageUrl;
}