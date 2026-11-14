# Guía 03: Integración del Sitio Comercial en la Raíz `/` del Host ASP.NET Core / Blazor

Esta guía documenta el patrón arquitectónico de **ERPRISE** para servir el Sitio Web Comercial estático (`WebPage`) directamente en la ruta raíz `/` del servidor Kestrel / IIS de Blazor Server, sin inicializar circuitos SignalR para visitantes anónimos y redirigiendo automáticamente a `/tablero` cuando el usuario ya tiene sesión activa.

---

## 1. Arquitectura de Rutas Canónicas

- **`/` (Raíz Pública)**: Sirve `src/<Proyecto>.WebPage/index.html` y sus assets (`css/`, `js/`, `images/`) como archivos estáticos puros (`<20ms`, cero circuitos SignalR).
- **`/login`**: Componente Blazor `Login.razor` (con enlace `"← Volver al sitio web"` apuntando a `/`).
- **`/tablero`**: Componente operativo principal de Blazor (`Home.razor` reubicado a `@page "/tablero"`). Todos los enlaces al inicio dentro del `NavMenu.razor` y post-login apuntan a `/tablero`.

---

## 2. Resolución de Directorios en Desarrollo y Producción (`ContenidoExternoHelper.cs`)

Copia la clase [`../resources/templates/blazor/ContenidoExternoHelper.cs`](../resources/templates/blazor/ContenidoExternoHelper.cs) dentro del proyecto `Host`. Esta utilidad localiza la carpeta `<Proyecto>.WebPage` tanto cuando corres `dotnet run` en desarrollo (`../<Proyecto>.WebPage`) como cuando despliegas publicado en IIS (`ContentRootPath/<Proyecto>.WebPage`).

---

## 3. Configuración en `Program.cs`

En el archivo `Program.cs` del proyecto `Host`, registra los archivos estáticos de la `WebPage` **antes** de `UseAuthentication()` y registra el endpoint `app.MapGet("/", ...)` **después** de `UseAuthorization()`:

```csharp
using Microsoft.Extensions.FileProviders;

// 1. Mapeo de recursos estáticos de la página comercial (Landing Page)
var webPagePath = ContenidoExternoHelper.ResolverDirectorio(
    builder.Environment.ContentRootPath,
    "NombreProyecto.WebPage");

string? webPageIndexPath = null;
if (!string.IsNullOrEmpty(webPagePath))
{
    var candidateIndex = Path.Combine(webPagePath, "index.html");
    if (File.Exists(candidateIndex))
    {
        webPageIndexPath = candidateIndex;
    }

    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(webPagePath),
        RequestPath = ""
    });
}

app.UseAntiforgery();
app.UseAuthentication();
app.UseAuthorization();

// 2. Endpoint raíz "/": redirige a /tablero si hay sesión HTTP o entrega index.html estático
if (!string.IsNullOrEmpty(webPageIndexPath))
{
    app.MapGet("/", (HttpContext context) =>
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            return Results.Redirect("/tablero");
        }
        return Results.File(webPageIndexPath, "text/html; charset=utf-8");
    });
}

app.MapControllers();
app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();
```

---

## 4. Doble Mecanismo de Redirección de Sesión Activa

1. **Nivel Servidor (Cookies / Claims HTTP)**: El endpoint `app.MapGet("/")` verifica `context.User.Identity?.IsAuthenticated == true` y responde con `HTTP 302` hacia `/tablero`.
2. **Nivel Cliente (`sessionStorage` en Blazor Server)**: Si el proyecto persiste la sesión en `sessionStorage` (mediante `ProtectedSessionStorage` o `sessionStorage.getItem('UserSession')`), el bloque `<script>` en el `<head>` de `index.html` redirige instantáneamente antes de renderizar la landing:
   ```html
   <script>
     if (sessionStorage.getItem('UserSession')) {
       window.location.replace('/tablero');
     }
   </script>
   ```

---

## 5. Aislamiento Total de Estilos

- `index.html` carga exclusivamente `css/style.css` (nunca se inyecta `style.css` en `App.razor`).
- `App.razor` carga exclusivamente `_content/MudBlazor/MudBlazor.min.css` y `app.css`.
- De esta forma, las más de 1,350 líneas de CSS comercial y los estilos de MudBlazor jamás colisionan entre sí.
