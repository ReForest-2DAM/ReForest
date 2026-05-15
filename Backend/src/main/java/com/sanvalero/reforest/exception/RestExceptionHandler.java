package com.sanvalero.reforest.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
public class RestExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(UsuarioNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUsuarioNotFoundException(UsuarioNotFoundException unfe) {
        ErrorResponse errorResponse = new ErrorResponse(HttpStatus.NOT_FOUND.value(), unfe.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    // Asumiendo que crearás una excepción EspecieNotFoundException
    // @ExceptionHandler(EspecieNotFoundException.class)
    // public ResponseEntity<ErrorResponse> handleEspecieNotFoundException(EspecieNotFoundException enfe) {
    //     ErrorResponse errorResponse = new ErrorResponse(HttpStatus.NOT_FOUND.value(), enfe.getMessage());
    //     return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    // }

    // Asumiendo que crearás una excepción DonacionNotFoundException
    // @ExceptionHandler(DonacionNotFoundException.class)
    // public ResponseEntity<ErrorResponse> handleDonacionNotFoundException(DonacionNotFoundException dnfe) {
    //     ErrorResponse errorResponse = new ErrorResponse(HttpStatus.NOT_FOUND.value(), dnfe.getMessage());
    //     return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    // }
}