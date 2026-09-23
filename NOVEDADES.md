# Novedades — sesión del 22 sept 2026

Todo lo que se añadió o cambió en esta sesión. Complementa a `PROJECT_STATUS.md`. Si algo choca con el código, confía en el código.

---

## 1. Formulario de contacto (sitio público)

Archivo: `front/app/component/site/ContactForm.tsx`

### Etiquetas y ayudas
- Cada campo tiene su etiqueta visible encima; los opcionales dicen "(opcional)".
- Placeholders con ejemplos: "Ej. María López", "Ej. maria@correo.com", "Ej. 099 123 4567"…
- Textos de ayuda bajo WhatsApp ("Te contactamos por aquí") y Fecha.
- `autocomplete` en nombre, correo y teléfono.

### Fecha
- Solo fechas desde hoy: los días pasados salen deshabilitados en el calendario.
- Si alguien escribe una fecha pasada a mano, el formulario no se envía y muestra el aviso.

### Ciudad y lugar
- **Ciudad**: select con ciudades de Ecuador + las ciudades usadas en los lugares del dashboard + "Otra ciudad" (abre campo de texto).
- **Lugar**: select con los lugares cargados en el dashboard para esa ciudad (ej. Marina Ecovida) + "Aún no lo sé" + "Otro lugar" (abre campo de texto). Si la ciudad no tiene lugares, sale directo el campo de texto.
- Lista fija de ciudades en `front/app/utils/formRules.ts` (`CITIES`).

### Mensajes predefinidos
- Select "Mensaje" con 5 respuestas listas (cotizar evento, promocionar negocio, reel, inspección, disponibilidad y precio).
- La caja "Qué necesitas grabar" **solo aparece** si se elige "Escribir mi propio mensaje" (opción por defecto).
- Los textos están en `front/translate/es.json` y `en.json` → `site.contact.form.templates`.

### Validación
- Los caracteres no permitidos **no se pueden escribir ni pegar**: se eliminan al instante.
- Lo mismo se valida en el backend (`back/src/common/text-patterns.ts`).

| Campo | Permitido |
|---|---|
| Nombre | letras (con tildes y ñ), espacios, `'` `.` `-` |
| Teléfono | números, espacios, `( )` `-`, `+` solo al inicio |
| Correo | formato `nombre@dominio.com` |
| Ciudad / lugar | letras, números, espacios, `. , ' - ( )` |
| Mensaje | letras, números, saltos de línea, `. , ; : ¿ ? ¡ ! ( ) ' " % $ / + -` |

Bloqueado: `< > { } [ ] * # @ & =`, emojis, etc.

### Qué llega al backend
El mensaje se guarda con una cabecera y luego el texto:
```
Tipo de proyecto: Boda
Fecha: 2026-10-01
Ciudad: Esmeraldas
Lugar: Marina Ecovida

Quiero cotizar la grabación completa de mi evento…
```

---

## 2. Datos de contacto editables

- Nueva sección **Dashboard → Contacto** (`ContactPanel.tsx`): celular/WhatsApp y correo.
- Se guardan en `site_settings` (clave `contact`). Endpoints: `GET /settings/contact` (público), `PATCH /settings/contact` (admin).
- Se usan en: página de contacto, pie de página, inicio, botones de WhatsApp de servicios y aviso de error del formulario.
- El enlace de WhatsApp se genera del número (`099…` → `593…`).
- Front: `ContactInfoProvider` / `useContactInfo()` (componentes cliente) y `getContactInfo()` / `whatsappUrl()` (componentes servidor), en `front/app/component/site/`.
- Se eliminaron las constantes fijas `CONTACT_EMAIL`, `CONTACT_PHONE`, `WHATSAPP_URL`.

---

## 3. Lugares (venues)

- Nueva sección **Dashboard → Lugares** (`VenuesPanel.tsx`): nombre + ciudad, publicar/ocultar, reordenar, editar, eliminar.
- Modelo Prisma `Venue` (tabla `venues`), migración `20260923040000_venues` (**ya aplicada** en la base remota).
- Endpoints: `GET /venues` (públicos), `GET /venues/admin`, `POST`, `PATCH /:id`, `DELETE /:id`, reordenar con `PATCH /reorder/venues`.

---

## 4. Bandeja de mensajes — nuevo diseño

Archivo: `front/app/[locale]/dashboard/MessageDetail.tsx` (diseño "Mensaje Detalle" de claude.ai/design, con los colores `jb-*` del sistema).

- Cabecera: iniciales, nombre, estado con punto de color, fecha · idioma.
- Botones de icono: leído/no leído, archivar/desarchivar, eliminar (con confirmación en barra roja).
- Bloque de datos: correo y teléfono con botón **Copiar**, tipo de proyecto como etiqueta, y Fecha/Ciudad/Lugar si vienen.
- "Mensaje" muestra solo el texto del cliente (la cabecera se separa en campos). Los mensajes antiguos se ven completos.
- La lista de la izquierda muestra el texto del cliente como vista previa.

---

## 5. Responder por correo con Resend

- "Responder por correo" abre un formulario dentro del mensaje (Para, Asunto, texto con "Hola {nombre},").
- Lo envía **el backend**: `POST /contact-messages/:id/reply` → API de Resend (sin dependencias nuevas, usa `fetch`).
- El correo lleva tu respuesta y debajo la solicitud original citada.
- Si el cliente responde, llega al correo de **Dashboard → Contacto** (`reply_to`).
- Al enviar, el mensaje pasa a "Leído" si era nuevo.
- Las respuestas enviadas **no se guardan** (no hay historial).

Variables en `back/.env`:
```
RESEND_API_KEY=re_...
RESEND_FROM="JB.SKYLENS <contacto@joaobarres.dev>"
```
- El dominio `joaobarres.dev` está verificado en Resend.
- **Reinicia el backend después de editar `.env`** — el modo `--watch` no lo recarga.

---

## 6. Otros cambios

- **Proyectos**: se quitó el interruptor "Publicado" del formulario; la visibilidad se cambia desde el botón de cada fila.
- **Git**: `back/.env.example` y `front/.env.example` dejaron de estar en git (siguen en disco) y se quitó `!.env.example` del `.gitignore`.
- **`back/.env` restaurado**: se había sobrescrito con los valores de ejemplo (DB `localhost:5432`, puerto 3001). Se recuperó la versión real desde el historial de VS Code (DB remota `207.180.216.55:5434`, puerto 8008, `api/v1`) + líneas de Resend. Copia del archivo roto en `back/.env.bak-20260922` (ignorada por git; se puede borrar).

---

## Archivos nuevos

**Backend**
- `back/src/common/text-patterns.ts`
- `back/src/venues/` (módulo completo)
- `back/src/settings/` (módulo de datos de contacto)
- `back/src/contact/dto/reply-contact.dto.ts`
- `back/prisma/migrations/20260923040000_venues/`

**Frontend**
- `front/app/utils/formRules.ts`
- `front/app/component/site/ContactInfo.tsx`
- `front/app/[locale]/dashboard/VenuesPanel.tsx`
- `front/app/[locale]/dashboard/ContactPanel.tsx`
- `front/app/[locale]/dashboard/MessageDetail.tsx`

## Pendiente / ideas
- Probar el primer envío real de correo con Resend.
- Guardar historial de respuestas enviadas (requiere tabla nueva).
- Mensajes predefinidos editables desde el dashboard (hoy están en las traducciones).
- Los componentes viejos `front/app/component/footer` y `front/app/hooks/from-email` aún tienen el correo/teléfono fijos (no se usan).
