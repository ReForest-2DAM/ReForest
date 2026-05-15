package com.sanvalero.reforest.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AccessControlTest {

    @Autowired
    MockMvc mvc;

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
}
