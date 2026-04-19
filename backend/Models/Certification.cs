using System.Text.Json.Serialization;

namespace ClassPlusBackend.Models;

public class Certification
{
    public int Id { get; set; }
    public int TeacherProfileId { get; set; }
    public string Name { get; set; }
    public string Issuer { get; set; }
    public int Year { get; set; }
    public string FileUrl { get; set; }

    [JsonIgnore]
    public TeacherProfile TeacherProfile { get; set; }
}
