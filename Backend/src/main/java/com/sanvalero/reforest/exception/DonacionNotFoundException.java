package com.sanvalero.reforest.exception;

// La anotación @ResponseStatus ya no es necesaria, el GlobalExceptionHandler se encarga de esto.
public class DonacionNotFoundException extends RuntimeException {

    public DonacionNotFoundException(long id) {
        super("Donation not found with ID: " + id);
    }

    public DonacionNotFoundException(String message) {
        super(message);
    }
}
