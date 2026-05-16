package com.sanvalero.reforest.dto;

public record AuthResponse(String token, String tipo, long id,
                           String nombre, String email, String rol) {
    public AuthResponse(String token, long id, String nombre, String email, String rol) {
        this(token, "Bearer", id, nombre, email, rol);
    }
}
