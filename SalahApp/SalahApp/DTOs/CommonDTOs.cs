namespace SalahApp.DTOs
{
    // Common response DTOs
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new();
    }

    public class PagedResponse<T>
    {
        public List<T> Data { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;
    }

    public class PaginationParameters
    {
        private const int MaxPageSize = 50;
        private int _pageSize = 10;

        public int PageNumber { get; set; } = 1;

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
        }
    }

    // Combined DTOs for comprehensive data
    public class MasjidWithTimingsDto : MasjidDto
    {
        public List<SalahTimingDto> SalahTimings { get; set; } = new();
        public List<DailyAdditionalTimingsDto> AdditionalTimings { get; set; } = new();
        public List<SpecialEventsDto> SpecialEvents { get; set; } = new();
    }

    public class DailyScheduleDto
    {
        public DateOnly Date { get; set; }
        public string? IslamicDate { get; set; }
        public MasjidDto Masjid { get; set; } = new();
        public SalahTimingDto? SalahTiming { get; set; }
        public DailyAdditionalTimingsDto? AdditionalTimings { get; set; }
        public List<SpecialEventsDto> SpecialEvents { get; set; } = new();
    }
}