package com.sanvalero.reforest.security;

import com.sanvalero.reforest.model.Usuario;
import com.sanvalero.reforest.service.UsuarioService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class UserPersistenceTest {

    @Autowired UsuarioService usuarioService;
    @Autowired CustomUserDetailsService userDetailsService;
    @Autowired PasswordEncoder passwordEncoder;

    @Test
    void should_store_password_hashed_and_default_role_user() {
        Usuario u = new Usuario();
        u.setNombre("Ana");
        u.setEmail("ana.hash@example.com");
        u.setContrasena("secreta123");
        u.setRol(null);

        Usuario guardado = usuarioService.save(u);

        assertNotEquals("secreta123", guardado.getContrasena());
        assertTrue(passwordEncoder.matches("secreta123", guardado.getContrasena()));
        assertEquals("USER", guardado.getRol());
    }

    @Test
    void should_load_user_by_email_with_role_authority() {
        Usuario u = new Usuario();
        u.setNombre("Leo");
        u.setEmail("leo.uds@example.com");
        u.setContrasena("clave123");
        u.setRol("ADMIN");
        usuarioService.save(u);

        UserDetails ud = userDetailsService.loadUserByUsername("leo.uds@example.com");

        assertEquals("leo.uds@example.com", ud.getUsername());
        assertTrue(ud.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
    }
}
