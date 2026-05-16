# Reflexión Tecnológica — Uso de IA Generativa

## Contexto

Durante el desarrollo del backend de ReForest se utilizó Claude (Anthropic) como herramienta de apoyo para consultar dudas de diseño, entender errores concretos y evaluar alternativas. Las conversaciones no se usaron para generar código completo, sino para entender qué hacer y por qué antes de implementarlo. A continuación se recogen los intercambios más relevantes.

---

## Conversación 1 — Roles: ¿tabla separada o campo en Usuario?

**Yo:**
Estoy modelando los usuarios. Los roles van a ser solo USER y ADMIN. ¿Creo una tabla `Role` con relación muchos-a-muchos o es demasiado para esto?

**Claude:**
Para dos roles fijos, una tabla separada es sobrediseño. Añade un join en cada consulta de seguridad y complica el `UserDetailsService` sin aportar nada real.

La opción simple es guardar el rol como `String` directamente en `Usuario`. Spring Security solo necesita que le devuelvas una lista de `GrantedAuthority`, así que en tu `UserDetailsService` haces:

```java
List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol()))
```

Si el día de mañana necesitaras roles dinámicos o permisos granulares, entonces sí tendría sentido una tabla. Con dos roles conocidos en tiempo de compilación, guardar el String es suficiente.

**Yo:**
Vale, me quedo con el String. Así en `SecurityConfig` puedo usar `.hasRole("ADMIN")` directamente supongo.

**Claude:**
Exacto. `.hasRole("ADMIN")` internamente busca la authority `ROLE_ADMIN`, así que mientras añadas el prefijo al construir el `GrantedAuthority` funciona sin configuración adicional.

---

## Conversación 2 — JWT: cómo estructurar el token y qué claims meter

**Yo:**
Voy a usar JWT para la autenticación. He mirado ejemplos pero hay muchas versiones de la librería jjwt y los ejemplos no coinciden. ¿Cómo se genera un token con la API actual?

**Claude:**
Con jjwt 0.12.x la API cambió bastante respecto a versiones anteriores. El builder nuevo es más estricto con la clave. El patrón básico:

```java
SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

String token = Jwts.builder()
    .subject(email)
    .claim("rol", rol)
    .issuedAt(new Date())
    .expiration(new Date(System.currentTimeMillis() + expirationMs))
    .signWith(key)
    .compact();
```

Para validar, el parser también cambió:

```java
Jwts.parser().verifyWith(key).build()
    .parseSignedClaims(token).getPayload();
```

Si ves ejemplos con `.setSubject()` o `.parseClaimsJws()` son de la API antigua (0.10.x o anterior) y no compilan con 0.12.

**Yo:**
¿Qué meto en los claims? ¿Solo el email o también el rol?

**Claude:**
Depende de lo que el frontend necesite sin tener que hacer otra llamada. Si la interfaz tiene que saber el rol para decidir qué mostrar (menú de admin, rutas protegidas), tiene sentido meterlo en el token como claim personalizado. El email en el `subject` es lo mínimo.

No metas información que cambie frecuentemente porque el token no se actualiza hasta que el usuario vuelve a hacer login.

**Yo:**
Yo al final metí también el nombre para mostrarlo en la cabecera sin tener que llamar a `/usuarios/me`. Pero en la clase `AuthResponse` que devuelvo al login sí incluyo el nombre, email, id y rol directamente — el token en mi caso solo lleva email y rol.

---

## Conversación 3 — El filtro JWT no me autenticaba

**Yo:**
He creado el filtro JWT que lee el header `Authorization`, valida el token y mete la autenticación en el `SecurityContextHolder`. Pero Spring sigue devolviendo 401 en rutas protegidas aunque mande un token válido.

**Claude:**
Hay un par de sitios donde suele fallar esto. Primero comprueba que estás registrando el filtro **antes** de `UsernamePasswordAuthenticationFilter` en tu `SecurityConfig`:

```java
.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
```

Si no lo pones explícitamente, Spring no sabe cuándo ejecutarlo.

Lo segundo más común: que estés creando el `UsernamePasswordAuthenticationToken` pero sin llamar a `SecurityContextHolder.getContext().setAuthentication(auth)`. El token tiene que quedar en el contexto para que los filtros posteriores lo vean.

**Yo:**
Era lo segundo. Estaba creando el objeto de autenticación pero no lo metía en el contexto. Una vez hecho eso funcionó.

**Claude:**
Clásico. También asegúrate de que el filtro llama siempre a `filterChain.doFilter(request, response)` al final, tanto si hay token como si no, o algunas peticiones se quedarán colgadas.

---

## Conversación 4 — CORS: funcionaba en local pero no desde el frontend

**Yo:**
La API funciona bien desde Postman pero cuando el frontend en React intenta hacer una petición me da error de CORS. Tengo `@CrossOrigin` en los controllers.

**Claude:**
El problema con `@CrossOrigin` es que Spring Security intercepta las peticiones preflight (las `OPTIONS` que manda el navegador antes de cada petición con token) antes de que lleguen al controller, y las bloquea porque no tienen autenticación.

La solución es configurar CORS en el propio `SecurityFilterChain`, no en los controllers. En la configuración de seguridad:

```java
http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
```

Y defines un bean `CorsConfigurationSource` con los orígenes y métodos permitidos. Así Spring Security deja pasar los preflight antes de intentar autenticarlos.

**Yo:**
Eso lo tenía a medias. También aproveché para sacar el origen permitido a una propiedad `cors.allowed-origins` en lugar de hardcodearlo, así en producción se puede cambiar sin tocar código.

**Claude:**
Buena decisión. Con `@Value("${cors.allowed-origins}")` en el constructor de `SecurityConfig` lo tienes inyectado limpiamente.

---

## Conversación 5 — Borrado lógico en Especie

**Yo:**
Las donaciones guardan referencia a la especie. Si borro una especie físicamente, las donaciones antiguas quedan con una referencia rota. ¿Cómo lo gestiono?

**Claude:**
El patrón estándar es borrado lógico: en lugar de `DELETE`, cambias un campo que marca el registro como inactivo. En tu caso la entidad `Especie` ya tiene semántica para esto: un campo `disponible` que indica si está activa.

El endpoint `DELETE /especies/{id}` no ejecuta `repository.deleteById(id)`, sino que carga la especie, le pone `disponible = false` y la guarda. Los listados públicos filtran por `disponible = true` por defecto.

**Yo:**
¿Y el GET por ID? Si alguien pide una especie desactivada, ¿devuelvo 404 o la devuelvo con `disponible: false`?

**Claude:**
Depende del caso de uso. Si el dashboard de donaciones necesita mostrar el detalle de una donación histórica ("plantaste un Alcornoque"), devolver 404 para una especie desactivada rompe esa pantalla. En ese caso es mejor devolver el recurso completo y que el cliente decida cómo mostrarlo.

Si las especies desactivadas no deben ser visibles en ningún caso (como si nunca hubieran existido), entonces 404.

**Yo:**
Me quedo con devolver el recurso. El frontend tiene que poder mostrar el historial de donaciones con el nombre de la especie aunque ya no esté disponible.

---

## Conversación 6 — Manejo de errores: ¿try-catch en cada controller o algo centralizado?

**Yo:**
Ahora mismo tengo try-catch en cada método del controller para capturar `NoSuchElementException` y devolver 404. Se repite mucho. ¿Hay una forma mejor?

**Claude:**
Sí, `@ControllerAdvice` con `@ExceptionHandler`. Defines una clase separada donde declaras qué código HTTP devuelve cada excepción:

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NoSuchElementException e) {
        return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
    }
}
```

Los controllers solo lanzan la excepción. No saben nada de cómo se maneja. Ventaja extra: controlas exactamente qué llega al cliente — nunca el stack trace, solo lo que tú pones en el body.

**Yo:**
¿Y si quiero que el 401 y el 403 también devuelvan JSON en lugar del HTML que genera Spring por defecto?

**Claude:**
Eso requiere implementar `AuthenticationEntryPoint` para el 401 y `AccessDeniedHandler` para el 403. Son interfaces de Spring Security que defines como beans y registras en el `SecurityFilterChain`:

```java
.exceptionHandling(e -> e
    .authenticationEntryPoint(tuEntryPoint)
    .accessDeniedHandler(tuAccessDeniedHandler))
```

Dentro de cada uno escribes la respuesta manualmente con `response.setContentType("application/json")` y escribes el JSON que quieras. Así todos los errores de la API tienen el mismo formato.

**Yo:**
Implementé los dos. El `AuthenticationEntryPoint` devuelve `{"code": "UNAUTHORIZED", "message": "..."}` y el `AccessDeniedHandler` devuelve el mismo formato con 403. De esta manera todos los errores de la API tienen la misma estructura.

