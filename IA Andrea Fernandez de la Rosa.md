# Historial de conversación — Desarrollo y pruebas ReForest API 2.0

---

**Yo:** Al probar la colección de Postman, algunas peticiones me devuelven 401 aunque estoy logueada y tengo el token.

**IA:** El problema no era Postman, sino que la colección estaba modificando o borrando el usuario administrador. Al iniciar la aplicación se creaba el admin con id 1, después se hacía login correctamente, pero más adelante una petición de actualización o eliminación usaba ese mismo id. Al borrar o modificar el admin, el token seguía existiendo, pero ya no correspondía con un usuario válido en la base de datos, por eso Spring Security respondía 401.

---

**Yo:** Entonces, ¿cómo evito que me pase eso en la colección?

**IA:** Lo mejor es no usar ids fijos como `1`. La colección debe crear entidades durante la ejecución, guardar sus ids en variables de entorno y reutilizarlas después. Así no dependes de datos que puedan no existir o que puedan cambiar entre ejecuciones.

```javascript
const response = pm.response.json();
pm.environment.set("usuario_id", response.id);
```

---

**Yo:** Necesito randomizar el email del usuario que creo para que no me dé error de duplicado.

**IA:** Puedes hacerlo con un pre-request script. Así cada vez que se ejecuta la petición se genera un email distinto y se guarda en una variable de entorno.

```javascript
const random = Math.floor(Math.random() * 100000);
const email = `usuario${random}@example.com`;
pm.environment.set("random_user_email", email);
```

---

**Yo:** También me falla actualizar usuario porque el email ya existe.

**IA:** En la petición de actualización pasa lo mismo: si siempre mandas el mismo email, en cuanto repites la colección puedes chocar con un email ya usado. La solución es generar otro email aleatorio para el PUT.

```javascript
const random = Math.floor(Math.random() * 100000);
const updatedEmail = `usuario.actualizado${random}@example.com`;
pm.environment.set("updated_user_email", updatedEmail);
```

---

**Yo:** Me falla crear una donación. Me devuelve 404 aunque antes he creado usuario y especie.

**IA:** El problema estaba en el orden y en las variables. La petición que creaba el usuario válido estaba al final de la carpeta de usuarios, así que cuando se ejecutaban las donaciones todavía no existía `usuario_id`.

---

**Yo:** Quiero validar en Postman el código 204 y que el body esté vacío.

**IA:** Para las peticiones DELETE correctas, el test puede comprobar exclusivamente que el código sea 204 y que no haya contenido en la respuesta.

```javascript
pm.test("Status 204 No Content", function () {
    pm.response.to.have.status(204);
});

pm.test("El body está vacío", function () {
    pm.expect(pm.response.text()).to.eql("");
});
```

---

**Yo:** Al cambiar al perfil prod, la aplicación no arranca. Me sale `UnknownHostException: reforest-db`.

**IA:** Ese error aparece porque el backend intenta conectarse a `reforest-db`, que es el nombre del servicio dentro de Docker Compose. Ese nombre solo existe dentro de la red de Docker.

---

**Yo:** Ahora conecta, pero todo me da Unauthorized, incluso endpoints públicos.

**IA:** Primero había que comprobar que las peticiones públicas no estuvieran heredando un Bearer Token incorrecto desde la colección. Después se revisó el `SecurityConfig`, donde los endpoints públicos estaban correctamente permitidos.

---

**Yo:** Este es mi filtro JWT. ¿Puede estar ahí el problema?

**IA:** El problema más probable estaba en la autoridad del rol. Spring Security usa `.hasRole("ADMIN")`, pero eso internamente espera `ROLE_ADMIN`. Por eso había que adaptar la autoridad así:

```java
List.of(new SimpleGrantedAuthority("ROLE_" + rol))
```

---

**Yo:** ¿Por qué algunos tests en Newman no aparecían como pasados o fallidos?

**IA:** Porque algunas peticiones no tenían ningún script en la pestaña Tests. Newman mostraba el nombre de la request, pero no podía mostrar comprobaciones debajo.