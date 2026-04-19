using ClassPlusBackend.Data;
using ClassPlusBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClassPlusBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingController : ControllerBase
{
    private readonly AppDbContext _context;

    public BookingController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetBookings([FromQuery] int userId, [FromQuery] string role)
    {
        var query = _context.Bookings.AsQueryable();

        if (role == "TEACHER")
        {
            query = query.Where(b => b.TeacherUserId == userId);
        }
        else if (role == "SCHOOL")
        {
            query = query.Where(b => b.SchoolUserId == userId);
        }
        else
        {
            return BadRequest(new { message = "Invalid role" });
        }

        var bookings = await query.ToListAsync();

        var result = bookings.Select(b => new
        {
            id = b.Id,
            schoolId = b.SchoolUserId,
            teacherId = b.TeacherUserId,
            classDate = b.ClassDate,
            classTime = b.ClassTime,
            expectedDurationHours = b.ExpectedDurationHours,
            status = b.Status,
            totalCost = b.TotalCost,
            teacherName = _context.Users.FirstOrDefault(u => u.Id == b.TeacherUserId)?.FullName,
            schoolName = _context.Users.FirstOrDefault(u => u.Id == b.SchoolUserId)?.FullName
        }).ToList();

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] Booking booking)
    {
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();
        return Ok(new { message = "تم إنشاء الحجز بنجاح", booking });
    }

    [HttpPost("match")]
    public async Task<IActionResult> MatchTeachers([FromBody] MatchRequestDto req)
    {
        // Simple mock mapping for subject names
        var allTeachers = await _context.TeacherProfiles
            .Include(tp => tp.User)
            .Include(tp => tp.Subjects)
            .Where(tp => tp.IsVerified && tp.Latitude.HasValue && tp.Longitude.HasValue)
            .ToListAsync();

        var matched = allTeachers.Select(t => new {
            id = t.UserId,
            name = t.User?.FullName ?? "Unknown",
            subjects = t.Subjects.Select(s => s.SubjectName).ToList(),
            distance_km = Math.Round(CalculateDistance(req.school_lat, req.school_lng, t.Latitude.Value, t.Longitude.Value), 2),
            match_score = 0.90, // mock score for now
            hourlyRate = t.HourlyRate,
            rating = (int)Math.Round(t.Rating),
            phone = t.PhoneNumber
        })
        .Where(t => t.distance_km <= 25.0) // within 25km
        .OrderBy(t => t.distance_km)
        .ToList();

        return Ok(matched);
    }

    private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var R = 6371; // Radius of the earth in km
        var dLat = Deg2Rad(lat2 - lat1);
        var dLon = Deg2Rad(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(Deg2Rad(lat1)) * Math.Cos(Deg2Rad(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c; // Distance in km
    }

    private double Deg2Rad(double deg)
    {
        return deg * (Math.PI / 180);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null) return NotFound();

        booking.Status = dto.Status;
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "تم تحديث الحالة بنجاح" });
    }
}

public class UpdateStatusDto
{
    public string Status { get; set; }
}

public class MatchRequestDto
{
    public string school_id { get; set; }
    public double school_lat { get; set; }
    public double school_lng { get; set; }
    public string subject_needed { get; set; }
    public string curriculum_needed { get; set; }
    public string grade_level { get; set; }
    public double duration_hours { get; set; }
}

