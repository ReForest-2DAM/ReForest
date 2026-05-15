# ReForest — Backend

API REST (Spring Boot 3.2.2, Java 21) con autenticación JWT y configuración externa vía Spring Cloud Config.

## Arrancar en local (perfil dev)

Orden obligatorio:

1. **Config Server** (repo `ReForestConfigServer`) en el puerto `8888`.
2. **Backend**: `cd Backend && ./mvnw spring-boot:run` (puerto `8080`). En `dev` usa BD H2 en memoria; no requiere MariaDB.
3. **Frontend** (`npm run dev`, puerto `5173`).

## Tests

`cd Backend && ./mvnw test` — no requieren Config Server (config de test hermética con H2).

## Configuración sensible

- `jwt.secret`: en `dev` lo sirve el Config Server; en **producción** se inyecta por variable de entorno `JWT_SECRET` (perfil prod). Nunca se versiona en claro.
- `cors.allowed-origins`: origen permitido para CORS. Por defecto `http://localhost:5173`; en producción se define por configuración con el dominio real del frontend.
