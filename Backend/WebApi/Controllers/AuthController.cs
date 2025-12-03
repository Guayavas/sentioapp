using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using WebApi.Models;
using WebApi.Services;

namespace WebApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Inicia sesión validando usuario y contraseña, retornando un token JWT.
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginDto request)
    {
        var result = await _authService.LoginAsync(request);
        if (result == null)
        {
            return BadRequest("Usuario o contraseña incorrectos.");
        }
        return Ok(result);
    }

    /// <summary>
    /// Obtiene la información del perfil del usuario autenticado actual.
    /// </summary>
    [HttpGet("profile")]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> GetProfile()
    {
        var username = User.Identity?.Name;
        if (string.IsNullOrEmpty(username)) return Unauthorized();

        var profile = await _authService.GetProfileAsync(username);
        if (profile == null) return NotFound();

        return Ok(profile);
    }

    /// <summary>
    /// Actualiza los datos del perfil y opcionalmente la contraseña del usuario.
    /// </summary>
    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile(UpdateProfileDto request)
    {
        var username = User.Identity?.Name;
        if (string.IsNullOrEmpty(username)) return Unauthorized();

        var success = await _authService.UpdateProfileAsync(username, request);
        if (!success) return BadRequest("No se pudo actualizar el perfil. Verifique su contraseña actual.");

        return Ok(new { message = "Perfil actualizado exitosamente." });
    }
}
