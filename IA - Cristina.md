# Historial de conversación — Desarrollo Frontend ReForest

---

**Yo:** Tengo una página de donaciones y cuando entro me sale "Network Error", no carga nada. ¿Por qué puede ser?

**IA:** Es un problema de CORS. El navegador bloquea la petición porque el frontend está en un puerto distinto al backend. Con Spring Security no basta con anotar el controlador, hay que configurar CORS dentro de la cadena de seguridad para que también afecte a las peticiones con autenticación.

---

**Yo:** ¿Y cómo hago para que el token JWT que recibo al hacer login se mande automáticamente en todas las peticiones?

**IA:** Necesitas añadir un interceptor en el cliente HTTP que lea el token guardado en localStorage y lo incluya en la cabecera Authorization de cada petición que salga. Así no tienes que acordarte de añadirlo manualmente en cada llamada al servicio.

```ts
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

**Yo:** Al crear la cuenta o iniciar sesión me sale un error que dice que "undefined" no es un JSON válido. No entiendo qué está pasando.

**IA:** El problema está en cómo guardas los datos del usuario después del login. El backend devuelve los campos directamente en la respuesta (id, nombre, email, rol…), pero el código estaba esperando recibirlo anidado dentro de un objeto usuario. Al intentar guardar undefined como JSON en localStorage explota. Hay que mapear los campos de la respuesta uno a uno al construir el objeto de usuario.

```ts
function saveSession(data: AuthResponse): Usuario {
  const usuario = { id: data.id, nombre: data.nombre, email: data.email, rol: data.rol };
  localStorage.setItem('token', data.token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
  return usuario;
}
```

---

**Yo:** Ahora estoy iniciada sesión y le doy a Donaciones y me redirige al login. ¿Por qué?

**IA:** La función que comprueba si hay sesión activa estaba eliminando también el token cuando encontraba datos corruptos en localStorage. La comprobación de autenticación tiene que verificar cualquiera de los dos valores guardados, y al limpiar datos corruptos no debe tocar el token.

```ts
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token') || !!localStorage.getItem('usuario');
};
```

---

**Yo:** En la página de especies las tarjetas tiemblan o parpadean nada más cargar, como si se refrescara. En las otras páginas no pasa.

**IA:** El estado de administrador se inicializa como falso y luego se actualiza de forma asíncrona, lo que hace que el botón de "Crear especie" aparezca de repente y empuje el contenido. La solución es leer el rol directamente de localStorage al inicializar el componente, de forma síncrona, para que desde el primer render ya esté correcto.

```ts
const isAdmin = (() => {
  try {
    const data = localStorage.getItem('usuario');
    if (!data) return false;
    return JSON.parse(data)?.rol === 'ROLE_ADMIN';
  } catch { return false; }
})();
```

---

**Yo:** Quiero hacer un dashboard que muestre un resumen de las donaciones. Si soy admin que salga todo, y si soy usuario normal que solo salgan las mías. También quiero poder filtrar y ordenar.

**IA:** Tendría sentido mostrar unas tarjetas de resumen arriba con los totales principales, y debajo una tabla con filtros por nombre, estado y fechas, y cabeceras clicables para ordenar por cada columna. El componente detecta el rol al cargar y dependiendo de si es admin carga todos los datos o filtra por el id del usuario en sesión.

---

**Yo:** ¿Cómo protejo las rutas para que si no estás logueado no puedas entrar a ciertas páginas, y además que la de usuarios solo la vea el admin?

**IA:** Puedes crear un componente de ruta privada que antes de renderizar el contenido comprueba si hay sesión activa. Si no la hay, redirige al login. Para el caso del admin añades una propiedad opcional que comprueba además el rol.

```tsx
// En App.tsx
<Route path="/donaciones" element={
  <PrivateRoute>
    <DonacionesList />
  </PrivateRoute>
} />
<Route path="/usuarios" element={
  <PrivateRoute requireAdmin>
    <UsuariosList />
  </PrivateRoute>
} />
```

---

**Yo:** La aplicación tiene que poder verse en inglés y en español. ¿Cómo lo hago?

**IA:** Lo más limpio es crear un contexto de idioma con todas las cadenas de texto en un fichero de traducciones, indexadas por clave y con una entrada para cada idioma. Un botón en la navegación alterna entre los dos y el resto de componentes leen el texto a través de una función de traducción.

```ts
'especies.plantarAhora': { es: '🌳 Plantar ahora', en: '🌳 Plant now' },
'login.titulo':          { es: '🔐 Iniciar Sesión', en: '🔐 Log In' },
'common.cancelar':       { es: 'Cancelar',          en: 'Cancel' },
```

---

**Yo:** Los mensajes de error que devuelve la API también salen en español, ¿los traduzco también?

**IA:** Sí, habría que traducir al inglés los mensajes que llegan hasta el usuario: los textos de las excepciones cuando no se encuentra un recurso, los mensajes de seguridad cuando el token no es válido o cuando no tienes permisos, y cualquier mensaje de negocio que pueda mostrarse en pantalla.

---

**Yo:** En Postman algunas peticiones me dan 401 aunque estoy logueada y tengo el token guardado.

**IA:** Si tienes el token y la autorización configurada en la colección, lo más probable es que el token se generó con un secreto JWT distinto al que está usando el backend ahora mismo. Eso pasa cuando el secreto cambia entre arranques o configuraciones. La solución es hacer login de nuevo para generar un token válido con el secreto actual.

---

**Yo:** Mi compañera tiene el rol de admin guardado como ROLE_ADMIN en la base de datos, ¿cómo lo adapto para que sea compatible?

**IA:** Hay que diferenciar los dos casos: ROLE_ADMIN ya lleva el prefijo que necesita Spring Security, así que se usa directamente. USER no lleva prefijo, así que hay que añadírselo al construir la autenticación. En el frontend todas las comparaciones que buscaban el texto ADMIN tienen que buscar ROLE_ADMIN.

```ts
// Antes
u.rol.toUpperCase() === 'ADMIN'

// Después
u.rol === 'ROLE_ADMIN'
```

---
