using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClassPlusBackend.Data;
using ClassPlusBackend.Models;
using System.Text.Json;

namespace ClassPlusBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InteractionController : ControllerBase
{
    private readonly AppDbContext _context;

    public InteractionController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("messages/{bookingId}")]
    public async Task<IActionResult> GetMessages(int bookingId)
    {
        var messages = await _context.Messages
            .Where(m => m.BookingId == bookingId)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();
        return Ok(messages);
    }

    [HttpPost("messages")]
    public async Task<IActionResult> SendMessage([FromBody] Message message)
    {
        message.CreatedAt = DateTime.UtcNow;
        _context.Messages.Add(message);
        await _context.SaveChangesAsync();
        return Ok(message);
    }

    [HttpPost("reviews")]
    public async Task<IActionResult> AddReview([FromBody] Review review)
    {
        review.CreatedAt = DateTime.UtcNow;
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
        
        // Update teacher or school rating if needed (omitted for brevity in MVP)
        return Ok(review);
    }
}
