using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.Services;
using WebApi.Models;

namespace WebApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ImportController : ControllerBase
{
    private readonly IExcelService _excelService;

    public ImportController(IExcelService excelService)
    {
        _excelService = excelService;
    }

    /// <summary>
    /// Recibe un archivo Excel, lo procesa y devuelve una vista previa de los datos extraídos en formato JSON.
    /// </summary>
    /// <param name="file">El archivo Excel (.xlsx o .xlsm).</param>
    /// <returns>Lista de objetos de respuesta previsualizados.</returns>
    [HttpPost("preview")]
    public async Task<ActionResult<List<PreviewResponseDto>>> Preview(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("No file uploaded.");
        if (!file.FileName.EndsWith(".xlsm") && !file.FileName.EndsWith(".xlsx")) return BadRequest("Formato inválido.");

        try
        {
            using var stream = file.OpenReadStream();
            var data = await _excelService.PreviewExcelFileAsync(stream);
            return Ok(data);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error: {ex.Message}");
        }
    }

    /// <summary>
    /// Guarda los datos importados confirmados en la base de datos.
    /// </summary>
    /// <param name="request">DTO con la lista de respuestas y el nombre del archivo original.</param>
    [HttpPost("confirm")]
    public async Task<IActionResult> Confirm([FromBody] ConfirmImportDto request)
    {
        if (request.Responses == null || !request.Responses.Any()) return BadRequest("No data to save.");

        try
        {
            await _excelService.SaveImportAsync(request.Responses, request.OriginalFileName);
            return Ok(new { message = "Datos guardados exitosamente." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al guardar: {ex.Message}");
        }
    }
}
