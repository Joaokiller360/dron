# Plantillas de WhatsApp (tienda)

El backend avisa al comprador por WhatsApp en dos momentos:

| Aviso | Cuándo | Variable de entorno |
| --- | --- | --- |
| `pedido_pagado` | Se acepta el pago (PayPal, transferencia confirmada o pedido gratis) | `WHATSAPP_TEMPLATE_PAID` |
| `pedido_enviado` | Se marca el pedido como enviado (o cambia la guía) | `WHATSAPP_TEMPLATE_SHIPPED` |

Y a ti (la tienda), a los números de `WHATSAPP_SHOP_NOTIFY_TO` (separados por coma; no
el número conectado a la API, que no puede escribirse a sí mismo):

| Aviso | Cuándo | Variable de entorno |
| --- | --- | --- |
| `venta_nueva` | Se acepta el pago de un pedido | `WHATSAPP_TEMPLATE_SHOP_SALE` |
| `transferencia_por_verificar` | Un cliente reporta una transferencia | `WHATSAPP_TEMPLATE_SHOP_TRANSFER` |

Los avisos a la tienda van siempre en español (solo hace falta la plantilla `es`).

## Mientras no haya plantillas aprobadas

No hace falta tocar nada: mientras `WHATSAPP_USE_TEMPLATES` no sea `true`, el aviso
sale como mensaje de texto normal, con el mismo contenido de abajo (aunque
`WHATSAPP_TEMPLATE_PAID` / `WHATSAPP_TEMPLATE_SHIPPED` tengan valor).

> **Limitación de Meta:** un mensaje de texto libre solo se entrega si el comprador
> le escribió a tu número de WhatsApp en las **últimas 24 horas**. Si no, la API
> acepta el envío pero Meta no lo entrega (error `131047` en el webhook de estados).
> Para que le llegue a todos los compradores hacen falta las plantillas.
> Lo mismo para tus avisos: en modo texto solo te llegan si le escribiste al número de
> la API en las últimas 24 horas.

## Cómo crearlas

1. [WhatsApp Manager](https://business.facebook.com/wa/manage/message-templates/) → **Plantillas de mensajes** → **Crear plantilla**.
2. Categoría **Utilidad** (Utility). No uses Marketing: es más cara y Meta la rechaza para avisos de pedido.
3. Nombre exacto: `pedido_pagado` / `pedido_enviado` (minúsculas y guion bajo).
4. Idiomas: **Español** (`es`) e **Inglés** (`en`), con el mismo nombre. El código del
   idioma que elijas debe coincidir con `WHATSAPP_TEMPLATE_LANG_ES` / `WHATSAPP_TEMPLATE_LANG_EN`.
5. Solo **Cuerpo** (sin encabezado, pie ni botones). Copia el texto tal cual: las
   variables deben ir en ese orden porque el backend las llena así (`pedido_pagado` y
   `venta_nueva` tienen 6, `pedido_enviado` 5, `transferencia_por_verificar` 4).
6. Meta pide un ejemplo por variable: usa los de cada tabla.
7. Cuando Meta las apruebe (minutos u horas), actívalas en el entorno del servidor:
   ```env
   WHATSAPP_USE_TEMPLATES=true
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
Hola {{1}}, confirmamos tu pedido {{2}} en JB.SKYLENS 🚁

Productos: {{3}}
Envío: {{4}}
Total: {{5}}
Entrega en: {{6}}

Te avisaremos por aquí cuando salga, con la empresa de envío y el número de guía.
```

### Inglés (`en`)
```
Hi {{1}}, your order {{2}} at JB.SKYLENS is confirmed 🚁

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
Tu pedido {{1}} ya fue enviado.

Empresa de envío: {{2}}
Número de guía: {{3}}
Entrega en: {{4}}
Web de rastreo: {{5}}

Gracias por comprar en JB.SKYLENS.
```

### Inglés (`en`)
```
Your order {{1}} has shipped.

Carrier: {{2}}
Tracking number: {{3}}
Delivery to: {{4}}
Tracking website: {{5}}

Thank you for shopping at JB.SKYLENS.
```

| Variable | Contenido | Ejemplo |
| --- | --- | --- |
| `{{1}}` | Código del pedido | `JB-7K2Q9M` |
| `{{2}}` | Empresa de envío | `Servientrega` |
| `{{3}}` | Número de guía | `1234567890` |
| `{{4}}` | Dirección de entrega | `Av. Libertad y Manabí, casa 12, Quito` |
| `{{5}}` | Enlace de rastreo (o `—` si no hay) | `https://www.servientrega.com.ec/rastreo` |

## `venta_nueva` (para la tienda)

### Español (`es`)
```
🛒 Nueva venta {{1}} por {{2}}

Cliente: {{3}}
Productos: {{4}}
Entrega: {{5}}
Pago: {{6}}

Gestiónala en el dashboard (Pedidos).
```

| Variable | Contenido | Ejemplo |
| --- | --- | --- |
| `{{1}}` | Código del pedido | `JB-7K2Q9M` |
| `{{2}}` | Total | `$545.00` |
| `{{3}}` | Cliente: nombre · teléfono · correo | `Ana Pérez · +593 98 765 4321 · ana@mail.com` |
| `{{4}}` | Productos | `1 × Dron Mini 4, 2 × Batería (Larga duración)` |
| `{{5}}` | Dirección · ciudad y costo de envío | `Av. Libertad y Manabí, casa 12, Quito · Quito · $5.00` |
| `{{6}}` | Forma de pago (y cupón si hubo) | `Transferencia (Banco Pichincha) · cupón BODA2026` |

## `transferencia_por_verificar` (para la tienda)

### Español (`es`)
```
🏦 Transferencia por verificar {{1}} por {{2}}

Cliente: {{3}}
Transferencia: {{4}}

Confírmala o recházala en el dashboard (Pedidos).
```

| Variable | Contenido | Ejemplo |
| --- | --- | --- |
| `{{1}}` | Código del pedido | `JB-7K2Q9M` |
| `{{2}}` | Total | `$545.00` |
| `{{3}}` | Cliente: nombre · teléfono · correo | `Ana Pérez · +593 98 765 4321 · ana@mail.com` |
| `{{4}}` | Banco · código de la transferencia | `Banco Pichincha · código 123456789` |

## Errores comunes

| Error | Causa |
| --- | --- |
| `(#132001) Template name does not exist in the translation` | La plantilla no existe, no está aprobada o no existe en ese idioma. Revisa el nombre y el código de idioma, o quita `WHATSAPP_USE_TEMPLATES=true` para enviar texto. |
| `(#132000) Number of parameters does not match` | La plantilla aprobada no tiene el número de variables esperado (6 en `pedido_pagado` y `venta_nueva`, 5 en `pedido_enviado`, 4 en `transferencia_por_verificar`). |
| `131047` (en el webhook) | Mensaje de texto sin plantilla a alguien que no te escribió en 24 h. |
| `(#131030) Recipient phone number not in allowed list` | Con el número de prueba de Meta solo puedes enviar a números verificados en API Setup. |
