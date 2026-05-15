# Glosario técnico — ReForest Backend

## JWT (JSON Web Token)
Token firmado por el servidor que transporta la identidad (email) y el rol del usuario. El cliente lo envía en cada petición (`Authorization: Bearer <token>`). El servidor confía en su contenido porque solo él conoce la clave de firma; no guarda sesión (stateless).

## BCrypt
Algoritmo de hash de contraseñas de un solo sentido y con salt. Las contraseñas nunca se almacenan en claro: al hacer login se compara el hash, no el texto.

## CORS (Cross-Origin Resource Sharing)
Mecanismo del navegador que controla peticiones entre orígenes distintos (la web en :5173 y la API en :8080). Se configura de forma centralizada en `SecurityConfig`, restringido al origen del frontend.

## Autenticación stateless
El servidor no mantiene estado de sesión. Cada petición se valida exclusivamente por el JWT que la acompaña. Permite escalar horizontalmente sin sesión compartida.

## Prefijo ROLE_
Spring Security espera autoridades con el prefijo `ROLE_` para que `hasRole("ADMIN")` funcione. El rol del usuario (`USER`/`ADMIN`) se mapea a `ROLE_USER`/`ROLE_ADMIN` al cargar el usuario.

## JWT_SECRET (configuración)
El secreto de firma del JWT se inyecta por configuración (`jwt.secret`). En desarrollo viene del Config Server (perfil dev). En producción DEBE inyectarse por variable de entorno `JWT_SECRET` (perfil prod) y nunca versionarse en claro.
