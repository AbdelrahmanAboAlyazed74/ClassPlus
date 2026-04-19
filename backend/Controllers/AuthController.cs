using ClassPlusBackend.Data;
using ClassPlusBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClassPlusBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
        {
            return BadRequest(new { message = "البريد الإلكتروني موجود مسبقاً!" });
        }

        if (await _context.Users.AnyAsync(u => u.NationalId == dto.NationalId))
        {
            return BadRequest(new { message = "الرقم القومي موجود مسبقاً!" });
        }

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            NationalId = dto.NationalId,
            Password = dto.Password,
            Role = dto.Role
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        if (user.Role == "TEACHER")
        {
            var teacherProfile = new TeacherProfile { 
                UserId = user.Id, 
                PhoneNumber = "", Gender = "", Bio = "", Major = "", University = "", 
                EducationLevel = "", CvUrl = "", ProfilePictureUrl = "", LocationCity = "", 
                LocationArea = "", AvailableDays = "[]", AvailableFrom = "", AvailableTo = "" 
            };
            _context.TeacherProfiles.Add(teacherProfile);
            await _context.SaveChangesAsync();
        }
        else if (user.Role == "SCHOOL")
        {
            var schoolProfile = new SchoolProfile { 
                UserId = user.Id,
                SchoolName = dto.FullName,
                SchoolType = dto.SchoolType ?? "PRIVATE",
                EducationalStages = dto.EducationalStages ?? "[]",
                Description = dto.Description ?? "",
                RequiredSubjects = dto.RequiredSubjects ?? "[]",
                CurriculaFiles = dto.CurriculaFiles ?? "[]",
                LocationCity = "", LocationArea = "", 
                Phone = "", Website = "", LogoUrl = ""
            };
            _context.SchoolProfiles.Add(schoolProfile);
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "تم تسجيل الحساب بنجاح!", user });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

        if (user != null && user.Password == loginDto.Password)
        {
            return Ok(new { message = "تم تسجيل الدخول بنجاح!", user });
        }

        return Unauthorized(new { message = "البريد الإلكتروني أو كلمة المرور خاطئة!" });
    }
}

public class LoginDto
{
    public string Email { get; set; }
    public string Password { get; set; }
}

public class RegisterDto
{
    public string FullName { get; set; }
    public string Email { get; set; }
    public string NationalId { get; set; }
    public string Password { get; set; }
    public string Role { get; set; }

    // School extended fields payload
    public string SchoolType { get; set; }
    public string EducationalStages { get; set; }
    public string Description { get; set; }
    public string RequiredSubjects { get; set; }
    public string CurriculaFiles { get; set; }
}
