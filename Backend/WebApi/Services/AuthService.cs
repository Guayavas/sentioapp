using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using WebApi.Models;

namespace WebApi.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginDto request);
    Task<UserProfileDto?> GetProfileAsync(string username);
    Task<bool> UpdateProfileAsync(string username, UpdateProfileDto request);
}

public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;

    public AuthService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginDto request)
    {
        using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var user = await connection.QueryFirstOrDefaultAsync<User>(
            "SELECT * FROM Users WHERE Username = @Username", new { request.Username });

        if (user == null) return null;

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return null;
        }

        string token = CreateToken(user);

        return new LoginResponseDto
        {
            Token = token,
            Username = user.Username,
            Role = user.Role
        };
    }

    public async Task<UserProfileDto?> GetProfileAsync(string username)
    {
        using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var user = await connection.QueryFirstOrDefaultAsync<User>(
            "SELECT * FROM Users WHERE Username = @Username", new { Username = username });

        if (user == null) return null;

        return new UserProfileDto
        {
            Username = user.Username,
            FullName = user.FullName,
            Identifier = user.Identifier,
            Role = user.Role
        };
    }

    public async Task<bool> UpdateProfileAsync(string username, UpdateProfileDto request)
    {
        using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var user = await connection.QueryFirstOrDefaultAsync<User>(
            "SELECT * FROM Users WHERE Username = @Username", new { Username = username });

        if (user == null) return false;

        // If password change is requested
        if (!string.IsNullOrEmpty(request.NewPassword))
        {
            if (string.IsNullOrEmpty(request.CurrentPassword)) return false; // Must provide current
            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash)) return false; // Wrong current

            string newHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await connection.ExecuteAsync(
                "UPDATE Users SET PasswordHash = @Hash WHERE Id = @Id",
                new { Hash = newHash, Id = user.Id });
        }

        // Update other fields
        await connection.ExecuteAsync(
            "UPDATE Users SET FullName = @FullName, Identifier = @Identifier WHERE Id = @Id",
            new { request.FullName, request.Identifier, Id = user.Id });

        return true;
    }

    private string CreateToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("Id", user.Id.ToString())
        };

        // Use a default key if not configured (DEV ONLY)
        var keyVal = _configuration.GetSection("AppSettings:Token").Value ?? "super_secret_key_for_development_mode_only_12345";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyVal));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.Now.AddDays(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
