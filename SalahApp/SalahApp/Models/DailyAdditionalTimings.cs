using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SalahApp.Models
{
    public class DailyAdditionalTimings
    {
        [Key]
        public int AdditionalId { get; set; }

        [Required]
        [ForeignKey(nameof(Masjid))]
        public int MasjidId { get; set; }

        [Required]
        [Column(TypeName = "date")]
        public DateOnly Date { get; set; }

        [Column(TypeName = "time")]
        public TimeOnly? SunriseTime { get; set; }

        [Column(TypeName = "time")]
        public TimeOnly? SunsetTime { get; set; }

        [Column(TypeName = "time")]
        public TimeOnly? ZawalTime { get; set; }

        [Column(TypeName = "time")]
        public TimeOnly? TahajjudTime { get; set; }

        [Column(TypeName = "time")]
        public TimeOnly? SehriEndTime { get; set; }

        [Column(TypeName = "time")]
        public TimeOnly? IftarTime { get; set; }

        // Navigation properties
        public virtual Masjid Masjid { get; set; } = null!;
    }
}