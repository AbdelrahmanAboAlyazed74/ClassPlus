using Microsoft.EntityFrameworkCore;
using ClassPlusBackend.Models;

namespace ClassPlusBackend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<TeacherProfile> TeacherProfiles { get; set; }
    public DbSet<WorkHistory> WorkHistories { get; set; }
    public DbSet<Certification> Certifications { get; set; }
    public DbSet<TeacherSubject> TeacherSubjects { get; set; }
    public DbSet<SchoolProfile> SchoolProfiles { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Dispute> Disputes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}
