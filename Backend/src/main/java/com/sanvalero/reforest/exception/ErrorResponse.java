package com.sanvalero.reforest.exception;

public class ErrorResponse {

    private int code;
    private String message;

    // Constructor sin argumentos
    public ErrorResponse() {
    }

    // Constructor con todos los argumentos
    public ErrorResponse(int code, String message) {
        this.code = code;
        this.message = message;
    }

    // Getters
    public int getCode() { return code; }
    public String getMessage() { return message; }
}