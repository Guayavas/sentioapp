using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.Services;

namespace WebApi.Controllers;

[Route("api/[controller]")]
[ApiController]
// [Authorize] // Uncomment to protect this endpoint
public class ImportController : ControllerBase
{
    private readonly IExcelService _excelService;

    public ImportController(IExcelService excelService)
    {
        _excelService = excelService;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        if (!file.FileName.EndsWith(".xlsm") && !file.FileName.EndsWith(".xlsx"))
             return BadRequest("Formato de archivo inválido. Debe ser .xlsm o .xlsx");

        try
        {
            using var stream = file.OpenReadStream();
            await _excelService.ProcessExcelFileAsync(stream, file.FileName);
            return Ok(new { message = "Archivo importado exitosamente." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error interno: {ex.Message}");
        }
    }
}
