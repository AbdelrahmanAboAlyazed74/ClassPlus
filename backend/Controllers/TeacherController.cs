using ClassPlusBackend.Data;
using ClassPlusBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClassPlusBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeacherController : ControllerBase
{
    private readonly AppDbContext _context;

    public TeacherController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTeachers([FromQuery] string subject = null, [FromQuery] string city = null)
    {
        var query = _context.TeacherProfiles
            .Include(t => t.User)
            .Include(t => t.Subjects)
            .AsQueryable();

        if (!string.IsNullOrEmpty(city))
        {
            query = query.Where(t => t.LocationCity == city);
        }

        if (!string.IsNullOrEmpty(subject) && subject != "الكل")
        {
            query = query.Where(t => t.Subjects.Any(s => s.SubjectName == subject));
        }

        var teachers = await query.Select(t => new
        {
            id = t.User.Id,
            name = t.User.FullName,
            specialty = t.Subjects.FirstOrDefault().SubjectName ?? "عام",
            hourlyRate = t.HourlyRate > 0 ? t.HourlyRate : 150,
            rating = (int)Math.Round(t.Rating > 0 ? t.Rating : 4.5m),
            experience = t.YearsOfExperience,
            bio = string.IsNullOrEmpty(t.Bio) ? "معلم متخصص ومتميز في مجاله." : t.Bio,
            avatar = string.IsNullOrEmpty(t.ProfilePictureUrl) ? $"https://ui-avatars.com/api/?name={t.User.FullName}&background=random&color=fff" : t.ProfilePictureUrl,
            isVerified = t.IsVerified
        }).ToListAsync();

        return Ok(teachers);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTeacherById(int id)
    {
        var teacher = await _context.TeacherProfiles
            .Include(t => t.User)
            .Include(t => t.Subjects)
            .Include(t => t.WorkHistories)
            .Include(t => t.Certifications)
            .FirstOrDefaultAsync(t => t.UserId == id);

        if (teacher == null)
        {
            return NotFound(new { message = "Teacher not found" });
        }

        return Ok(new
        {
            id = teacher.User.Id,
            name = teacher.User.FullName,
            specialty = teacher.Subjects.FirstOrDefault()?.SubjectName ?? "عام",
            hourlyRate = teacher.HourlyRate > 0 ? teacher.HourlyRate : 150,
            rating = (int)Math.Round(teacher.Rating > 0 ? teacher.Rating : 4.5m),
            experience = teacher.YearsOfExperience,
            city = teacher.LocationCity ?? "القاهرة",
            bio = string.IsNullOrEmpty(teacher.Bio) ? "معلم متخصص ومتميز في مجاله." : teacher.Bio,
            avatar = string.IsNullOrEmpty(teacher.ProfilePictureUrl) ? $"https://ui-avatars.com/api/?name={teacher.User.FullName}&background=random&color=fff" : teacher.ProfilePictureUrl,
            isVerified = teacher.IsVerified,
            education = string.IsNullOrEmpty(teacher.Major) ? "غير محدد" : $"{teacher.EducationLevel} في {teacher.Major} - {teacher.University} ({teacher.GraduationYear})",
            certifications = teacher.Certifications.Select(c => c.Name).ToList(),
            workHistory = teacher.WorkHistories.Select(w => new {
                schoolName = w.SchoolName,
                position = w.Position,
                startYear = w.StartYear,
                endYear = w.IsCurrent ? "الآن" : w.EndYear?.ToString(),
                isCurrent = w.IsCurrent
            }).ToList(),
            availableDays = string.IsNullOrEmpty(teacher.AvailableDays) ? new List<string> { "الأحد", "الخميس" } : System.Text.Json.JsonSerializer.Deserialize<List<string>>(teacher.AvailableDays),
            availableFrom = teacher.AvailableFrom ?? "09:00",
            availableTo = teacher.AvailableTo ?? "16:00"
        });
    }
}
