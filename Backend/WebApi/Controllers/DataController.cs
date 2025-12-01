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

    [HttpGet("hierarchy")]
    public async Task<IActionResult> GetHierarchy()
    {
        using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));

        // This query fetches Categories and their associated questions based on existing Responses
        // This ensures we only show Questions that actually have data for that Category
        var sql = @"
            SELECT DISTINCT c.Id as CategoryId, c.Name as CategoryName, q.Id as QuestionId, q.Text as QuestionText
            FROM Responses r
            JOIN Categories c ON r.CategoryId = c.Id
            JOIN Questions q ON r.QuestionId = q.Id
            ORDER BY c.Name, q.Text";

        var data = await connection.QueryAsync(sql);

        // Group by Category to form a tree
        var hierarchy = data.GroupBy(d => new { d.CategoryId, d.CategoryName })
                            .Select(g => new
                            {
                                key = g.Key.CategoryId.ToString(),
                                label = g.Key.CategoryName,
                                children = g.Select(x => new
                                {
                                    key = $"{g.Key.CategoryId}-{x.QuestionId}",
                                    label = x.QuestionText,
                                    data = x.QuestionId
                                }).Distinct().ToList()
                            });

        return Ok(hierarchy);
    }

    [HttpGet("responses/{questionId}")]
    public async Task<IActionResult> GetResponses(int questionId, [FromQuery] int? categoryId)
    {
        using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = "SELECT * FROM Responses WHERE QuestionId = @QuestionId";

        if (categoryId.HasValue)
        {
            sql += " AND CategoryId = @CategoryId";
        }

        var responses = await connection.QueryAsync<Response>(sql, new { QuestionId = questionId, CategoryId = categoryId });
        return Ok(responses);
    }
}
