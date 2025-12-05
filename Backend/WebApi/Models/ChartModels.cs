namespace WebApi.Models;

/// <summary>
/// DTO con los filtros seleccionados por el usuario para generar la gráfica.
/// </summary>
public class ChartFilterDto
{
    public string Sede { get; set; } = "Todas";
    public string Programa { get; set; } = "Todas";
    public string SexoBiologico { get; set; } = "Todas";
    public string OrientacionSexual { get; set; } = "Todas";
    public string GrupoEtnico { get; set; } = "Todas";
    public string Categoria { get; set; } = "Todas";
    public int? QuestionId { get; set; } // Nullable para permitir todas las preguntas
    public string GroupBy { get; set; } = "Categoría"; // Por defecto
    public string ChartType { get; set; } = "Barras";
}

/// <summary>
/// DTO con los datos procesados listos para ser renderizados en Chart.js.
/// </summary>
public class ChartDataDto
{
    public List<string> Labels { get; set; } = new();
    public List<int> Values { get; set; } = new();
    public string Title { get; set; } = string.Empty;
    public string SubTitle { get; set; } = string.Empty;
    public int Total { get; set; }
}

/// <summary>
/// DTO con las listas de opciones disponibles para poblar los filtros del frontend.
/// </summary>
public class FilterOptionsDto
{
    public List<string> Sedes { get; set; } = new();
    public List<string> Programas { get; set; } = new();
    public List<string> Sexos { get; set; } = new();
    public List<string> Orientaciones { get; set; } = new();
    public List<string> Etnias { get; set; } = new();
    public List<string> Categorias { get; set; } = new();
}
