namespace WebApi.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Identifier { get; set; } = string.Empty;
}

public class LoginDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class Question
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
}

public class Response
{
    public int Id { get; set; }
    public int QuestionId { get; set; }
    public int CategoryId { get; set; }
    public int ImportId { get; set; }
    public string ResponseText { get; set; } = string.Empty;
    public string Universidad { get; set; } = string.Empty;
    public string Programa { get; set; } = string.Empty;
    public string SexoBiologico { get; set; } = string.Empty;
    public string OrientacionSexual { get; set; } = string.Empty;
    public string GrupoEtnico { get; set; } = string.Empty;
}
