using System.ComponentModel.DataAnnotations;

namespace SalahApp.DTOs
{
    // SalahTiming DTOs
    public class SalahTimingDto
    {
        public int SalahId { get; set; }
        public int MasjidId { get; set; }
        public string MasjidName { get; set; } = string.Empty;
        public DateOnly Date { get; set; }
        public string? IslamicDate { get; set; }
        
        public TimeOnly? FajrAzanTime { get; set; }
        public TimeOnly? FajrIqamahTime { get; set; }
        
        public TimeOnly? DhuhrAzanTime { get; set; }
        public TimeOnly? DhuhrIqamahTime { get; set; }
        
        public TimeOnly? AsrAzanTime { get; set; }
        public TimeOnly? AsrIqamahTime { get; set; }
        
        public TimeOnly? MaghribAzanTime { get; set; }
        public TimeOnly? MaghribIqamahTime { get; set; }
        
        public TimeOnly? IshaAzanTime { get; set; }
        public TimeOnly? IshaIqamahTime { get; set; }
        
        public TimeOnly? JummahAzanTime { get; set; }
        public TimeOnly? JummahIqamahTime { get; set; }
        
        // Added properties for source tracking
        public bool IsDefault { get; set; }
        public bool IsFallback { get; set; }
    }

    public class CreateSalahTimingDto
    {
        [Required]
        public int MasjidId { get; set; }

        [Required]
        public DateOnly Date { get; set; }

        [StringLength(50)]
        public string? IslamicDate { get; set; }

        public TimeOnly? FajrAzanTime { get; set; }
        public TimeOnly? FajrIqamahTime { get; set; }
        
        public TimeOnly? DhuhrAzanTime { get; set; }
        public TimeOnly? DhuhrIqamahTime { get; set; }
        
        public TimeOnly? AsrAzanTime { get; set; }
        public TimeOnly? AsrIqamahTime { get; set; }
        
        public TimeOnly? MaghribAzanTime { get; set; }
        public TimeOnly? MaghribIqamahTime { get; set; }
        
        public TimeOnly? IshaAzanTime { get; set; }
        public TimeOnly? IshaIqamahTime { get; set; }
        
        public TimeOnly? JummahAzanTime { get; set; }
        public TimeOnly? JummahIqamahTime { get; set; }
    }

    public class UpdateSalahTimingDto
    {
        public int? MasjidId { get; set; }
        public DateOnly? Date { get; set; }

        [StringLength(50)]
        public string? IslamicDate { get; set; }

        public TimeOnly? FajrAzanTime { get; set; }
        public TimeOnly? FajrIqamahTime { get; set; }
        
        public TimeOnly? DhuhrAzanTime { get; set; }
        public TimeOnly? DhuhrIqamahTime { get; set; }
        
        public TimeOnly? AsrAzanTime { get; set; }
        public TimeOnly? AsrIqamahTime { get; set; }
        
        public TimeOnly? MaghribAzanTime { get; set; }
        public TimeOnly? MaghribIqamahTime { get; set; }
        
        public TimeOnly? IshaAzanTime { get; set; }
        public TimeOnly? IshaIqamahTime { get; set; }
        
        public TimeOnly? JummahAzanTime { get; set; }
        public TimeOnly? JummahIqamahTime { get; set; }
    }
}