# ReForest — Frontend

Aplicación web SPA construida con React 19 y TypeScript. Permite a los usuarios autenticarse, consultar especies disponibles y gestionar donaciones.

## Stack técnico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | Framework UI |
| TypeScript | 5.9 | Tipado estático |
| Vite | 7 | Bundler y servidor de desarrollo |
| React Router DOM | 7 | Navegación entre páginas |
| Axios | 1.x | Peticiones HTTP al backend |

## Arrancar en local

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

Requiere el backend activo en `http://localhost:8080`.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Compilar para producción (carpeta `dist/`) |
| `npm run preview` | Previsualizar el build de producción |
| `npm run lint` | Ejecutar ESLint |

## Estructura del proyecto

```
src/
├── components/
│   ├── Navigation.tsx    # Barra de navegación con enlaces y botón de logout
│   └── PrivateRoute.tsx  # HOC que redirige a login si no hay sesión activa
├── config/
│   └── apiClient.ts      # Instancia de Axios con interceptor JWT
├── i18n/                 # Traducciones español / inglés
├── pages/
│   ├── Dashboard.tsx     # Página de inicio tras login
│   ├── DonacionesList.tsx
│   ├── EspeciesList.tsx
│   └── UsuariosList.tsx
├── services/
│   ├── authService.ts    # Login, registro, logout
│   └── index.ts          # Servicios de la API (especies, donaciones, usuarios)
├── types/                # Tipos TypeScript compartidos
├── App.tsx               # Definición de rutas
└── main.tsx              # Punto de entrada
```

## Autenticación

Al hacer login, el token JWT se guarda en `localStorage`. El `apiClient` de Axios incluye automáticamente el token en la cabecera `Authorization: Bearer <token>` de cada petición.

Al cerrar sesión o al recibir un 401, el token se elimina y el usuario es redirigido al login.

Las rutas protegidas usan el componente `PrivateRoute`, que comprueba si hay token antes de renderizar la página.

## Internacionalización

La interfaz está disponible en español e inglés. Las traducciones están en `src/i18n/` y se accede a ellas mediante el hook `useTranslation`.

## Despliegue con Docker

```bash
docker build -t reforest-frontend .
docker run -p 80:80 reforest-frontend
```

O usando Docker Compose desde la raíz del repositorio:

```bash
docker-compose -f docker-compose.prod.yml up --build
```

La imagen usa Nginx para servir el build estático. La URL del backend se configura en tiempo de build mediante la variable de entorno `VITE_API_URL`.