package com.sanvalero.reforest.config;

import com.sanvalero.reforest.model.Usuario;
import com.sanvalero.reforest.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSeedConfig {

    @Bean
    CommandLineRunner seedAdmin(UsuarioRepository usuarioRepository,
                                PasswordEncoder encoder,
                                @Value("${app.admin.email}") String adminEmail,
                                @Value("${app.admin.password}") String adminPassword) {

        return args -> {

            if (usuarioRepository.findByEmail(adminEmail).isPresent()) {
                return;
            }

            Usuario admin = new Usuario();

            admin.setNombre("Admin");
            admin.setEmail(adminEmail);
            admin.setContrasena(encoder.encode(adminPassword));
            admin.setRol("ROLE_ADMIN");

            usuarioRepository.save(admin);

            System.out.println("ADMIN CREATED");
        };
    }
}
// PRUEBA