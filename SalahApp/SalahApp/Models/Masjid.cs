using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SalahApp.Models
{
    public class Masjid
    {
        [Key]
        public int MasjidId { get; set; }

        [Required]
        [StringLength(200)]
        public string MasjidName { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string Address { get; set; } = string.Empty;

        [Required]
        [ForeignKey(nameof(City))]
        public int CityId { get; set; }

        [Column(TypeName = "decimal(10,8)")]
        public decimal? Latitude { get; set; }

        [Column(TypeName = "decimal(11,8)")]
        public decimal? Longitude { get; set; }

        [StringLength(20)]
        public string? ContactNumber { get; set; }

        [StringLength(100)]
        public string? ImamName { get; set; }

        // Navigation properties
        public virtual City City { get; set; } = null!;
        public virtual ICollection<SalahTiming> SalahTimings { get; set; } = new List<SalahTiming>();
        public virtual ICollection<DailyAdditionalTimings> DailyAdditionalTimings { get; set; } = new List<DailyAdditionalTimings>();
        public virtual ICollection<SpecialEvents> SpecialEvents { get; set; } = new List<SpecialEvents>();
        
        // Default schedule for this masjid
        public virtual DefaultSchedule? DefaultSchedule { get; set; }
    }
}