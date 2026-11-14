# Guía 04: Modo Kiosco, MiniApp Móvil (Svelte), Reportes Excel (`ClosedXML`) y Activos de Marca

Esta guía reúne los estándares visuales de ERPRISE para interfaces especializadas fuera del portal administrativo tradicional: terminales de Kiosco, aplicaciones móviles ligeras (Svelte / MiniApps), exportación de libros de Excel corporativos y creación/optimización de logotipos para nuevos productos.

---

## 1. Modo Kiosco / Superficies Oscuras de Alto Impacto (`#1E293B`)

Cuando un módulo requiere operar en modo Kiosco o terminal dedicada (ej. Reloj Checador, Terminal de Punto de Venta, Monitor de Piso o Turnero):

- **Cabecera Oscura (`#1E293B`)**:
  - Fondo `#1E293B` con texto blanco `#FFFFFF` y acentos celestes `#38BDF8` o `#0284C7`.
  - **Regla de Contraste del Logo (Pastilla Blanca)**: Como el isotipo de ERPRISE contiene trazos en azul marino oscuro, **siempre** debe colocarse dentro de una pastilla blanca redondeada en cabeceras oscuras:
    ```razor
    <div class="d-flex align-center gap-3">
        <div style="background: #FFFFFF; padding: 6px 10px; border-radius: 10px; display: flex; align-items: center; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
            <img src="images/logos/erprise-producto-icon.png" alt="Erprise" style="height: 32px; width: 32px; object-fit: contain;" />
        </div>
        <div>
            <MudText Typo="Typo.subtitle1" Style="font-weight: 800; color: #FFFFFF; letter-spacing: 0.05em;">
                ERPRISE PRODUCTO
            </MudText>
            <MudText Typo="Typo.caption" Style="color: #94A3B8;">
                Terminal Operativa en Línea
            </MudText>
        </div>
    </div>
    ```
- **Tarjetas de Estado Visual en Kiosco**:
  - **Éxito**: Borde y acento verde esmeralda (`#10B981`), fondo `#ECFDF5`.
  - **Alerta / Advertencia**: Borde ámbar (`#F59E0B`), fondo `#FFFBEB`.
  - **Bloqueo / Error**: Borde rojo (`#EF4444`), fondo `#FEF2F2`.

---

## 2. MiniApps Móviles (Svelte / SvelteKit / Web Móvil)

Para portales móviles de autoservicio o MiniApps (como Telegram MiniApp):

- **Cabecera Principal Compacta**:
  - Fondo blanco `#FFFFFF` con borde inferior `1px solid #E2E8F0`.
  - Isotipo `erprise-<producto>-icon.png` (`28x28px`) a la izquierda acompañado de `"Erprise <Producto>"` (`font-weight: 700`, `#1E293B` y `#0067B1`).
- **Navegación por Pestañas (Tabs)**:
  - Pestaña activa con indicador y texto en `#0067B1` (`font-weight: 600`) y fondo tenue `#E8F4FD`.
- **Botones de Acción Primarios**:
  - Fondo `#0067B1`, radio `10px`, altura táctil mínima de `44px`, estado `:disabled` con opacidad `0.5` y `cursor: not-allowed`.

---

## 3. Estándar de Exportación a Excel Corporativo (`ClosedXML`)

Cuando el proyecto genere reportes en `.xlsx` mediante `ClosedXML`, aplica la identidad cromática de ERPRISE en todas las hojas:

1. **Encabezado del Reporte (Filas 1 a 3)**:
   - Título del reporte en `B1` (`FontSize = 16`, `Bold = true`, `FontColor = XLColor.FromHtml("#0067B1")`).
   - Subtítulo con filtros aplicados y fecha de generación en `B2` (`FontSize = 10`, `FontColor = XLColor.FromHtml("#64748B")`).
2. **Cabeceras de Tabla**:
   - `BackgroundColor = XLColor.FromHtml("#0067B1")`
   - `FontColor = XLColor.White`, `Bold = true`, alineación centrada verticalmente.
3. **Colores Semánticos Condicionales en Celdas/Filas**:
   - **Normal / Puntual / Activo**: Texto `#065F46`, fondo de celda `#D1FAE5`.
   - **Alerta / Retardo / Advertencia**: Texto `#92400E`, fondo de celda `#FEF3C7` (o fila resaltada en `#FFFBEB`).
   - **Falta / Error / Crítico**: Texto `#991B1B`, fondo de celda `#FEE2E2`.
   - **Ajuste Manual / Auditoría Especial**: Texto morado `#6D28D9` en negrita, fila resaltada en lavanda suave `#F5F3FF`.
   - **Vacaciones / Tiempo Libre**: Texto `#0369A1`, fondo celeste suave `#E0F2FE`.
4. **Formato de Tabla**:
   - Bordes de celda internos con `XLColor.FromHtml("#E2E8F0")`.
   - `sheet.Columns().AdjustToContents()` al finalizar y `sheet.SheetView.FreezeRows(filaCabecera)`.

---

## 4. Activos Gráficos y Receta para Nuevos Productos (`Erprise [Producto]`)

Dentro de [`../resources/logos/`](../resources/logos/) cuentas con los activos corporativos base de ERPRISE:
- `piramide-erprise.png` (Isotipo piramidal corporativo)
- `logo-erprise.png` (Logotipo horizontal ERPRISE)
- `logo-erprise-letras.png` (Wordmark ERPRISE)
- `favicon.png` (Favicon 64x64 recortado sin márgenes vacíos)

### Cómo configurar los logos en un proyecto nuevo:
1. **Fallback Inmediato**: Copia los archivos de `resources/logos/` a `wwwroot/images/logos/` (y `WebPage/images/logos/`) para que la aplicación y la landing page funcionen de inmediato con la marca oficial ERPRISE.
2. **Identidad Específica del Producto (`erprise-<producto>-icon.png` y `erprise-<producto>-logo.png`)**:
   - Si el usuario proporciona o solicita generar un icono específico para el nuevo producto (ej. *Erprise Payroll*, *Erprise CRM*):
     - **Isotipo (`erprise-<producto>-icon.png`)**: Diseño vectorial limpio sobre fondo transparente combinando azul marino profundo (`#002855` / `#1E293B`) y azul corporativo (`#0067B1`).
     - **Logotipo Horizontal (`erprise-<producto>-logo.png`)**: Isotipo a la izquierda + `"ERPRISE"` en mayúsculas bold (`#002855`) arriba + `"<PRODUCTO>"` en mayúsculas (`#0067B1`) en medio + `"<LEMA DEL PRODUCTO>"` en línea inferior.
     - **Recorte y Optimización Obligatoria**: Recorta siempre el área transparente sobrante (bounding box real con margen de 2-4px) y genera `favicon.png` redimensionado a `64x64` píxeles con fondo transparente.
