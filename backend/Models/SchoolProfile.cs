using System.Text.Json.Serialization;

namespace ClassPlusBackend.Models;

public class SchoolProfile
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string SchoolName { get; set; }
    public string SchoolType { get; set; } // PRIVATE, INTERNATIONAL, GOVERNMENT
    public string LocationCity { get; set; }
    public string LocationArea { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public decimal Rating { get; set; } = 0;
    public string Phone { get; set; }
    public string Website { get; set; }
    public string LogoUrl { get; set; }
    public string Description { get; set; }
    public string RequiredSubjects { get; set; } = "[]"; // JSON list
    public string EducationalStages { get; set; } = "[]"; // JSON list
    public string CurriculaFiles { get; set; } = "[]"; // JSON grid of subjects and pdf URLs
    public int? StudentCount { get; set; }

    [JsonIgnore]
    public User User { get; set; }
}
