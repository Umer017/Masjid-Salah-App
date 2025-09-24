using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SalahApp.Models
{
    public class SalahTiming
    {
        [Key]
        public int SalahId { get; set; }

        [Required]
        [ForeignKey(nameof(Masjid))]
        public int MasjidId { get; set; }

        [Required]
        [Column(TypeName = "date")]
        public DateOnly Date { get; set; }

        [StringLength(50)]
        public string? IslamicDate { get; set; }

        // Fajr Prayer Times
        [Column(TypeName = "time")]
        public TimeOnly? FajrAzanTime { get; set; }

        [Column(TypeName = "time")]
        public TimeOnly? FajrIqamahTime { get; set; }

        // Dhuhr Prayer Times
        [Column(TypeName = "time")]
        public TimeOnly? DhuhrAzanTime { get; set; }

        [Column(TypeName = "time")]
        public TimeOnly? DhuhrIqamahTime { get; set; }

        // Asr Prayer Times
        [Column(TypeName = "time")]
        public TimeOnly? AsrAzanTime { get; set; }

        [Column(TypeName = "time")]
        public TimeOnly? AsrIqamahTime { get; set; }

        // Maghrib Prayer Times
        [Column(TypeName = "time")]
        public TimeOnly? MaghribAzanTime { get; set; }

        [Column(TypeName = "time")]
        public TimeOnly? MaghribIqamahTime { get; set; }

        // Isha Prayer Times
        [Column(TypeName = "time")]
        public TimeOnly? IshaAzanTime { get; set; }

        [Column(TypeName = "time")]
        public TimeOnly? IshaIqamahTime { get; set; }

        // Jummah Prayer Times
        [Column(TypeName = "time")]
        public TimeOnly? JummahAzanTime { get; set; }

        [Column(TypeName = "time")]
        public TimeOnly? JummahIqamahTime { get; set; }

        // Navigation properties
        public virtual Masjid Masjid { get; set; } = null!;
    }
}