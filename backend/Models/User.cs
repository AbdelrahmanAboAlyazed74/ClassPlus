namespace ClassPlusBackend.Models;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string NationalId { get; set; }
    public string Password { get; set; }
    public string Role { get; set; } // "TEACHER" or "SCHOOL"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
