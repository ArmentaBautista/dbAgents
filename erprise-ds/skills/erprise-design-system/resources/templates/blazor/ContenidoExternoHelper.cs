namespace Erprise.Host; // Ajustar al namespace del proyecto Host

/// <summary>
/// Resuelve rutas de directorios externos (Manual, WebPage) tanto en desarrollo local
/// como en despliegues publicados (IIS / self-contained).
/// </summary>
public static class ContenidoExternoHelper
{
    public static string? ResolverDirectorio(string? contentRootPath, string nombreCarpeta, string? baseDirectory = null)
    {
        var appBase = baseDirectory ?? AppContext.BaseDirectory;
        var candidatos = new List<string>();

        if (!string.IsNullOrWhiteSpace(contentRootPath))
        {
            candidatos.Add(Path.Combine(contentRootPath, nombreCarpeta));
            candidatos.Add(Path.Combine(contentRootPath, "..", nombreCarpeta));
        }

        if (!string.IsNullOrWhiteSpace(appBase))
        {
            candidatos.Add(Path.Combine(appBase, nombreCarpeta));
            candidatos.Add(Path.Combine(appBase, "..", "..", "..", "..", nombreCarpeta));
            candidatos.Add(Path.Combine(appBase, "..", "..", "..", "..", "..", nombreCarpeta));
        }

        foreach (var candidato in candidatos)
        {
            var rutaNormalizada = Path.GetFullPath(candidato);
            if (Directory.Exists(rutaNormalizada))
            {
                return rutaNormalizada;
            }
        }

        return null;
    }
}
