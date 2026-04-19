using System.Text.Json.Serialization;

namespace ClassPlusBackend.Models;

public class TeacherSubject
{
    public int Id { get; set; }
    public int TeacherProfileId { get; set; }
    public string SubjectName { get; set; }

    [JsonIgnore]
    public TeacherProfile TeacherProfile { get; set; }
}
