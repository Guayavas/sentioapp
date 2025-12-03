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

        var sql = @"
            SELECT r.*, c.Name as CategoryName
            FROM Responses r
            JOIN Categories c ON r.CategoryId = c.Id
            WHERE r.QuestionId = @QuestionId";

        // Now using explicit ResponseDto instead of dynamic
        var responses = await connection.QueryAsync<ResponseDto>(sql, new { QuestionId = questionId });

        return Ok(responses);
    }

    [HttpDelete("responses/{id}")]
    public async Task<IActionResult> DeleteResponse(int id)
    {
        using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = "DELETE FROM Responses WHERE Id = @Id";
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });

        if (rowsAffected == 0) return NotFound("Respuesta no encontrada.");

        return Ok(new { message = "Respuesta eliminada correctamente." });
    }

    [HttpDelete("questions/{id}")]
    public async Task<IActionResult> DeleteQuestion(int id)
    {
        using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        connection.Open();
        using var transaction = connection.BeginTransaction();

        try
        {
            // 1. Delete associated responses first
            await connection.ExecuteAsync("DELETE FROM Responses WHERE QuestionId = @Id", new { Id = id }, transaction);

            // 2. Delete the question
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
}
