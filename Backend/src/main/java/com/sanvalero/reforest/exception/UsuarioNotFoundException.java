package com.sanvalero.reforest.exception;

public class UsuarioNotFoundException extends RuntimeException {
    public UsuarioNotFoundException(Long id) {
        super("User not found with ID: " + id);
    }
}