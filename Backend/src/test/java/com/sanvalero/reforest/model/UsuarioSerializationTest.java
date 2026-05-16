package com.sanvalero.reforest.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UsuarioSerializationTest {

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void no_serializa_la_contrasena_en_la_salida() throws Exception {
        Usuario u = new Usuario();
        u.setNombre("Ana");
        u.setEmail("ana@example.com");
        u.setContrasena("secreta123");
        u.setRol("USER");

        String json = mapper.writeValueAsString(u);

        assertFalse(json.contains("contrasena"), "El JSON no debe contener el campo contrasena");
        assertFalse(json.contains("secreta123"), "El JSON no debe contener el valor de la contrasena");
        assertTrue(json.contains("ana@example.com"), "El JSON sí debe contener el email");
    }

    @Test
    void si_acepta_la_contrasena_en_la_entrada() throws Exception {
        String json = "{\"nombre\":\"Leo\",\"email\":\"leo@example.com\",\"contrasena\":\"clave123\",\"rol\":\"USER\"}";

        Usuario u = mapper.readValue(json, Usuario.class);

        assertEquals("clave123", u.getContrasena());
        assertEquals("leo@example.com", u.getEmail());
    }
}
