using System.ComponentModel.DataAnnotations;

namespace SalahApp.DTOs
{
    // Masjid DTOs
    public class MasjidDto
    {
        public int MasjidId { get; set; }
        public string MasjidName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public int CityId { get; set; }
        public string CityName { get; set; } = string.Empty;
        public string StateName { get; set; } = string.Empty;
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? ContactNumber { get; set; }
        public string? ImamName { get; set; }
    }

    public class CreateMasjidDto
    {
        [Required]
        [StringLength(200)]
        public string MasjidName { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string Address { get; set; } = string.Empty;

        [Required]
        public int CityId { get; set; }

        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }

        [StringLength(20)]
        public string? ContactNumber { get; set; }

        [StringLength(100)]
        public string? ImamName { get; set; }
    }

    public class UpdateMasjidDto
    {
        [StringLength(200)]
        public string? MasjidName { get; set; }

        [StringLength(500)]
        public string? Address { get; set; }

        public int? CityId { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }

        [StringLength(20)]
        public string? ContactNumber { get; set; }

        [StringLength(100)]
        public string? ImamName { get; set; }
    }

    public class MasjidSearchDto
    {
        public int? StateId { get; set; }
        public int? CityId { get; set; }
        public string? Name { get; set; }
        public string? SearchTerm { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public double? RadiusInKm { get; set; }
    }
}