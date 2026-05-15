package com.sanvalero.reforest.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "donaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Donacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "fecha")
    private LocalDate fecha = LocalDate.now();

    @Column(name = "nombre_donante", nullable = false)
    private String nombreDonante;

    @Column(name = "cantidad_arboles", nullable = false)
    private int cantidadArboles;

    @Column(name = "total_donado")
    private double totalDonado;

    @Column(name = "estado")
    private String estado = "pendiente";

    @Column(name = "pagado")
    private boolean pagado = false;

    @ManyToOne
    @JoinColumn(name = "id_especie", nullable = false)
    private Especie especie;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;
}

// Prueba para PR de Actions