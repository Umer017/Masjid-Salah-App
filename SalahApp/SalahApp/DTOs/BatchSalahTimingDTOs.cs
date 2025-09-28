using System.ComponentModel.DataAnnotations;

namespace SalahApp.DTOs
{
    public class BatchCreateSalahTimingDto
    {
        [Required]
        public int MasjidId { get; set; }

        [Required]
        public DateOnly StartDate { get; set; }

        [Required]
        public DateOnly EndDate { get; set; }

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

    public class BatchUpdateSalahTimingDto
    {
        [Required]
        public int MasjidId { get; set; }

        [Required]
        public DateOnly Date { get; set; }

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