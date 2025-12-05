using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using WebApi.Models;

namespace WebApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DataController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public DataController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    /// <summary>
    /// Obtiene la lista de todas las preguntas registradas, ordenadas alfabéticamente.
    /// </summary>
    [HttpGet("questions")]
    public async Task<IActionResult> GetQuestions()
    {
        using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = "SELECT DISTINCT Id, Text FROM Questions ORDER BY Text";
        var questions = await connection.QueryAsync<QuestionDto>(sql);
        return Ok(questions);
    }

    /// <summary>
    /// Obtiene todas las respuestas asociadas a una pregunta específica, incluyendo categoría y demografía.
    /// </summary>
    [HttpGet("responses/{questionId}")]
    public async Task<IActionResult> GetResponses(int questionId)
    {
        using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));

        var sql = @"
            SELECT r.*, c.Name as CategoryName
            FROM Responses r
            JOIN Categories c ON r.CategoryId = c.Id
            WHERE r.QuestionId = @QuestionId";

        // Ahora usamos ResponseDto explícito en lugar de dynamic
        var responses = await connection.QueryAsync<ResponseDto>(sql, new { QuestionId = questionId });

        return Ok(responses);
    }

    /// <summary>
    /// Elimina una respuesta individual por su ID.
    /// </summary>
    [HttpDelete("responses/{id}")]
    public async Task<IActionResult> DeleteResponse(int id)
    {
        using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = "DELETE FROM Responses WHERE Id = @Id";
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });

        if (rowsAffected == 0) return NotFound("Respuesta no encontrada.");

        return Ok(new { message = "Respuesta eliminada correctamente." });
    }

    /// <summary>
    /// Elimina una pregunta por su ID, borrando primero todas sus respuestas asociadas (en transacción).
    /// </summary>
    [HttpDelete("questions/{id}")]
    public async Task<IActionResult> DeleteQuestion(int id)
    {
        using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        connection.Open();
        using var transaction = connection.BeginTransaction();

        try
        {
            // 1. Eliminar respuestas asociadas primero
            await connection.ExecuteAsync("DELETE FROM Responses WHERE QuestionId = @Id", new { Id = id }, transaction);

            // 2. Eliminar la pregunta
            var rowsAffected = await connection.ExecuteAsync("DELETE FROM Questions WHERE Id = @Id", new { Id = id }, transaction);

            if (rowsAffected == 0)
            {
                transaction.Rollback();
                return NotFound("Pregunta no encontrada.");
            }

            transaction.Commit();
            return Ok(new { message = "Pregunta y sus respuestas eliminadas correctamente." });
        }
        catch (Exception ex)
        {
            transaction.Rollback();
            return StatusCode(500, $"Error al eliminar: {ex.Message}");
        }
    }

    /// <summary>
    /// Obtiene las opciones únicas para poblar los filtros de la gráfica.
    /// </summary>
    [HttpGet("filters")]
    public async Task<ActionResult<FilterOptionsDto>> GetFilterOptions()
    {
        using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var options = new FilterOptionsDto();

        options.Sedes = (await connection.QueryAsync<string>("SELECT DISTINCT Universidad FROM Responses WHERE Universidad IS NOT NULL ORDER BY Universidad")).ToList();
        options.Programas = (await connection.QueryAsync<string>("SELECT DISTINCT Programa FROM Responses WHERE Programa IS NOT NULL ORDER BY Programa")).ToList();
        options.Sexos = (await connection.QueryAsync<string>("SELECT DISTINCT SexoBiologico FROM Responses WHERE SexoBiologico IS NOT NULL ORDER BY SexoBiologico")).ToList();
        options.Orientaciones = (await connection.QueryAsync<string>("SELECT DISTINCT OrientacionSexual FROM Responses WHERE OrientacionSexual IS NOT NULL ORDER BY OrientacionSexual")).ToList();
        options.Etnias = (await connection.QueryAsync<string>("SELECT DISTINCT GrupoEtnico FROM Responses WHERE GrupoEtnico IS NOT NULL ORDER BY GrupoEtnico")).ToList();
        options.Categorias = (await connection.QueryAsync<string>("SELECT Name FROM Categories ORDER BY Name")).ToList();

        return Ok(options);
    }

    /// <summary>
    /// Genera los datos para la gráfica basados en filtros dinámicos.
    /// </summary>
    [HttpPost("chart")]
    public async Task<ActionResult<ChartDataDto>> GetChartData([FromBody] ChartFilterDto filter)
    {
        using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));

        // Construir consulta base
        var sqlBuilder = new System.Text.StringBuilder();
        sqlBuilder.Append(@"
            SELECT
                COUNT(*) as Count,
                CASE
                    WHEN @GroupBy = 'Sede' THEN r.Universidad
                    WHEN @GroupBy = 'Programa' THEN r.Programa
                    WHEN @GroupBy = 'Sexo Biológico' THEN r.SexoBiologico
                    WHEN @GroupBy = 'Orientación Sexual' THEN r.OrientacionSexual
                    WHEN @GroupBy = 'Grupo Étnico' THEN r.GrupoEtnico
                    ELSE c.Name -- Categoría por defecto
                END as GroupKey
            FROM Responses r
            JOIN Categories c ON r.CategoryId = c.Id
            WHERE 1=1 ");

        // Aplicar filtros
        if (filter.Sede != "Todas") sqlBuilder.Append(" AND r.Universidad = @Sede");
        if (filter.Programa != "Todas") sqlBuilder.Append(" AND r.Programa = @Programa");
        if (filter.SexoBiologico != "Todas") sqlBuilder.Append(" AND r.SexoBiologico = @SexoBiologico");
        if (filter.OrientacionSexual != "Todas") sqlBuilder.Append(" AND r.OrientacionSexual = @OrientacionSexual");
        if (filter.GrupoEtnico != "Todas") sqlBuilder.Append(" AND r.GrupoEtnico = @GrupoEtnico");
        if (filter.Categoria != "Todas") sqlBuilder.Append(" AND c.Name = @Categoria");
        if (filter.QuestionId.HasValue) sqlBuilder.Append(" AND r.QuestionId = @QuestionId");

        // Agrupar
        sqlBuilder.Append(@"
            GROUP BY
                CASE
                    WHEN @GroupBy = 'Sede' THEN r.Universidad
                    WHEN @GroupBy = 'Programa' THEN r.Programa
                    WHEN @GroupBy = 'Sexo Biológico' THEN r.SexoBiologico
                    WHEN @GroupBy = 'Orientación Sexual' THEN r.OrientacionSexual
                    WHEN @GroupBy = 'Grupo Étnico' THEN r.GrupoEtnico
                    ELSE c.Name
                END");

        var data = await connection.QueryAsync<(int Count, string GroupKey)>(sqlBuilder.ToString(), new
        {
            filter.Sede,
            filter.Programa,
            filter.SexoBiologico,
            filter.OrientacionSexual,
            filter.GrupoEtnico,
            filter.Categoria,
            filter.QuestionId,
            filter.GroupBy
        });

        var result = new ChartDataDto
        {
            Total = data.Sum(x => x.Count),
            Labels = data.Select(x => x.GroupKey ?? "Sin Dato").ToList(),
            Values = data.Select(x => x.Count).ToList()
        };

        // Construir subtítulo de filtros
        var filtersApplied = new List<string>();
        if (filter.Sede != "Todas") filtersApplied.Add($"Sede={filter.Sede}");
        if (filter.Programa != "Todas") filtersApplied.Add($"Programa={filter.Programa}");
        if (filter.SexoBiologico != "Todas") filtersApplied.Add($"Sexo={filter.SexoBiologico}");
        if (filter.QuestionId.HasValue) filtersApplied.Add("Filtro por Pregunta Activo");

        result.SubTitle = filtersApplied.Any() ? string.Join("; ", filtersApplied) : "Sin filtros adicionales";
        result.Title = $"Distribución por {filter.GroupBy} (Total: {result.Total})";

        return Ok(result);
    }
}
