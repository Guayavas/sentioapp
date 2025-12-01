using Dapper;
using Microsoft.Data.SqlClient;
using OfficeOpenXml;
using WebApi.Models;

namespace WebApi.Services;

public interface IExcelService
{
    Task ProcessExcelFileAsync(Stream fileStream, string fileName);
}

public class ExcelService : IExcelService
{
    private readonly IConfiguration _configuration;

    public ExcelService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task ProcessExcelFileAsync(Stream fileStream, string fileName)
    {
        // Set License Context for EPPlus
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

        using var package = new ExcelPackage(fileStream);
        using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        await connection.OpenAsync();

        using var transaction = connection.BeginTransaction();

        try
        {
            // 1. Create Import Record
            var importSql = "INSERT INTO Imports (FileName, ImportDate) OUTPUT INSERTED.Id VALUES (@FileName, GETDATE())";
            int importId = await connection.ExecuteScalarAsync<int>(importSql, new { FileName = fileName }, transaction);

            foreach (var worksheet in package.Workbook.Worksheets)
            {
                if (worksheet.Name.Equals("Gráfica", StringComparison.OrdinalIgnoreCase)) continue;

                // 2. Handle Category (Sheet Name)
                var categoryId = await GetOrCreateCategoryAsync(connection, transaction, worksheet.Name);

                // 3. Handle Question (Cell F1)
                var questionText = worksheet.Cells["F1"].Text;
                if (string.IsNullOrWhiteSpace(questionText)) continue; // Skip if no question

                var questionId = await GetOrCreateQuestionAsync(connection, transaction, questionText);

                // 4. Process Rows (Starting from Row 3)
                int rowCount = worksheet.Dimension?.Rows ?? 0;
                var responses = new List<Response>();

                for (int row = 3; row <= rowCount; row++)
                {
                    // Check if row has data (e.g. Response in col F is not empty)
                    var responseText = worksheet.Cells[row, 6].Text; // Column F = 6
                    if (string.IsNullOrWhiteSpace(responseText)) continue;

                    var response = new Response
                    {
                        QuestionId = questionId,
                        CategoryId = categoryId,
                        ImportId = importId,
                        ResponseText = responseText,
                        Universidad = worksheet.Cells[row, 1].Text, // A
                        Programa = worksheet.Cells[row, 2].Text,    // B
                        SexoBiologico = worksheet.Cells[row, 3].Text, // C
                        OrientacionSexual = worksheet.Cells[row, 4].Text, // D
                        GrupoEtnico = worksheet.Cells[row, 5].Text    // E
                    };
                    responses.Add(response);
                }

                if (responses.Any())
                {
                    var insertSql = @"
                        INSERT INTO Responses
                        (QuestionId, CategoryId, ImportId, ResponseText, Universidad, Programa, SexoBiologico, OrientacionSexual, GrupoEtnico)
                        VALUES
                        (@QuestionId, @CategoryId, @ImportId, @ResponseText, @Universidad, @Programa, @SexoBiologico, @OrientacionSexual, @GrupoEtnico)";

                    await connection.ExecuteAsync(insertSql, responses, transaction);
                }
            }

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    private async Task<int> GetOrCreateCategoryAsync(SqlConnection connection, SqlTransaction transaction, string name)
    {
        var sql = "SELECT Id FROM Categories WHERE Name = @Name";
        var id = await connection.ExecuteScalarAsync<int?>(sql, new { Name = name }, transaction);

        if (id.HasValue) return id.Value;

        sql = "INSERT INTO Categories (Name) OUTPUT INSERTED.Id VALUES (@Name)";
        return await connection.ExecuteScalarAsync<int>(sql, new { Name = name }, transaction);
    }

    private async Task<int> GetOrCreateQuestionAsync(SqlConnection connection, SqlTransaction transaction, string text)
    {
        // Simple check: In reality, questions might differ slightly. Here we assume exact match or create new.
        // Given the requirement: "F1 always has the question".
        var sql = "SELECT Id FROM Questions WHERE Text = @Text";
        var id = await connection.ExecuteScalarAsync<int?>(sql, new { Text = text }, transaction);

        if (id.HasValue) return id.Value;

        sql = "INSERT INTO Questions (Text) OUTPUT INSERTED.Id VALUES (@Text)";
        return await connection.ExecuteScalarAsync<int>(sql, new { Text = text }, transaction);
    }
}
