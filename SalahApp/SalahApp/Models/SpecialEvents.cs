using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SalahApp.Models
{
    public class SpecialEvents
    {
        [Key]
        public int EventId { get; set; }

        [Required]
        [ForeignKey(nameof(Masjid))]
        public int MasjidId { get; set; }

        [Required]
        [StringLength(200)]
        public string EventName { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "date")]
        public DateOnly EventDate { get; set; }

        [Column(TypeName = "time")]
        public TimeOnly? EventTime { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }

        // Navigation properties
        public virtual Masjid Masjid { get; set; } = null!;
    }
}