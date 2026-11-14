# Guía 02: Sitio Web Comercial Estático (`WebPage` en HTML5 / CSS3 / JS Vanilla)

Esta guía define cómo construir o adaptar el **Sitio Web Comercial (Landing Page)** de cualquier producto de la familia ERPRISE siguiendo el estándar exacto de `ErpriseAttendance.WebPage`.

Las plantillas completas listas para copiar están en:
- HTML base: [`../resources/templates/webpage/index.html`](../resources/templates/webpage/index.html)
- Hoja de estilos (1,351 líneas): [`../resources/templates/webpage/css/style.css`](../resources/templates/webpage/css/style.css)
- Script interactivo: [`../resources/templates/webpage/js/main.js`](../resources/templates/webpage/js/main.js)

---

## 1. Principios de Arquitectura del Sitio Comercial

1. **Cero Dependencias de Build**: Construido exclusivamente con HTML5 semántico, CSS3 moderno (Custom Properties, CSS Grid, Flexbox) y JavaScript Vanilla ES6+. No requiere Node.js, Webpack ni frameworks SPA para funcionar, permitiendo servirlo en `<20ms` desde cualquier CDN o directamente desde Kestrel/IIS.
2. **Estructura Single-Page con Navegación por Anclas**:
   - `#inicio` (Hero)
   - `#funciones` (Grid de Highlights + Secciones detalladas alternadas)
   - `#precios` (Tarjetas de Planes)
   - `#faq` (Preguntas Frecuentes en acordeón `<details>`)
   - `#contacto` (Formulario validado en cliente con envío a WhatsApp)
3. **Diseño 100% Responsive**:
   - Desktop (`> 1024px`): Grids de 3 columnas, Hero y Features a 2 columnas.
   - Tablet (`768px - 1024px`): Grids adaptados a 2 columnas.
   - Móvil (`< 768px`): Navegación colapsada en menú hamburguesa (`.mobile-nav`), grids apilados en 1 columna y tipografía fluida.

---

## 2. Anatomía Sección por Sección

### 2.1 `<head>`, SEO, Open Graph y Redirección de Sesión
- Incluye siempre meta tags `description`, `keywords`, `author="ERPRISE"`, Open Graph (`og:title`, `og:description`, `og:image`, `og:locale="es_MX"`) y Twitter Card.
- Favicon con versión: `<link rel="icon" type="image/png" href="images/logos/favicon.png?v=3">`.
- Si la WebPage se sirve como raíz `/` de una aplicación Blazor que guarda sesión en `sessionStorage`, incluye el script ligero en `<head>`:
  ```html
  <script>
    if (sessionStorage.getItem('UserSession')) {
      window.location.replace('/tablero');
    }
  </script>
  ```

### 2.2 Header Sticky (`.header`) y Navegación Móvil (`.mobile-nav`)
- **Logo izquierdo (`.header__logo`)**: Imagen `erprise-<producto>-icon.png` (`34x34`) + bloque `.header__logo-text` con dos `<span>`: el primero `"Erprise"` (oscuro) y el segundo `"<Producto>"` (azul `#0067B1`).
- **Enlaces centrales (`.header__nav`)**: `Funciones`, `Precios`, `FAQ`, `Contacto` con ScrollSpy automático al hacer scroll.
- **Botones CTA derechos (`.header__cta`)**:
  - `<a href="/login" class="btn btn--secondary btn--sm">Iniciar Sesión</a>`
  - `<a href="#contacto" class="btn btn--primary btn--sm">Solicitar Demo</a>`

### 2.3 Sección Hero (`#inicio`)
- **Layout en 2 columnas (`.hero__content.hero__intro`)**:
  - **Columna Izquierda (`.hero__brand`)**: Logotipo oficial completo `images/logos/erprise-<producto>-logo.png` (`width="640" height="268"`).
  - **Columna Derecha (`.hero__copy`)**:
    - `.hero__badge`: Pastilla azul claro con icono SVG y categoría del software (ej. *"Plataforma Empresarial de ..."*).
    - `.hero__title`: Título principal de impacto con una palabra o sílaba clave envuelta en `<span>` para pintarla en azul `#0067B1`.
    - `.hero__subtitle`: Resumen de 2-3 líneas de las capacidades diferenciadoras.
    - `.hero__actions`: Botones `Solicitar Demo` (`.btn--primary.btn--lg`) y `Ver Funciones` (`.btn--secondary.btn--lg`).
- **Mockup inferior (`.hero__image`)**: Captura real de alta resolución del Tablero Ejecutivo del producto (`images/screenshots/tablero-ejecutivo.png`) con sombra profunda y marco redondeado.

### 2.4 Grid de Highlights (`#funciones` — `.highlights__grid`)
- Entre **4 y 6 tarjetas** (`.highlight-card`) distribuidas en grid responsivo.
- Cada tarjeta contiene:
  - `.highlight-card__icon`: Icono SVG lineal dentro de un recuadro con fondo `--erprise-primary-light` (`#E8F4FD`) y trazo `--erprise-primary` (`#0067B1`).
  - `.highlight-card__title`: Nombre de la capacidad clave.
  - `.highlight-card__desc`: Descripción concisa de 2 líneas.

### 2.5 Secciones Detalladas Alternadas (`.feature-detail`)
- Al menos **4 o 5 secciones** que profundizan en los módulos estelares del producto.
- Alternan el fondo (`.section` blanco vs `.section--alt` en `#F8FAFC`) y la dirección del layout (`.feature-detail` normal vs `.feature-detail--reverse`).
- Cada sección incluye:
  - `.feature-detail__tag`: Etiqueta superior en mayúsculas (ej. `MÓDULO ESTELAR`).
  - `.feature-detail__title` y `.feature-detail__desc`.
  - `.feature-detail__list`: Lista de 4 puntos clave con checkmarks SVG.
  - `.feature-detail__media`: Captura real del módulo en la aplicación con pie de foto (`.feature-detail__caption`).

### 2.6 Planes de Precios (`#precios` — `.pricing__grid`)
- Tarjetas comparativas (`.pricing-card`) para al menos 2 o 3 planes (ej. *Plan Esencial* y *Plan Profesional* con clase `.pricing-card--featured` y badge *"Más Popular"*).
- Lista de características incluidas (`.pricing-card__features`) y botón CTA hacia `#contacto`.

### 2.7 Preguntas Frecuentes (`#faq` — `.faq__list`)
- Mínimo 6 preguntas usando elementos nativos `<details class="faq__item">` y `<summary class="faq__question">`.
- `main.js` cierra automáticamente los demás ítems cuando el visitante abre uno nuevo.

### 2.8 Formulario de Contacto (`#contacto`) y Botón Flotante de WhatsApp
- **Formulario (`#contact-form`)**: Campos Nombre (`*`), Empresa, Correo Electrónico (`*`), Teléfono y Mensaje (`*`).
- **Validación y Conversión**: `main.js` valida campos obligatorios y formato de email en tiempo real; al enviar sin errores, estructura el mensaje formateado, muestra el estado de éxito (`#form-success`) y abre `https://wa.me/<numero>?text=...`.
- **Botón Flotante (`.whatsapp-float`)**: Fijo en la esquina inferior derecha con icono oficial de WhatsApp y microanimación de pulso.

### 2.9 Footer Institucional Oscuro (`.footer`)
- Fondo oscuro (`#0F172A` / `#1E293B`).
- El logotipo oficial en el footer debe mostrarse con alto contraste (usando contenedor claro o versión de alto contraste), acompañado de enlaces rápidos, datos de contacto y año dinámico (`#footer-year`).
