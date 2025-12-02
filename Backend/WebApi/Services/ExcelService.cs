using Dapper;
using Microsoft.Data.SqlClient;
using OfficeOpenXml;
using WebApi.Models;

namespace WebApi.Services;

public interface IExcelService
{
    Task<List<PreviewResponseDto>> PreviewExcelFileAsync(Stream fileStream);
    Task SaveImportAsync(List<PreviewResponseDto> responses, string fileName);
}

public class ExcelService : IExcelService
{
    private readonly IConfiguration _configuration;

    public ExcelService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<List<PreviewResponseDto>> PreviewExcelFileAsync(Stream fileStream)
    {
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        using var package = new ExcelPackage(fileStream);
        var previewList = new List<PreviewResponseDto>();

        foreach (var worksheet in package.Workbook.Worksheets)
        {
            if (worksheet.Name.Equals("Gráfica", StringComparison.OrdinalIgnoreCase)) continue;

            string categoryName = worksheet.Name;
            string questionText = worksheet.Cells["F1"].Text;

            if (string.IsNullOrWhiteSpace(questionText)) continue;

            int rowCount = worksheet.Dimension?.Rows ?? 0;
            for (int row = 3; row <= rowCount; row++)
            {
                var responseText = worksheet.Cells[row, 6].Text; // F
                if (string.IsNullOrWhiteSpace(responseText)) continue;

                previewList.Add(new PreviewResponseDto
                {
                    QuestionText = questionText,
                    CategoryName = categoryName,
                    ResponseText = responseText,
                    Universidad = worksheet.Cells[row, 1].Text, // A
                    Programa = worksheet.Cells[row, 2].Text,    // B
                    SexoBiologico = worksheet.Cells[row, 3].Text, // C
                    OrientacionSexual = worksheet.Cells[row, 4].Text, // D
                    GrupoEtnico = worksheet.Cells[row, 5].Text    // E
                });
            }
        }
        return await Task.FromResult(previewList);
    }

    public async Task SaveImportAsync(List<PreviewResponseDto> responses, string fileName)
    {
        using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        await connection.OpenAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            // 1. Create Import Record
            var importSql = "INSERT INTO Imports (FileName, ImportDate) OUTPUT INSERTED.Id VALUES (@FileName, GETDATE())";
            int importId = await connection.ExecuteScalarAsync<int>(importSql, new { FileName = fileName }, transaction);

            foreach (var dto in responses)
            {
                // 2. Get/Create Category
                var catId = await GetOrCreateCategoryAsync(connection, transaction, dto.CategoryName);

                // 3. Get/Create Question
                var qId = await GetOrCreateQuestionAsync(connection, transaction, dto.QuestionText);

                // 4. Insert Response
                var insertSql = @"
                    INSERT INTO Responses
                    (QuestionId, CategoryId, ImportId, ResponseText, Universidad, Programa, SexoBiologico, OrientacionSexual, GrupoEtnico)
                    VALUES
                    (@QuestionId, @CategoryId, @ImportId, @ResponseText, @Universidad, @Programa, @SexoBiologico, @OrientacionSexual, @GrupoEtnico)";

                await connection.ExecuteAsync(insertSql, new
                {
                    QuestionId = qId,
                    CategoryId = catId,
                    ImportId = importId,
                    ResponseText = dto.ResponseText,
                    Universidad = dto.Universidad,
                    Programa = dto.Programa,
                    SexoBiologico = dto.SexoBiologico,
                    OrientacionSexual = dto.OrientacionSexual,
                    GrupoEtnico = dto.GrupoEtnico
                }, transaction);
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
        var sql = "SELECT Id FROM Questions WHERE Text = @Text";
        var id = await connection.ExecuteScalarAsync<int?>(sql, new { Text = text }, transaction);
        if (id.HasValue) return id.Value;
        sql = "INSERT INTO Questions (Text) OUTPUT INSERTED.Id VALUES (@Text)";
        return await connection.ExecuteScalarAsync<int>(sql, new { Text = text }, transaction);
    }
}
