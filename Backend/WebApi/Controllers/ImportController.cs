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
