using System.ComponentModel.DataAnnotations;

namespace SalahApp.DTOs
{
    // State DTOs
    public class StateDto
    {
        public int StateId { get; set; }
        public string StateName { get; set; } = string.Empty;
        public List<CityDto> Cities { get; set; } = new();
    }

    public class CreateStateDto
    {
        [Required]
        [StringLength(100)]
        public string StateName { get; set; } = string.Empty;
    }

    public class UpdateStateDto
    {
        [StringLength(100)]
        public string? StateName { get; set; }
    }

    // City DTOs
    public class CityDto
    {
        public int CityId { get; set; }
        public string CityName { get; set; } = string.Empty;
        public int StateId { get; set; }
        public string StateName { get; set; } = string.Empty;
        public List<MasjidDto> Masjids { get; set; } = new();
    }

    public class CreateCityDto
    {
        [Required]
        [StringLength(100)]
        public string CityName { get; set; } = string.Empty;

        [Required]
        public int StateId { get; set; }
    }

    public class UpdateCityDto
    {
        [StringLength(100)]
        public string? CityName { get; set; }

        public int? StateId { get; set; }
    }
}