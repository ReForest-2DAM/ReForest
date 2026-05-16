package com.sanvalero.reforest.security;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private final JwtService jwtService =
            new JwtService("dGVzdC1zZWNyZXQtcmVmb3Jlc3QtMTIzNDU2Nzg5MC1hYmNkZWZnaGlqaw==", 3600000L);

    @Test
    void should_generate_token_and_extract_email_and_rol() {
        String token = jwtService.generateToken("ana@example.com", "ADMIN");
        assertEquals("ana@example.com", jwtService.extractEmail(token));
        assertEquals("ADMIN", jwtService.extractRol(token));
        assertTrue(jwtService.isValid(token, "ana@example.com"));
    }

    @Test
    void should_reject_token_with_wrong_subject() {
        String token = jwtService.generateToken("ana@example.com", "USER");
        assertFalse(jwtService.isValid(token, "otro@example.com"));
    }

    @Test
    void should_reject_tampered_token() {
        String token = jwtService.generateToken("ana@example.com", "USER");
        String tampered = token.substring(0, token.length() - 2) + "xx";
        assertThrows(Exception.class, () -> jwtService.extractEmail(tampered));
    }
}
