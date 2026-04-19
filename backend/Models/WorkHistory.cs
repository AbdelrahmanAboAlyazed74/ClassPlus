using System.Text.Json.Serialization;

namespace ClassPlusBackend.Models;

public class WorkHistory
{
    public int Id { get; set; }
    public int TeacherProfileId { get; set; }
    public string SchoolName { get; set; }
    public string Position { get; set; }
    public int StartYear { get; set; }
    public int? EndYear { get; set; }
    public bool IsCurrent { get; set; }

    [JsonIgnore]
    public TeacherProfile TeacherProfile { get; set; }
}
