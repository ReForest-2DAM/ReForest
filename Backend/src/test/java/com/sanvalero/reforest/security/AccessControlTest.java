package com.sanvalero.reforest.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AccessControlTest {

    @Autowired
    MockMvc mvc;

    private String tokenDe(String email, String pass) throws Exception {
        mvc.perform(post("/auth/register").contentType("application/json")
                .content("{\"nombre\":\"X\",\"email\":\"" + email + "\",\"contrasena\":\"" + pass + "\"}"));
        String body = mvc.perform(post("/auth/login").contentType("application/json")
                .content("{\"email\":\"" + email + "\",\"contrasena\":\"" + pass + "\"}"))
                .andReturn().getResponse().getContentAsString();
        return com.jayway.jsonpath.JsonPath.read(body, "$.token");
    }

    @Test
    void get_especies_es_publico() throws Exception {
        mvc.perform(get("/especies")).andExpect(status().isOk());
    }

    @Test
    void post_especies_sin_token_devuelve_401() throws Exception {
        mvc.perform(post("/especies")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void donaciones_sin_token_devuelve_401() throws Exception {
        mvc.perform(get("/donaciones")).andExpect(status().isUnauthorized());
    }

    @Test
    void user_no_puede_crear_especie_403() throws Exception {
        String token = tokenDe("user1@example.com", "clave123");
        mvc.perform(post("/especies").header("Authorization", "Bearer " + token)
                        .contentType("application/json").content("{\"nombreComun\":\"Roble\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void peticion_sin_token_devuelve_401_con_json() throws Exception {
        mvc.perform(get("/donaciones"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }
}
