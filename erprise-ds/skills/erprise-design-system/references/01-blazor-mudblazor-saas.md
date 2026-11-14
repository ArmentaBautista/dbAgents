# Guía 01: Aplicación Web SaaS (.NET Blazor + MudBlazor y UI Operativa)

Esta guía detalla la implementación del sistema de diseño ERPRISE en aplicaciones web administrativas construidas con **.NET (Blazor Server / Blazor WebAssembly) y MudBlazor**, así como los patrones equivalentes en CSS para otros stacks.

---

## 1. Tema Centralizado (`ErpriseTheme.cs`)

Crea o actualiza `ErpriseTheme.cs` en el proyecto compartido (`Shared/UI/ErpriseTheme.cs`) o en el proyecto `Host`.
Plantilla base disponible en: [`../resources/templates/blazor/ErpriseTheme.cs`](../resources/templates/blazor/ErpriseTheme.cs).

### Puntos Clave de `ErpriseTheme.cs`:
- **Tipografía**: Fuente `'Inter'` en `Typography.Default.FontFamily`. Asegúrate de incluir la fuente Inter de Google Fonts en `App.razor`:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  ```
- **LayoutProperties**:
  - `DefaultBorderRadius = "8px"`
  - `AppbarHeight = "64px"`
  - `DrawerWidthLeft = "240px"`
- **PaletteLight**:
  - `Primary = "#0067B1"`, `Secondary = "#0284C7"`
  - `AppbarBackground = "#FFFFFF"`, `AppbarText = "#1E293B"`
  - `Background = "#F8FAFC"`, `Surface = "#FFFFFF"`
  - `DrawerBackground = "#FFFFFF"`, `DrawerText = "#334155"`, `DrawerIcon = "#64748B"`
  - `TextPrimary = "#1E293B"`, `TextSecondary = "#64748B"`
  - `LinesDefault = "#E2E8F0"`, `LinesInputs = "#CBD5E1"`, `TableLines = "#E2E8F0"`, `TableHover = "#F1F5F9"`

---

## 2. Layout Principal (`MainLayout.razor`) — Multi-Tenant y Single-Tenant

Plantilla completa disponible en: [`../resources/templates/blazor/MainLayout.razor`](../resources/templates/blazor/MainLayout.razor).

### Estructura Obligatoria del Layout:
1. **Proveedores Globales en la parte superior**:
   ```razor
   <MudThemeProvider Theme="ErpriseTheme.Theme" DefaultScrollbar="true" />
   <MudPopoverProvider />
   <MudDialogProvider FullWidth="true" MaxWidth="MaxWidth.Small" CloseButton="true" />
   <MudSnackbarProvider />
   ```
2. **AppBar Minimalista Blanco (`#FFFFFF`)**:
   - `Elevation="0"` y `Style="background-color: #FFFFFF; border-bottom: 1px solid #E2E8F0;"`
   - **Izquierda**:
     - Botón Hamburguesa (`Icons.Material.Filled.Menu`, `style="color: #1E293B;"`).
     - Isotipo del producto (`images/logos/erprise-<producto>-icon.png` o `images/logos/piramide-erprise.png`, `height: 32px; width: 32px; object-fit: contain;`).
     - Marca tipográfica dual:
       ```razor
       <div class="d-flex align-baseline gap-1">
           <MudText Typo="Typo.h6" Style="font-family: 'Inter', sans-serif; font-weight: 700; color: #1E293B; letter-spacing: -0.02em;">Erprise</MudText>
           <MudText Typo="Typo.h6" Style="font-family: 'Inter', sans-serif; font-weight: 600; color: #0067B1; font-size: 1rem;">NombreProducto</MudText>
       </div>
       ```
   - **Derecha (Adaptable)**:
     - **Si es Multi-Tenant**: Renderiza el logo de la empresa cliente (si existe claim `EmpresaLogo`) dentro de un marco protector blanco (`border: 1px solid #E2E8F0; padding: 2px 6px; border-radius: 6px; background: #FFFFFF; max-height: 28px;`), seguido de una columna alineada a la derecha con `EmpresaNombre` (`0.88rem`, `font-weight: 600`, `#1E293B`) arriba y el usuario (`0.75rem`, `#64748B`) abajo, más el botón `Logout`.
     - **Si es Single-Tenant**: Omite el logo de empresa inquilina y muestra el nombre del usuario (`0.88rem`, `font-weight: 600`, `#1E293B`), su rol o correo debajo (`0.75rem`, `#64748B`) y el botón `Logout`.
3. **Drawer Lateral (`MudDrawer`)**:
   - `Elevation="0" ClipMode="DrawerClipMode.Always" Color="Color.Surface" Style="border-right: 1px solid #E2E8F0;" Class="pt-2"`
   - **No colocar logotipo en el Drawer** para evitar redundancia visual con el AppBar.
4. **Contenido Principal (`MudMainContent`)**:
   - En vista autenticada:
     ```razor
     <MudMainContent Style="background-color: #F8FAFC; min-height: 100vh; padding-top: calc(var(--mud-appbar-height) + 20px) !important; padding-left: 24px; padding-right: 24px; padding-bottom: 24px;">
         @Body
     </MudMainContent>
     ```
   - En vista no autenticada (`<NotAuthorized>`):
     ```razor
     <MudMainContent Style="min-height: 100vh; background-color: #F8FAFC;">
         @Body
     </MudMainContent>
     ```

---

## 3. Pantalla de Inicio de Sesión (`Login.razor`)

Plantilla disponible en: [`../resources/templates/blazor/Login.razor`](../resources/templates/blazor/Login.razor).

- **Contenedor Fondo (`erprise-login-backdrop`)**:
  - `min-height: 100vh; padding: 24px;` con gradiente `linear-gradient(135deg, #F8FAFC 0%, #EEF2F6 50%, #E2E8F0 100%)`.
- **Tarjeta Central (`MudCard`)**:
  - `Elevation="0"`
  - `Style="width: 420px; padding: 32px 28px; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03); background-color: #FFFFFF;"`
- **Encabezado del Login**:
  - Imagen `images/logos/erprise-<producto>-logo.png` (o `logo-erprise.png`) con `max-width: 280px; width: 100%; height: auto; object-fit: contain;`.
  - Sin repetir en texto el nombre del producto si el logotipo ya lo incluye.
- **Acciones**:
  - Botón primario ancho completo: `Variant="Variant.Filled" Color="Color.Primary" Size="Size.Large"` con `Style="border-radius: 8px; font-weight: 600; text-transform: none; font-size: 1rem; padding: 10px 0; background-color: #0067B1;"`.
  - Enlace de retorno al sitio web comercial (si aplica):
    ```razor
    <MudLink Href="/" Typo="Typo.body2" Color="Color.Secondary" Style="text-decoration: none; font-weight: 500; font-size: 0.88rem; display: inline-flex; align-items: center; gap: 4px;">
        <MudIcon Icon="@Icons.Material.Filled.ArrowBack" Size="Size.Small" /> Volver al sitio web
    </MudLink>
    ```
  - Pie de derechos reservados: `© @DateTime.Now.Year ERPRISE • Todos los derechos reservados` en `#94A3B8`.

---

## 4. Patrones de Páginas Operativas, Tableros KPI y Catálogos

### 4.1 Encabezado Ejecutivo de Página
Todas las pantallas operativas dentro de `<MudContainer MaxWidth="MaxWidth.ExtraLarge" Class="mt-4 mb-10">` deben iniciar con este patrón de cabecera:

```razor
<div class="d-flex justify-space-between align-center mb-6 flex-wrap gap-4">
    <div>
        <MudText Typo="Typo.h4" Style="font-weight: 800; color: #0F172A;">Título de la Pantalla</MudText>
        <MudText Typo="Typo.subtitle2" Color="Color.Secondary">
            Descripción breve o contexto operativo de la vista
        </MudText>
    </div>
    <div class="d-flex align-center gap-2">
        <MudButton Variant="Variant.Outlined" Color="Color.Primary" StartIcon="@Icons.Material.Filled.Refresh" Size="Size.Small">
            Actualizar
        </MudButton>
        <MudButton Variant="Variant.Filled" Color="Color.Primary" StartIcon="@Icons.Material.Filled.Add" Size="Size.Small">
            Nuevo Registro
        </MudButton>
    </div>
</div>
```

### 4.2 Tarjetas KPI (Indicadores Numéricos de Cabecera)
Para tableros (`/tablero`) y cabeceras de reportes (ej. 4 tarjetas KPI en `MudGrid Spacing="2" Class="mb-4"`):

```razor
<MudItem XS="12" SM="6" MD="3">
    <MudPaper Elevation="1" Class="pa-4 rounded-xl d-flex align-center justify-space-between"
              Style="border-left: 6px solid var(--mud-palette-primary); background: #FFFFFF;">
        <div>
            <MudText Typo="Typo.caption" Style="font-weight: 700; text-transform: uppercase;" Color="Color.Primary">
                TOTAL REGISTROS
            </MudText>
            <div class="d-flex align-baseline gap-2 mt-1">
                <MudText Typo="Typo.h3" Style="font-weight: 800; color: #1E293B;">
                    128
                </MudText>
                <MudText Typo="Typo.subtitle2" Color="Color.Secondary">
                    activos
                </MudText>
            </div>
            <MudText Typo="Typo.caption" Color="Color.Secondary">
                Detalle o comparativa del indicador
            </MudText>
        </div>
        <MudAvatar Color="Color.Primary" Size="Size.Large" Style="background-opacity: 0.15;">
            <MudIcon Icon="@Icons.Material.Filled.People" Size="Size.Large" />
        </MudAvatar>
    </MudPaper>
</MudItem>
```
> **Variantes de color por semántica en KPIs**: Usa `primary` (`#0067B1`) para totales generales, `success` para métricas positivas/asistencias, `warning` para alertas/retardos/pendientes, y `error` para incidencias críticas/faltas.

### 4.3 Panel de Filtros y Tablas de Datos (`MudTable`)
- **Panel de Filtros**: Usa `<MudPaper Elevation="0" Class="pa-4 mb-4 erprise-card-clean">` con `<MudGrid Spacing="2" AlignItems="AlignItems.Center">` para colocar selectores de fechas (`MudDatePicker`), autocompletadores (`MudAutocomplete`), combos (`MudSelect`) y botón de consulta o exportación a Excel.
- **Tablas (`MudTable`)**:
  - Envuelve la tabla o usa `Elevation="0" Class="erprise-card-clean"` con `Hover="true" Dense="false" Striped="false"`.
  - Incluye `<ToolBarContent>` con título de sección a la izquierda, `<MudSpacer />` y buscador instantáneo `<MudTextField Placeholder="Buscar..." Adornment="Adornment.Start" AdornmentIcon="@Icons.Material.Filled.Search" Immediate="true" />` a la derecha.
  - Incluye siempre `<PagerContent><MudTablePager RowsPerPageString="Filas por página:" InfoFormat="{first_item}-{last_item} de {all_items}" /></PagerContent>`.
  - Usa `<MudChip T="string" Size="Size.Small" Variant="Variant.Filled" Color="...">` con `<MudTooltip>` para representar estados y categorías de forma escaneable.
