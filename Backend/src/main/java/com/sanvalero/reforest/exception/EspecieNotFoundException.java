package com.sanvalero.reforest.exception;

/**
 * Excepción personalizada lanzada cuando no se encuentra una especie
 */
public class EspecieNotFoundException extends RuntimeException {

    /**
     * Constructor con ID de la especie
     * @param id ID de la especie no encontrada
     */
    public EspecieNotFoundException(long id) {
        super("Especie no encontrada con ID: " + id);
    }

    /**
     * Constructor con mensaje personalizado
     * @param message Mensaje de error personalizado
     */
    public EspecieNotFoundException(String message) {
        super(message);
    }

    /**
     * Constructor con mensaje y causa
     * @param message Mensaje de error
     * @param cause Causa de la excepción
     */
    public EspecieNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}