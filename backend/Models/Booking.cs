namespace ClassPlusBackend.Models;

public class Booking
{
    public int Id { get; set; }
    public int SchoolUserId { get; set; }
    public int TeacherUserId { get; set; }
    public string ClassDate { get; set; } // YYYY-MM-DD
    public string ClassTime { get; set; } // HH:MM
    public string ClassEndDate { get; set; } // YYYY-MM-DD
    public string DaysOfWeek { get; set; } // JSON list of days
    public int ExpectedDurationHours { get; set; }
    public string Status { get; set; } = "PENDING"; // PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED, DISPUTED
    public decimal TotalCost { get; set; }
    public string PaymentStatus { get; set; } = "UNPAID"; // UNPAID, PENDING, PAID, REFUNDED
    public string PaymentTrackingId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
