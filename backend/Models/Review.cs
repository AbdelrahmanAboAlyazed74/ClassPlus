namespace ClassPlusBackend.Models;

public class Review
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int ReviewerUserId { get; set; } // The user id who wrote the review
    public int TargetUserId { get; set; } // The user id being reviewed
    public int Score { get; set; } // 1 to 5
    public string Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
