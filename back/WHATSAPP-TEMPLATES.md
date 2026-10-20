# Plantillas de WhatsApp (tienda)

El backend avisa al comprador por WhatsApp en dos momentos:

| Aviso | Cuándo | Variable de entorno |
| --- | --- | --- |
| `pedido_pagado` | Se acepta el pago (PayPal, transferencia confirmada o pedido gratis) | `WHATSAPP_TEMPLATE_PAID` |
| `pedido_enviado` | Se marca el pedido como enviado (o cambia la guía) | `WHATSAPP_TEMPLATE_SHIPPED` |

## Mientras no haya plantillas aprobadas

Deja `WHATSAPP_TEMPLATE_PAID` y `WHATSAPP_TEMPLATE_SHIPPED` **vacías**. El aviso sale
como mensaje de texto normal, con el mismo contenido de abajo.

> **Limitación de Meta:** un mensaje de texto libre solo se entrega si el comprador
> le escribió a tu número de WhatsApp en las **últimas 24 horas**. Si no, la API
> acepta el envío pero Meta no lo entrega (error `131047` en el webhook de estados).
> Para que le llegue a todos los compradores hacen falta las plantillas.

## Cómo crearlas

1. [WhatsApp Manager](https://business.facebook.com/wa/manage/message-templates/) → **Plantillas de mensajes** → **Crear plantilla**.
2. Categoría **Utilidad** (Utility). No uses Marketing: es más cara y Meta la rechaza para avisos de pedido.
3. Nombre exacto: `pedido_pagado` / `pedido_enviado` (minúsculas y guion bajo).
4. Idiomas: **Español** (`es`) e **Inglés** (`en`), con el mismo nombre. El código del
   idioma que elijas debe coincidir con `WHATSAPP_TEMPLATE_LANG_ES` / `WHATSAPP_TEMPLATE_LANG_EN`.
5. Solo **Cuerpo** (sin encabezado, pie ni botones). Copia el texto tal cual: las
   variables `{{1}}`…`{{6}}` deben ir en ese orden porque el backend las llena así.
6. Meta pide un ejemplo por variable: usa los de cada tabla.
7. Cuando Meta las apruebe (minutos u horas), pon los nombres en el entorno del servidor:
   ```env
   WHATSAPP_TEMPLATE_PAID=pedido_pagado
   WHATSAPP_TEMPLATE_SHIPPED=pedido_enviado
   ```
   y reinicia el backend.

Si cambias el texto aquí, cámbialo también en `back/src/store/store-whatsapp.service.ts`
(`COPY`), que es el texto que se usa mientras no hay plantilla.

---

## `pedido_pagado`

### Español (`es`)
```
Hola {{1}}, confirmamos tu pedido {{2}} en JB.SKYLENS.

Productos: {{3}}
Envío: {{4}}
Total: {{5}}
Entrega en: {{6}}

Te avisaremos por aquí cuando salga, con la empresa de envío y el número de guía.
```

### Inglés (`en`)
```
Hi {{1}}, your order {{2}} at JB.SKYLENS is confirmed.

Products: {{3}}
Shipping: {{4}}
Total: {{5}}
Delivery to: {{6}}

We'll message you here when it ships, with the carrier and tracking number.
```

| Variable | Contenido | Ejemplo |
| --- | --- | --- |
| `{{1}}` | Nombre del comprador | `Ana` |
| `{{2}}` | Código del pedido | `JB-7K2Q9M` |
| `{{3}}` | Productos | `1 × Dron Mini 4, 2 × Batería (Larga duración)` |
| `{{4}}` | Ciudad y costo de envío | `Quito · $5.00` |
| `{{5}}` | Total | `$545.00` |
| `{{6}}` | Dirección de entrega | `Av. Libertad y Manabí, casa 12, Quito` |

## `pedido_enviado`

### Español (`es`)
```
Hola {{1}}, tu pedido {{2}} ya fue enviado.

Empresa de envío: {{3}}
Número de guía: {{4}}
Rastreo: {{5}}
Entrega en: {{6}}

Gracias por comprar en JB.SKYLENS.
```

### Inglés (`en`)
```
Hi {{1}}, your order {{2}} has shipped.

Carrier: {{3}}
Tracking number: {{4}}
Track it: {{5}}
Delivery to: {{6}}

Thank you for shopping at JB.SKYLENS.
```

| Variable | Contenido | Ejemplo |
| --- | --- | --- |
| `{{1}}` | Nombre del comprador | `Ana` |
| `{{2}}` | Código del pedido | `JB-7K2Q9M` |
| `{{3}}` | Empresa de envío | `Servientrega` |
| `{{4}}` | Número de guía | `1234567890` |
| `{{5}}` | Enlace de rastreo (o `—` si no hay) | `https://www.servientrega.com.ec/rastreo` |
| `{{6}}` | Dirección de entrega | `Av. Libertad y Manabí, casa 12, Quito` |

## Errores comunes

| Error | Causa |
| --- | --- |
| `(#132001) Template name does not exist in the translation` | La plantilla no existe, no está aprobada o no existe en ese idioma. Revisa el nombre y el código de idioma, o deja la variable vacía para enviar texto. |
| `(#132000) Number of parameters does not match` | La plantilla aprobada no tiene exactamente 6 variables. |
| `131047` (en el webhook) | Mensaje de texto sin plantilla a alguien que no te escribió en 24 h. |
| `(#131030) Recipient phone number not in allowed list` | Con el número de prueba de Meta solo puedes enviar a números verificados en API Setup. |
