package com.sanvalero.reforest.model;

import jakarta.persistence.*;
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

    @Column(name = "nombre_comun", nullable = false)
    private String nombreComun;    // ✅ IMPORTANTE: camelCase, no snake_case

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "precio_plantacion", nullable = false)
    private double precioPlantacion;

    @Column(name = "zona_geografica")
    private String zonaGeografica;

    @Column(name = "co2_anual_kg")
    private double co2AnualKg;

    @Column(name = "altura_maxima_m")
    private int alturaMaximaM;

    @Column(name = "disponible")
    private boolean disponible = true;

    @Column(name = "fecha_temporada")
    private LocalDate fechaTemporada;

    @Column(name = "image_url")
    private String imageUrl;
}