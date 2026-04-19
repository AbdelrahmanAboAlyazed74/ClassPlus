namespace ClassPlusBackend.Models;

public class Dispute
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int InitiatorId { get; set; } // User who opened the dispute
    public string Reason { get; set; } // e.g. "NO_SHOW", "LATE", "QUALITY"
    public string Description { get; set; }
    public string Status { get; set; } = "OPEN"; // OPEN, IN_PROGRESS, RESOLVED, CLOSED
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
