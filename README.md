# ReForest

Plataforma web para la gestión de donaciones de reforestación. Los usuarios pueden registrarse, elegir una especie de árbol y realizar donaciones. El sistema calcula automáticamente el importe según el precio de plantación de la especie.

## Estructura del repositorio

```
ReForest/
├── Backend/          # API REST — Spring Boot 3.2.2, Java 21
├── Frontend/         # SPA — React 19, TypeScript, Vite
├── postman/          # Colección y entorno de Postman
├── docker-compose.yml       # Entorno de desarrollo (con Config Server externo)
└── docker-compose.prod.yml  # Entorno de producción (todo en contenedores)
```

## Requisitos

| Herramienta | Versión mínima |
|---|---|
| Java | 21 |
| Maven | 3.9 (o usar el wrapper `./mvnw`) |
| Node.js | 18 |
| Docker + Docker Compose | Cualquier versión reciente |

## Arrancar en local (desarrollo)

### Opción A — Todo con Docker

```bash
docker-compose up --build
```

Servicios que levanta:

| Servicio | Puerto | Descripción |
|---|---|---|
| reforest-db | 3307 | MariaDB |
| config-server | 8888 | Spring Cloud Config Server |
| reforest-api | 8080 | Backend (perfil prod) |

> El frontend en esta opción hay que arrancarlo por separado (ver Opción B).

### Opción B — Manual (recomendado para desarrollo)

1. Levanta el Config Server (repositorio `ReForestConfigServer`):
   ```bash
   cd ../ReForestConfigServer && ./mvnw spring-boot:run
   ```

2. Levanta el backend:
   ```bash
   cd Backend && ./mvnw spring-boot:run
   ```
   Usa H2 en memoria en perfil `dev`. No necesita MariaDB.

3. Levanta el frontend:
   ```bash
   cd Frontend && npm install && npm run dev
   ```

| Servicio | URL |
|---|---|
| API REST | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Frontend | http://localhost:5173 |

## Arrancar en producción

```bash
docker-compose -f docker-compose.prod.yml up --build
```

Levanta la base de datos, el Config Server, el backend y el frontend (Nginx en el puerto 80).

## Credenciales de desarrollo

Al arrancar en perfil `dev` se crea automáticamente un usuario administrador:

| Campo | Valor |
|---|---|
| Email | admin@gmail.com |
| Contraseña | admin123 |
| Rol | ADMIN |

## Tests

```bash
cd Backend && ./mvnw test
```

No requieren Config Server. Usan configuración hermética con H2.

## Documentación de la API

La especificación OpenAPI completa está en `Backend/src/main/resources/openapi.yaml` y se sirve automáticamente en:

- Swagger UI: http://localhost:8080/swagger-ui.html
- JSON: http://localhost:8080/v3/api-docs

## Colección Postman

En la carpeta `postman/` hay una colección lista para importar con todas las peticiones y un entorno con las variables necesarias (`baseUrl`, `token`).

## Flujo de autenticación

1. `POST /auth/register` — crea una cuenta y devuelve un JWT
2. `POST /auth/login` — inicia sesión y devuelve un JWT
3. Incluye el token en la cabecera de las siguientes peticiones:
   ```
   Authorization: Bearer <token>
   ```

## Contribuir

```
main     ← producción, solo merge via PR aprobado
develop  ← integración, solo merge via PR
  └── feature/descripcion
  └── fix/descripcion
```

Ver `Backend/README.md` y `Frontend/README.md` para instrucciones específicas de cada módulo.