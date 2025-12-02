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

    [HttpGet("questions")]
    public async Task<IActionResult> GetQuestions()
    {
        using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = "SELECT DISTINCT Id, Text FROM Questions ORDER BY Text";
        var questions = await connection.QueryAsync<QuestionDto>(sql);
        return Ok(questions);
    }

    [HttpGet("responses/{questionId}")]
    public async Task<IActionResult> GetResponses(int questionId)
    {
        using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));

        // Return CategoryName too, to allow grouping in Frontend
        var sql = @"
            SELECT r.*, c.Name as CategoryName
            FROM Responses r
            JOIN Categories c ON r.CategoryId = c.Id
            WHERE r.QuestionId = @QuestionId";

        var responses = await connection.QueryAsync<dynamic>(sql, new { QuestionId = questionId });

        // Map dynamic result to Response object with CategoryName (Frontend needs to handle this extra prop if needed, or we map it)
        // For simplicity, we return the list and let frontend group it.
        return Ok(responses);
    }
}
