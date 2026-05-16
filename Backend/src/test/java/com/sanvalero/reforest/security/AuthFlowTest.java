package com.sanvalero.reforest.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthFlowTest {

    @Autowired
    MockMvc mvc;

    @Test
    void registro_valido_devuelve_201_y_token() throws Exception {
        mvc.perform(post("/auth/register")
                        .contentType("application/json")
                        .content("{\"nombre\":\"Ana\",\"email\":\"ana@example.com\",\"contrasena\":\"secreta123\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.rol").value("USER"))
                .andExpect(jsonPath("$.email").value("ana@example.com"));
    }

    @Test
    void login_valido_devuelve_200_y_token() throws Exception {
        mvc.perform(post("/auth/register")
                .contentType("application/json")
                .content("{\"nombre\":\"Leo\",\"email\":\"leo@example.com\",\"contrasena\":\"clave123\"}"))
                .andExpect(status().isCreated());

        mvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content("{\"email\":\"leo@example.com\",\"contrasena\":\"clave123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.rol").value("USER"));
    }

    @Test
    void login_con_password_incorrecta_devuelve_401() throws Exception {
        mvc.perform(post("/auth/register")
                .contentType("application/json")
                .content("{\"nombre\":\"Mia\",\"email\":\"mia@example.com\",\"contrasena\":\"buena123\"}"))
                .andExpect(status().isCreated());

        mvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content("{\"email\":\"mia@example.com\",\"contrasena\":\"mala\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }
}
