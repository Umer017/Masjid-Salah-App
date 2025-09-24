using System.ComponentModel.DataAnnotations;

namespace SalahApp.DTOs
{
    public class DefaultScheduleDto
    {
        public int ScheduleId { get; set; }
        public int MasjidId { get; set; }
        public string MasjidName { get; set; } = string.Empty;
        
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
        
        public DateTime LastUpdated { get; set; }
    }

    public class CreateDefaultScheduleDto
    {
        [Required]
        public int MasjidId { get; set; }

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

    public class UpdateDefaultScheduleDto
    {
        public int? MasjidId { get; set; }

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