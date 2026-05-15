package com.sanvalero.reforest.security;

import com.sanvalero.reforest.model.Usuario;
import com.sanvalero.reforest.repository.UsuarioRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) {
        Usuario u = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        // [LEARN] Spring Security espera el prefijo ROLE_ para usar hasRole(...)
        String rol = u.getRol() != null ? u.getRol() : "USER";
        return new User(u.getEmail(), u.getContrasena(),
                List.of(new SimpleGrantedAuthority("ROLE_" + rol)));
    }
}
