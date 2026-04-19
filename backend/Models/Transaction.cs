namespace ClassPlusBackend.Models;

public class Transaction
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public decimal Amount { get; set; }
    public decimal PlatformFee { get; set; }
    public string GatewayId { get; set; } // Paymob/Fawry transaction ID
    public string Status { get; set; } = "PENDING"; // PENDING, SUCCESS, FAILED
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
