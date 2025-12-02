namespace WebApi.Models;

public class PreviewResponseDto
{
    public string QuestionText { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string ResponseText { get; set; } = string.Empty;
    public string Universidad { get; set; } = string.Empty;
    public string Programa { get; set; } = string.Empty;
    public string SexoBiologico { get; set; } = string.Empty;
    public string OrientacionSexual { get; set; } = string.Empty;
    public string GrupoEtnico { get; set; } = string.Empty;
}

public class ConfirmImportDto
{
    public List<PreviewResponseDto> Responses { get; set; } = new();
    public string OriginalFileName { get; set; } = string.Empty;
}

public class QuestionDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
}
