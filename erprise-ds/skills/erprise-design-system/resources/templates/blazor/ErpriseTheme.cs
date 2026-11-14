using MudBlazor;

namespace Erprise.Shared.UI; // Ajusta el namespace al de tu proyecto (ej. MiProyecto.Shared.UI)

/// <summary>
/// Configuración visual y paleta cromática corporativa oficial de ERPRISE para MudBlazor.
/// </summary>
public static class ErpriseTheme
{
    // Constantes de color corporativo oficial ERPRISE
    public const string PrimaryColor = "#0067B1";
    public const string SecondaryColor = "#0284C7";
    public const string AccentLight = "#3F8DC4";
    public const string BackgroundColor = "#F8FAFC";
    public const string SurfaceColor = "#FFFFFF";
    public const string TextDarkColor = "#1E293B";
    public const string TextMutedColor = "#64748B";
    public const string BorderColor = "#E2E8F0";

    /// <summary>
    /// Tema corporativo oficial con AppBar minimalista SaaS (Surface Blanco) y acentos ERPRISE.
    /// </summary>
    public static readonly MudTheme Theme = new()
    {
        Typography = new Typography
        {
            Default = new DefaultTypography
            {
                FontFamily = new[] { "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif" }
            }
        },
        LayoutProperties = new LayoutProperties
        {
            DefaultBorderRadius = "8px",
            AppbarHeight = "64px",
            DrawerWidthLeft = "240px"
        },
        PaletteLight = new PaletteLight
        {
            Primary = PrimaryColor,
            Secondary = SecondaryColor,
            AppbarBackground = SurfaceColor,
            AppbarText = TextDarkColor,
            Background = BackgroundColor,
            Surface = SurfaceColor,
            DrawerBackground = SurfaceColor,
            DrawerText = "#334155",
            DrawerIcon = TextMutedColor,
            TextPrimary = TextDarkColor,
            TextSecondary = TextMutedColor,
            ActionDefault = TextMutedColor,
            ActionDisabled = "#94A3B8",
            ActionDisabledBackground = "#E2E8F0",
            LinesDefault = BorderColor,
            LinesInputs = "#CBD5E1",
            TableLines = BorderColor,
            TableHover = "#F1F5F9"
        }
    };
}
