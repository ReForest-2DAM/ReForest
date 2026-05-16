# ReForest — Backend

API REST construida con Spring Boot 3.2.2 y Java 21. Gestiona usuarios, especies de árboles y donaciones con autenticación JWT y configuración externa vía Spring Cloud Config.

## Stack técnico

| Tecnología | Versión | Uso |
|---|---|---|
| Java | 21 | Lenguaje |
| Spring Boot | 3.2.2 | Framework principal |
| Spring Security | incluido en Boot | Autenticación y autorización |
| jjwt | 0.12.x | Generación y validación de JWT |
| Spring Cloud Config | 4.x | Configuración externa |
| Spring Data JPA | incluido en Boot | Acceso a datos |
| H2 | incluido en Boot | Base de datos en memoria (dev y test) |
| MariaDB | 11.3 | Base de datos en producción |
| springdoc-openapi | 2.x | Documentación OpenAPI / Swagger UI |
| Lombok | incluido en Boot | Reducción de boilerplate |

## Arrancar en local

El backend requiere el Config Server activo antes de arrancar:

```bash
# 1. Arranca el Config Server (repo ReForestConfigServer)
cd ../ReForestConfigServer && ./mvnw spring-boot:run

# 2. Arranca el backend
./mvnw spring-boot:run
```

En perfil `dev` usa H2 en memoria. No necesita MariaDB.

La API queda disponible en `http://localhost:8080`.

## Tests

```bash
./mvnw test
```

Los tests tienen su propia configuración en `src/test/resources/application.properties` que desactiva el Config Server y usa H2. No necesitan ningún servicio externo.

## Endpoints principales

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| POST | /auth/register | Registrar usuario | Público |
| POST | /auth/login | Iniciar sesión | Público |
| GET | /usuarios | Listar usuarios activos | ADMIN |
| GET | /usuarios/{id} | Detalle de usuario | ADMIN |
| POST | /usuarios | Crear usuario | ADMIN |
| PUT | /usuarios/{id} | Actualizar usuario | ADMIN |
| PATCH | /usuarios/{id} | Actualizar campos | ADMIN |
| DELETE | /usuarios/{id} | Desactivar usuario | ADMIN |
| GET | /especies | Listar especies | Autenticado |
| GET | /especies/{id} | Detalle de especie | Autenticado |
| POST | /especies | Crear especie | ADMIN |
| PUT | /especies/{id} | Actualizar especie | ADMIN |
| PATCH | /especies/{id} | Actualizar campos | ADMIN |
| DELETE | /especies/{id} | Desactivar especie | ADMIN |
| GET | /donaciones | Listar donaciones | Autenticado |
| GET | /donaciones/{id} | Detalle de donación | Autenticado |
| POST | /donaciones | Crear donación | Autenticado |
| PUT | /donaciones/{id} | Actualizar donación | Autenticado |
| PATCH | /donaciones/{id} | Actualizar campos | Autenticado |
| DELETE | /donaciones/{id} | Cancelar donación | Autenticado |

Documentación interactiva completa en `http://localhost:8080/swagger-ui.html`.

## Autenticación

Todos los endpoints excepto `/auth/**` requieren un token JWT en la cabecera:

```
Authorization: Bearer <token>
```

El token se obtiene en `/auth/login` o `/auth/register`.

## Estructura del proyecto

```
src/
├── main/
│   ├── java/com/sanvalero/reforest/
│   │   ├── config/         # AdminSeedConfig — seeder del admin en dev
│   │   ├── controller/     # AuthController, UsuarioController, EspecieController, DonacionController
│   │   ├── dto/            # AuthResponse, LoginRequest, RegisterRequest
│   │   ├── exception/      # Excepciones específicas y GlobalExceptionHandler
│   │   ├── model/          # Usuario, Especie, Donacion
│   │   ├── repository/     # Interfaces JPA
│   │   ├── security/       # JWT, filtros, SecurityConfig
│   │   └── service/        # Lógica de negocio
│   └── resources/
│       ├── application.properties
│       └── openapi.yaml    # Especificación OpenAPI 3.0
└── test/
    ├── java/               # Tests de integración (JUnit 5)
    └── resources/
        └── application.properties  # Config hermética para tests
```

## Lógica de negocio destacada

- **Borrado lógico de usuarios**: el DELETE no elimina el registro, pone `activo = false`. Los usuarios inactivos no aparecen en el listado.
- **Borrado lógico de especies**: el DELETE pone `disponible = false`. Las especies no disponibles no aceptan nuevas donaciones.
- **Cálculo automático**: el `totalDonado` de una donación se calcula en el servicio como `cantidadArboles × especie.precioPlantacion`.
- **Seeder de admin**: al arrancar en perfil `dev`, `AdminSeedConfig` crea el usuario `admin@gmail.com` si no existe.

## Variables de entorno (producción)

| Variable | Descripción |
|---|---|
| `SPRING_PROFILES_ACTIVE` | Perfil activo (`prod`) |
| `SPRING_CONFIG_IMPORT` | URL del Config Server |
| `JWT_SECRET` | Clave secreta para firmar los JWT |