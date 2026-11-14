# erprise-design-system — Paquete Portable de Sistema de Diseño ERPRISE

Paquete portable que contiene el **Plugin y Skill oficial del Sistema de Diseño ERPRISE**, listo para instalarse de forma global o por proyecto en **Google Antigravity**, **OpenCode**, **Kilo Code**, **Claude Code**, **Gemini CLI** y **Codex CLI**.

Permite replicar y parametrizar la identidad visual de la familia de productos **ERPRISE** (inspirada y extraída de `ErpriseAttendance`) en cualquier otro proyecto nuevo o existente:

1. **Aplicación Web SaaS (.NET Blazor + MudBlazor / CSS Agnóstico):**
   - Tema centralizado `ErpriseTheme.cs` (`Primary = #0067B1`, `Secondary = #0284C7`, `Background = #F8FAFC`, `Surface = #FFFFFF`, `TextDark = #1E293B`, tipografía `Inter`).
   - `MainLayout.razor` minimalista estilo SaaS (AppBar blanco con borde `#E2E8F0`, soporte adaptable **Multi-Tenant** con logo de empresa inquilina o **Single-Tenant**, y `MudDrawer` limpio sin duplicar marca).
   - `Login.razor` institucional con backdrop degradado sutil, tarjeta de `420px` (`border-radius: 16px`), logotipo completo en cabecera y enlace de retorno al sitio web.
   - Patrones de **Tablero Ejecutivo (KPIs)** con borde de acento izquierdo (`6px solid`), **Catálogos**, **Reportes con filtros secuenciales**, `MudTable` y diálogos modales.
2. **Sitio Web Comercial (`WebPage` en HTML5 / CSS3 / JS Vanilla):**
   - Arquitectura estática cero-dependencias con más de 1,350 líneas de CSS modular (`style.css`) y `main.js`.
   - Secciones completas: Header sticky con menú hamburguesa, Hero a 2 columnas con mockup, Grid de Highlights, Secciones detalladas alternadas (imagen/texto), Planes de Precios, Acordeón FAQ, Formulario de Contacto validado con envío a WhatsApp, Botón flotante de WhatsApp con pulso y SEO/OpenGraph.
3. **Integración Híbrida en Host (`/` → WebPage sin SignalR, `/tablero` → App):**
   - Configuración de `Program.cs` y `ContenidoExternoHelper.cs` para entregar la landing comercial en `/` en `<20ms` sin abrir circuitos SignalR para visitantes anónimos, redirigiendo automáticamente a `/tablero` cuando existe sesión activa.
4. **Kiosco, MiniApp Móvil, Reportes Excel (`ClosedXML`) y Activos de Marca:**
   - Superficies oscuras (`#1E293B`) con pastilla blanca redondeada para contraste de logo.
   - Estándar de cabeceras y colores condicionales para hojas de Excel corporativas.
   - Logos corporativos base embebidos en `resources/logos/` y receta para generar/recortar iconos y favicons (`64x64`) para nuevos productos de la suite (`Erprise [Producto]`).

---

## Instalación Rápida con `install.js` (Recomendado)

El script `install.js` (Node.js puro, sin dependencias externas) instala tanto el **Plugin de Antigravity** (`~/.gemini/config/plugins/erprise-design-system`) como la **Skill portable** en las herramientas de IA que utilices:

```bash
node install.js                        # Instala en todas las herramientas (modo global)
node install.js antigravity            # Solo Google Antigravity (Plugin + Skill global)
node install.js opencode kilocode      # Solo OpenCode y Kilo Code
node install.js claude gemini codex    # Solo Claude Code, Gemini CLI y Codex CLI
node install.js --project /ruta/app    # Instalar localmente dentro de un proyecto específico
node install.js --dry-run              # Previsualizar rutas sin escribir archivos
node install.js --no-overwrite         # No sobrescribir archivos existentes
```

---

## Estructura del Paquete

```text
erprise-design-system/
├── plugin.json                                     # Manifiesto del Plugin para Antigravity
├── README.md                                       # Documentación e instrucciones de instalación
├── install.js                                      # Instalador multi-herramienta (Node.js)
├── assets/
│   └── logo.png                                    # Isotipo para el catálogo de Plugins de Antigravity
└── skills/
    └── erprise-design-system/
        ├── SKILL.md                                # Skill principal con tokens, reglas y carga progresiva
        ├── references/
        │   ├── 01-blazor-mudblazor-saas.md         # Guía de componentes Blazor + MudBlazor (Theme, Layout, Login, KPIs, Tablas)
        │   ├── 02-webpage-comercial.md             # Guía del Sitio Web Comercial estático (HTML5/CSS3/JS)
        │   ├── 03-integracion-host-landing.md      # Integración de WebPage en "/" + redirección a "/tablero"
        │   └── 04-kiosco-miniapp-excel-logos.md    # Modo Kiosco, MiniApp Svelte, Excel ClosedXML y generación de logos
        └── resources/
            ├── logos/
            │   ├── piramide-erprise.png            # Isotipo piramidal corporativo ERPRISE
            │   ├── logo-erprise.png                # Logotipo horizontal oficial ERPRISE
            │   ├── logo-erprise-letras.png         # Wordmark ERPRISE
            │   └── favicon.png                     # Favicon 64x64 optimizado
            └── templates/
                ├── blazor/
                │   ├── ErpriseTheme.cs
                │   ├── app.css
                │   ├── MainLayout.razor
                │   ├── Login.razor
                │   └── ContenidoExternoHelper.cs
                └── webpage/
                    ├── index.html
                    ├── css/style.css
                    └── js/main.js
```
