using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SalahApp.Models
{
    public class City
    {
        [Key]
        public int CityId { get; set; }

        [Required]
        [StringLength(100)]
        public string CityName { get; set; } = string.Empty;

        [Required]
        [ForeignKey(nameof(State))]
        public int StateId { get; set; }

        // Navigation properties
        public virtual State State { get; set; } = null!;
        public virtual ICollection<Masjid> Masjids { get; set; } = new List<Masjid>();
    }
}