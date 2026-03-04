# Compra Real — Documento de Negocio y Arquitectura

---

## 1. QUÉ ES LA APP

**Nombre:** Compra Real
**Tipo:** Web app mobile-first en español
**Propósito:** Ayuda a los usuarios a hacer una compra de supermercado de mayor calidad recomendándoles productos con ingredientes simples y poco procesados, sin que tengan que leer etiquetas ni comparar opciones.

**Propuesta de valor:**
- Una sola recomendación por categoría (sin sobrecarga de opciones)
- Ingredientes simples, reales y reconocibles
- Compatible con Mercadona y Carrefour
- El usuario introduce su lista de la compra y recibe recomendaciones concretas de producto

---

## 2. USUARIO OBJETIVO

- Adultos españoles que compran en supermercado (principalmente Mercadona o Carrefour)
- Interesados en comer mejor pero sin tiempo para investigar cada producto
- No necesitan ser expertos en nutrición — la app toma las decisiones por ellos

---

## 3. MONETIZACIÓN

| Elemento | Detalle |
|----------|---------|
| **Modelo** | Freemium con pago único |
| **Usos gratuitos** | 3 escaneos por usuario |
| **Precio** | 4,99 € pago único |
| **Acceso tras pago** | Ilimitado (sin suscripción) |
| **Estado actual** | Auth y paywall desactivados (flag `ENABLE_AUTH = false`) — app completamente gratuita de momento |

---

## 4. FLUJO DE USO

```
Inicio → Elige supermercado (Mercadona / Carrefour)
       → Home (hub principal)
       → Introduce lista:
           a) Foto de lista de la compra
           b) Escribir a mano
           c) Buscar por producto/categoría
       → Confirmación de items detectados
       → Recomendaciones por categoría
```

---

## 5. PANTALLAS (14 en total)

| Pantalla | Ruta | Función |
|----------|------|---------|
| Index | `/` | Redirecciona a `/select` |
| SupermarketSelect | `/select` | Elige Mercadona o Carrefour (guardado en localStorage) |
| Auth | `/auth` | Login / Registro (email + Google OAuth) |
| Onboarding | `/onboarding` | Presentación de valor, explica los 3 usos gratuitos |
| Home | `/home` | Hub principal: acceso a foto, escritura, búsqueda |
| Upload | `/upload` | Sube foto de lista de la compra |
| Write | `/write` | Escribe la lista manualmente |
| Search | `/search` | Busca por nombre de producto o categoría |
| Confirm | `/confirm` | Revisa y edita los items antes de generar recomendaciones |
| Results | `/results` | Muestra recomendaciones con imagen, nombre, ingredientes y razones |
| Paywall | `/paywall` | Explica el precio y beneficios del acceso ilimitado |
| Payment | `/payment` | Proceso de pago (Stripe, pendiente de implementar) |
| PaymentSuccess | `/payment-success` | Confirmación de compra y acceso desbloqueado |
| NotFound | `*` | Página 404 |

---

## 6. LÓGICA DE RECOMENDACIÓN

### Algoritmo de matching (basado en palabras clave)

La app cruza cada item de la lista del usuario con un mapa de palabras clave por categoría:

| Categoría | Palabras clave detectadas |
|-----------|--------------------------|
| patatas-fritas | patatas, patata, fritas, chips, snacks |
| yogur-natural | yogur, yogures, yogurt, yoghurt, natural |
| tomate-frito | tomate frito, tomates frito |
| galletas-simples | galletas, galleta, pastas, cookies, bizcocho |
| huevos | huevos, huevo, huevos camperos |
| avena | avena, copos de avena, oats, porridge |
| cereales | cereales, cereal, corn flakes, cornflakes |
| mostaza-antigua | mostaza antigua |
| mostaza-dijon | mostaza dijon, dijon |
| salsa-tomate | salsa de tomate, salsa tomate, tomate albahaca |
| helados | helado, helados, polo, polos, ice cream |
| pan-de-molde | pan de molde, pan molde |

### Por cada categoría detectada:
- **Producto primario** (recomendación principal) → siempre visible
- **Producto alternativo** → colapsable ("Ver alternativa")
- **Sin producto** → mensaje "No hay ningún producto aceptable en este supermercado en esta categoría"
- **Sin coincidencia** → item listado en sección "Aún no lo cubrimos"

### Criterios de selección de productos:
- Ingredientes simples y reconocibles
- Lista de ingredientes corta
- Sin aceites de semillas ni grasas refinadas (preferencia por AOVE o mantequilla real)
- Sin azúcares añadidos innecesarios
- Sin aditivos artificiales ni conservantes
- Preferencia por productos ecológicos cuando hay opción equivalente en precio

---

## 7. CATÁLOGO DE PRODUCTOS

### 12 categorías soportadas

**Mercadona:**

| Categoría | Primario | Alternativo |
|-----------|----------|-------------|
| Patatas fritas | Patatas fritas Hacendado (AOVE) | — |
| Yogur natural | Yogur natural Hacendado | Yogur griego Hacendado |
| Tomate frito | Tomate frito receta artesana Hacendado | Tomate frito Hida |
| Galletas simples | Galletas mantequilla Hacendado | Pastas de aceite Hacendado |
| Huevos | Huevos camperos Hacendado | — |
| Avena | Copos de avena Brüggen | — |
| Cereales | Corn Flakes Hacendado 0% | Copos trigo integral y arroz 0% Hacendado |
| Mostaza antigua | Mostaza antigua Hacendado | — |
| Mostaza Dijon | Mostaza Dijon Hacendado | — |
| Salsa tomate | Salsa tomate albahaca Hacendado | — |
| Helados | — (sin opción válida) | — |
| Pan de molde | — (sin opción válida) | — |

**Carrefour:**

| Categoría | Primario | Alternativo |
|-----------|----------|-------------|
| Patatas fritas | Patatas Fritas Eco Carrefour Bio (AOVE 39%) | Frit Ravich (AOVE 30%) |
| Yogur natural | Yogur Cremoso Carrefour Sensation | Danone Natural |
| Tomate frito | Tomate Frito Eco Hida | Tomate Frito Eco Carrefour Bio |
| Galletas simples | Galletas Mantequilla Eco Carrefour Bio | — |
| Huevos | Huevos Camperos Círculo de Calidad 12ud | Huevos Eco Carrefour Bio 10ud |
| Avena | Copos Avena Integral Carrefour | — |
| Cereales | — (sin opción válida) | — |
| Mostaza antigua | Mostaza Eco Ecocesta (sin azúcar) | — |
| Mostaza Dijon | Mostaza Dijon Carrefour Classic | Maille Dijon |
| Salsa tomate | Salsa Tomate De la Abuela Carrefour | — |
| Helados | Häagen-Dazs Vainilla | Häagen-Dazs Fresas y Crema |
| Pan de molde | Bimbo Natural 100% con Corteza | Bimbo Natural 100% sin Corteza |

---

## 8. CONTROL DE ACCESO

### Flag de activación
```
ENABLE_AUTH = false  →  App 100% gratuita, sin login
ENABLE_AUTH = true   →  Activa paywall y autenticación
```

### Métodos de autenticación (cuando está activo)
- **Email + contraseña** (con auto-registro si el email no existe)
- **Google OAuth**

### Lógica de usos gratuitos
- Al registrarse: 3 usos gratuitos
- Cada escaneo de resultados: descuenta 1 uso (via Edge Function)
- Al llegar a 0: redirección al paywall
- Tras pago: `is_paid = true`, usos ilimitados

---

## 9. BASE DE DATOS

### Tablas principales

**categories**
- `id`, `name`, `slug`, `description_short`, `order`, `active`

**products**
- `id`, `category_id` (FK), `name_exact`, `brand`, `supermarket`, `ingredients`, `image_key`, `role` (primary/alternative), `rank`, `why_recommended` (array de razones), `active`

**profiles**
- `id` (= auth.users.id), `email`, `is_paid`, `free_uses_remaining`, timestamps

**scans**
- `id`, `user_id` (FK), `input_type` (image/text), `raw_input`, `categories_matched` (array), `created_at`

### Seguridad
- Row Level Security (RLS) en todas las tablas
- Categorías y productos: lectura pública
- Perfiles y escaneos: solo el propio usuario puede ver/editar los suyos
- `is_paid` y `free_uses_remaining` no modificables desde el cliente

---

## 10. EDGE FUNCTIONS (Backend)

### `decrement-free-use`
- **Cuándo se ejecuta:** Al cargar la pantalla de resultados
- **Qué hace:** Verifica si el usuario tiene acceso y descuenta un uso si corresponde
- **Respuesta:** `{ access_granted: true/false, free_uses_remaining: N, is_paid: boolean }`
- **Seguridad:** Usa service role key (no manipulable desde el cliente)

---

## 11. STACK TECNOLÓGICO

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Estilos | Tailwind CSS + shadcn/ui |
| Routing | React Router v6 |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| Pagos | Stripe (pendiente de implementar) |
| Imágenes Mercadona | Archivos locales en `/public/products/` |
| Imágenes Carrefour | URLs CDN de Carrefour (`static.carrefour.es`) |

---

## 12. ESTADO ACTUAL DEL PRODUCTO

| Funcionalidad | Estado |
|---------------|--------|
| Recomendaciones Mercadona | ✅ Operativo |
| Recomendaciones Carrefour | ✅ Operativo |
| Búsqueda por producto | ✅ Operativo |
| Input por foto | ✅ Operativo |
| Input manual | ✅ Operativo |
| Autenticación | ✅ Implementado (desactivado por flag) |
| Paywall / Free uses | ✅ Implementado (desactivado por flag) |
| Pago con Stripe | ⏳ Pendiente de implementar |
| Lidl / Alcampo | ⏳ En roadmap |
| Más categorías | ⏳ En roadmap |

---

## 13. DECISIONES DE NEGOCIO TOMADAS

1. **Sin suscripción** — pago único de 4,99€ para eliminar fricción
2. **3 usos gratuitos** — suficiente para demostrar valor antes de pedir dinero
3. **Una sola recomendación por categoría** — reduce parálisis por elección
4. **Carrefour añadido antes de activar el paywall** — más valor antes de monetizar
5. **Auth desactivado temporalmente** — para crecer sin fricción inicial
6. **Sin IA en el matching** — sistema de palabras clave determinista y controlable
7. **Productos curados manualmente** — garantiza calidad de las recomendaciones

---

*Documento generado el 04/03/2026*
