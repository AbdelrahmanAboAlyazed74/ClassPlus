using System.Text.Json.Serialization;

namespace ClassPlusBackend.Models;

public class TeacherProfile
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string PhoneNumber { get; set; }
    public string Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string Bio { get; set; }
    public string Major { get; set; }
    public string University { get; set; }
    public int? GraduationYear { get; set; }
    public string EducationLevel { get; set; } // BACHELOR, MASTER, PHD
    public string CvUrl { get; set; }
    public string ProfilePictureUrl { get; set; }
    public string LocationCity { get; set; }
    public string LocationArea { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string AvailableDays { get; set; } // JSON string array of days
    public string AvailableFrom { get; set; } // HH:MM
    public string AvailableTo { get; set; } // HH:MM
    public string PayoutMethod { get; set; } = ""; // Instapay, Bank, Fawry
    public string PayoutDetails { get; set; } = ""; // Target account/number
    public decimal HourlyRate { get; set; }
    public bool IsVerified { get; set; } = false;
    public int ProfileStrength { get; set; } = 0;
    public decimal Rating { get; set; } = 0;
    public int YearsOfExperience { get; set; } = 0;

    [JsonIgnore]
    public User User { get; set; }
    public List<WorkHistory> WorkHistories { get; set; } = new();
    public List<Certification> Certifications { get; set; } = new();
    public List<TeacherSubject> Subjects { get; set; } = new();
}
