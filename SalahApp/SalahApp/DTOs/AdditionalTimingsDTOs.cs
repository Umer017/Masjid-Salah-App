using System.ComponentModel.DataAnnotations;

namespace SalahApp.DTOs
{
    // DailyAdditionalTimings DTOs
    public class DailyAdditionalTimingsDto
    {
        public int AdditionalId { get; set; }
        public int MasjidId { get; set; }
        public string MasjidName { get; set; } = string.Empty;
        public DateOnly Date { get; set; }
        public TimeOnly? SunriseTime { get; set; }
        public TimeOnly? SunsetTime { get; set; }
        public TimeOnly? ZawalTime { get; set; }
        public TimeOnly? TahajjudTime { get; set; }
        public TimeOnly? SehriEndTime { get; set; }
        public TimeOnly? IftarTime { get; set; }
    }

    public class CreateDailyAdditionalTimingsDto
    {
        [Required]
        public int MasjidId { get; set; }

        [Required]
        public DateOnly Date { get; set; }

        public TimeOnly? SunriseTime { get; set; }
        public TimeOnly? SunsetTime { get; set; }
        public TimeOnly? ZawalTime { get; set; }
        public TimeOnly? TahajjudTime { get; set; }
        public TimeOnly? SehriEndTime { get; set; }
        public TimeOnly? IftarTime { get; set; }
    }

    public class UpdateDailyAdditionalTimingsDto
    {
        public int? MasjidId { get; set; }
        public DateOnly? Date { get; set; }
        public TimeOnly? SunriseTime { get; set; }
        public TimeOnly? SunsetTime { get; set; }
        public TimeOnly? ZawalTime { get; set; }
        public TimeOnly? TahajjudTime { get; set; }
        public TimeOnly? SehriEndTime { get; set; }
        public TimeOnly? IftarTime { get; set; }
    }

    // SpecialEvents DTOs
    public class SpecialEventsDto
    {
        public int EventId { get; set; }
        public int MasjidId { get; set; }
        public string MasjidName { get; set; } = string.Empty;
        public string EventName { get; set; } = string.Empty;
        public DateOnly EventDate { get; set; }
        public TimeOnly? EventTime { get; set; }
        public string? Description { get; set; }
    }

    public class CreateSpecialEventsDto
    {
        [Required]
        public int MasjidId { get; set; }

        [Required]
        [StringLength(200)]
        public string EventName { get; set; } = string.Empty;

        [Required]
        public DateOnly EventDate { get; set; }

        public TimeOnly? EventTime { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }
    }

    public class UpdateSpecialEventsDto
    {
        public int? MasjidId { get; set; }

        [StringLength(200)]
        public string? EventName { get; set; }

        public DateOnly? EventDate { get; set; }
        public TimeOnly? EventTime { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }
    }
}