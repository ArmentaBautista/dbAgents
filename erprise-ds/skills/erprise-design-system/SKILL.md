---
name: erprise-design-system
description: Sistema de diseño corporativo oficial de ERPRISE para aplicaciones web SaaS (.NET Blazor + MudBlazor, Svelte MiniApps y CSS agnóstico), Sitios Web Comerciales estáticos (HTML5/CSS3/JS Vanilla), integración en raíz "/" sin circuitos SignalR, modo Kiosco, reportes Excel ejecutivos (ClosedXML) y gestión de identidad gráfica (logos y favicons). Úsese siempre que el usuario pida aplicar los estilos de ERPRISE, crear o rediseñar una aplicación, pantalla, tablero KPI, catálogo, login o landing page comercial con la estética de ErpriseAttendance.
---

# ERPRISE Design System — Guía Maestra e Implementación

Esta skill define y provee todas las directrices visuales, tokens cromáticos, patrones de componentes y plantillas listas para inyectar el **Sistema de Diseño Institucional ERPRISE** en cualquier proyecto nuevo o existente.

---

## 1. Identidad de Marca y Parametrización (`Erprise [Producto]`)

Por defecto, todos los proyectos pertenecen a la **familia de productos ERPRISE**, conservando la estética SaaS empresarial limpia en **Modo Claro (`Light Mode`)** y reservando las superficies oscuras (`#1E293B`) para pantallas de Kiosco, badges y pies de página (`footer`).

### Parámetros del Producto (Consultar o inferir del proyecto destino)
Al aplicar esta skill en un proyecto nuevo o existente, identifica o pregunta estos 4 datos (usando los valores de ERPRISE como predeterminados):
1. **Nombre del Producto (`{{PRODUCT_NAME}}`)**: Formato `"Erprise <Producto>"` (ej. `Erprise Attendance`, `Erprise Payroll`, `Erprise Inventory`). En el AppBar y Header, `"Erprise"` va en `#1E293B` (`font-weight: 700`) y `"<Producto>"` va en el color primario `#0067B1` (`font-weight: 600`).
2. **Lema o Propuesta de Valor (`{{PRODUCT_SLOGAN}}`)**: Subtítulo corto descriptivo del sistema.
3. **Esquema de Cabecera (`Multi-Tenant` vs `Single-Tenant`)**:
   - **Multi-Tenant**: Muestra a la derecha del AppBar el contenedor con borde sutil para el logo de la empresa cliente (`EmpresaLogo`), el nombre de la empresa (`EmpresaNombre`), el usuario activo y el botón de cerrar sesión.
   - **Single-Tenant**: Muestra a la derecha únicamente el nombre/rol del usuario autenticado y el botón de cerrar sesión.
4. **Activos Gráficos (`wwwroot/images/logos/`)**:
   - Si el proyecto ya cuenta con su icono (`erprise-<producto>-icon.png`) y logo horizontal (`erprise-<producto>-logo.png`), úsalos.
   - Si no cuenta con ellos, copia inmediatamente los activos corporativos base desde `resources/logos/` (`piramide-erprise.png`, `logo-erprise.png`, `favicon.png`) o sigue la receta en `references/04-kiosco-miniapp-excel-logos.md` para generarlos y recortarlos a su área gráfica real.

---

## 2. Tokens de Diseño Oficiales (Agnósticos al Stack)

Estos tokens son la única fuente de verdad tanto en C# (`ErpriseTheme.cs`), como en CSS (`:root` en `style.css` / `app.css`) y en componentes Svelte/Tailwind:

| Token Semántico | Valor Hex / CSS | Uso Principal |
| :--- | :--- | :--- |
| **Primary (`--erprise-primary`)** | `#0067B1` | Azul corporativo ERPRISE: botones primarios, enlaces activos, acento de marca, encabezados Excel. |
| **Primary Dark (`--erprise-primary-dark`)** | `#004E8A` | Hover en botones primarios y enlaces. |
| **Primary Light (`--erprise-primary-light`)** | `#E8F4FD` | Fondos tenues de badges, iconos destacados y selección activa en menús. |
| **Secondary (`--erprise-secondary`)** | `#0284C7` | Celeste tecnológico moderno: acentos secundarios, enlaces de apoyo, subtítulos destacados. |
| **Accent Light (`--erprise-accent`)** | `#3F8DC4` | Gradientes suaves y detalles gráficos. |
| **Background (`--erprise-bg`)** | `#F8FAFC` | Lienzo general de la aplicación (`MudMainContent`, secciones alternas `--alt`). |
| **Surface (`--erprise-surface`)** | `#FFFFFF` | Fondo de `MudAppBar`, `MudDrawer`, tarjetas (`MudCard`/`MudPaper`), tablas y diálogos. |
| **Text Dark (`--erprise-text-dark`)** | `#1E293B` | Texto principal de alto contraste, títulos y texto del AppBar (WCAG AA > 4.5:1). |
| **Text Heading (`#0F172A`)** | `#0F172A` | Encabezados ejecutivos de página (`Typo.h4`, `font-weight: 800`). |
| **Text Muted (`--erprise-text-muted`)** | `#64748B` | Subtítulos, etiquetas secundarias, iconos inactivos del Drawer y metadatos. |
| **Text Light (`--erprise-text-light`)** | `#94A3B8` | Placeholders, textos deshabilitados y notas al pie de copyright. |
| **Border (`--erprise-border`)** | `#E2E8F0` | Línea divisoria inferior del AppBar (`1px solid #E2E8F0`), lateral del Drawer, bordes de tarjetas y líneas de tabla. |
| **Table Hover** | `#F1F5F9` | Resaltado suave al pasar el cursor sobre filas de tablas. |
| **Tipografía Principal** | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | Fuente institucional en todos los encabezados, tablas, inputs y botones. |
| **Radios de Borde** | `8px` (estándar/botones/inputs), `12px` (tarjetas limpias), `16px` (Login/KPIs/Modales) | Estética moderna redondeada sin bordes agresivos. |
| **Dimensiones de Layout** | `AppbarHeight = 64px`, `DrawerWidthLeft = 240px` | Con `padding-top: calc(var(--mud-appbar-height) + 20px) !important` en `MudMainContent`. |

---

## 3. Enrutamiento Progresivo de Guías y Plantillas (`references/` y `resources/`)

Para mantener la ventana de contexto óptima, **lee únicamente los archivos de referencia correspondientes a la tarea solicitada** (rutas relativas a la carpeta de esta skill):

1. **Aplicación Web SaaS (.NET Blazor + MudBlazor / UI Operativa)**
   - 📖 **Leer guía**: [`references/01-blazor-mudblazor-saas.md`](./references/01-blazor-mudblazor-saas.md)
   - 📦 **Plantillas listas para copiar**:
     - [`resources/templates/blazor/ErpriseTheme.cs`](./resources/templates/blazor/ErpriseTheme.cs)
     - [`resources/templates/blazor/app.css`](./resources/templates/blazor/app.css)
     - [`resources/templates/blazor/MainLayout.razor`](./resources/templates/blazor/MainLayout.razor)
     - [`resources/templates/blazor/Login.razor`](./resources/templates/blazor/Login.razor)
   - Cubre: Configuración de `MudTheme`, AppBar blanco SaaS (Multi-Tenant y Single-Tenant), `MudDrawer` sin logo duplicado, pantalla de Login institucional, Tablero de Control con KPIs de borde izquierdo (`6px solid`), encabezados ejecutivos, paneles de filtros secuenciales y tablas `MudTable` con chips de estado.

2. **Sitio Web Comercial (`WebPage` estática en HTML5 / CSS3 / JS Vanilla)**
   - 📖 **Leer guía**: [`references/02-webpage-comercial.md`](./references/02-webpage-comercial.md)
   - 📦 **Plantillas listas para copiar**:
     - [`resources/templates/webpage/index.html`](./resources/templates/webpage/index.html)
     - [`resources/templates/webpage/css/style.css`](./resources/templates/webpage/css/style.css)
     - [`resources/templates/webpage/js/main.js`](./resources/templates/webpage/js/main.js)
   - Cubre: Arquitectura estática sin dependencias de Node.js ni frameworks SPA, Header sticky con menú móvil hamburguesa, Hero a 2 columnas con logo completo y captura del tablero, Grid de 6 Highlights, Secciones detalladas alternadas (imagen/texto), Planes de Precios, Acordeón FAQ nativo, Formulario de contacto validado en cliente con envío a WhatsApp, Botón flotante de WhatsApp con pulso y SEO/OpenGraph.

3. **Integración del Sitio Comercial en la Raíz `/` del Host ASP.NET Core / Blazor**
   - 📖 **Leer guía**: [`references/03-integracion-host-landing.md`](./references/03-integracion-host-landing.md)
   - 📦 **Plantilla lista para copiar**:
     - [`resources/templates/blazor/ContenidoExternoHelper.cs`](./resources/templates/blazor/ContenidoExternoHelper.cs)
   - Cubre: Cómo servir `index.html` y sus assets en `/` con `PhysicalFileProvider` y `UseStaticFiles` en `<20ms` **sin abrir circuitos SignalR** para visitantes anónimos, doble redirección automática a `/tablero` cuando el usuario ya tiene sesión activa, y aislamiento total de CSS entre la WebPage y MudBlazor.

4. **Modo Kiosco, MiniApp Móvil (Svelte), Reportes Excel (`ClosedXML`) y Activos de Marca**
   - 📖 **Leer guía**: [`references/04-kiosco-miniapp-excel-logos.md`](./references/04-kiosco-miniapp-excel-logos.md)
   - 📦 **Logos base embebidos**:
     - [`resources/logos/piramide-erprise.png`](./resources/logos/piramide-erprise.png)
     - [`resources/logos/logo-erprise.png`](./resources/logos/logo-erprise.png)
     - [`resources/logos/logo-erprise-letras.png`](./resources/logos/logo-erprise-letras.png)
     - [`resources/logos/favicon.png`](./resources/logos/favicon.png)
   - Cubre: Contenedores oscuros (`#1E293B`) con pastilla blanca redondeada para contraste del logo en Kioscos, cabeceras y navegación móvil en Svelte MiniApp, formato ejecutivo y colores condicionales en exportaciones Excel con `ClosedXML`, y procedimiento para generar/recortar iconos y favicons (`64x64`) para nuevos productos ERPRISE.

---

## 4. Reglas Inquebrantables de Diseño ERPRISE

1. **Cero Colisión de Estilos**: En aplicaciones Blazor, usa `ErpriseTheme.Theme` y las propiedades de `MudBlazor`. Evita hojas CSS ad-hoc que sobreescriban globalmente los componentes de MudBlazor; usa las clases utilitarias prefijadas con `.erprise-*` definidas en `app.css`.
2. **AppBar Blanco Minimalista (`#FFFFFF`)**: Nunca uses un AppBar de color sólido pesado que compita con el logo de ERPRISE o con el logo de la empresa cliente. Delimítalo siempre con `Elevation="0"` y `border-bottom: 1px solid #E2E8F0`.
3. **Sin Logos Duplicados en el Drawer**: El `MudDrawer` inicia directamente con `<NavMenu />` (`Class="pt-2"`), sin repetir el logotipo que ya está visible arriba en el `MudAppBar`.
4. **Sin Subtítulos Redundantes en Login**: Cuando el logotipo superior en `Login.razor` ya incluye el nombre y lema del producto (`erprise-<producto>-logo.png`), no agregues textos ni subtítulos repetidos debajo de la imagen.
5. **Contraste en Superficies Oscuras**: Siempre que coloques el isotipo o logotipo de ERPRISE sobre un fondo oscuro (`#1E293B` o `#0F172A`, como en el Kiosco o en el Footer de la WebPage), envuélvelo dentro de una pastilla blanca redondeada (`background: #FFFFFF; padding: 6px 12px; border-radius: 10px;`) para garantizar legibilidad absoluta.
6. **Cache Busting en Favicon**: Referencia siempre el favicon con parámetro de versión (`favicon.png?v=3`) en `App.razor` e `index.html` para invalidar cachés previas del navegador.
