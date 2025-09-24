using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SalahApp.Models
{
    public class State
    {
        [Key]
        public int StateId { get; set; }

        [Required]
        [StringLength(100)]
        public string StateName { get; set; } = string.Empty;

        // Navigation properties
        public virtual ICollection<City> Cities { get; set; } = new List<City>();
    }
}