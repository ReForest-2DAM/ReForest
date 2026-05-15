package com.sanvalero.reforest.controller;

import com.sanvalero.reforest.dto.AuthResponse;
import com.sanvalero.reforest.dto.LoginRequest;
import com.sanvalero.reforest.dto.RegisterRequest;
import com.sanvalero.reforest.model.Usuario;
import com.sanvalero.reforest.security.JwtService;
import com.sanvalero.reforest.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioService usuarioService;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    public AuthController(UsuarioService usuarioService, JwtService jwtService,
                          AuthenticationManager authManager) {
        this.usuarioService = usuarioService;
        this.jwtService = jwtService;
        this.authManager = authManager;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        Usuario u = new Usuario();
        u.setNombre(req.nombre());
        u.setEmail(req.email());
        u.setContrasena(req.contrasena());
        u.setRol("USER");
        Usuario creado = usuarioService.save(u);
        String token = jwtService.generateToken(creado.getEmail(), creado.getRol());
        return new ResponseEntity<>(
                new AuthResponse(token, creado.getId(), creado.getNombre(),
                        creado.getEmail(), creado.getRol()),
                HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.email(), req.contrasena()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Usuario u = usuarioService.findByEmail(req.email());
        String token = jwtService.generateToken(u.getEmail(), u.getRol());
        return ResponseEntity.ok(new AuthResponse(token, u.getId(),
                u.getNombre(), u.getEmail(), u.getRol()));
    }
}
