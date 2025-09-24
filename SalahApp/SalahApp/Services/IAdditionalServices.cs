using SalahApp.DTOs;

namespace SalahApp.Services
{
    public interface IAdditionalTimingsService
    {
        Task<ApiResponse<PagedResponse<DailyAdditionalTimingsDto>>> GetAdditionalTimingsAsync(PaginationParameters pagination, int? masjidId = null, DateOnly? date = null);
        Task<ApiResponse<DailyAdditionalTimingsDto?>> GetAdditionalTimingByIdAsync(int additionalId);
        Task<ApiResponse<DailyAdditionalTimingsDto?>> GetAdditionalTimingByMasjidAndDateAsync(int masjidId, DateOnly date);
        Task<ApiResponse<List<DailyAdditionalTimingsDto>>> GetAdditionalTimingsByMasjidAsync(int masjidId, DateOnly? startDate = null, DateOnly? endDate = null);
        Task<ApiResponse<DailyAdditionalTimingsDto>> CreateAdditionalTimingAsync(CreateDailyAdditionalTimingsDto createDto);
        Task<ApiResponse<DailyAdditionalTimingsDto?>> UpdateAdditionalTimingAsync(int additionalId, UpdateDailyAdditionalTimingsDto updateDto);
        Task<ApiResponse<bool>> DeleteAdditionalTimingAsync(int additionalId);
    }

    public interface ISpecialEventsService
    {
        Task<ApiResponse<PagedResponse<SpecialEventsDto>>> GetSpecialEventsAsync(PaginationParameters pagination, int? masjidId = null, DateOnly? date = null);
        Task<ApiResponse<SpecialEventsDto?>> GetSpecialEventByIdAsync(int eventId);
        Task<ApiResponse<List<SpecialEventsDto>>> GetSpecialEventsByMasjidAsync(int masjidId, DateOnly? startDate = null, DateOnly? endDate = null);
        Task<ApiResponse<List<SpecialEventsDto>>> GetUpcomingEventsAsync(int? masjidId = null, int daysAhead = 30);
        Task<ApiResponse<SpecialEventsDto>> CreateSpecialEventAsync(CreateSpecialEventsDto createDto);
        Task<ApiResponse<SpecialEventsDto?>> UpdateSpecialEventAsync(int eventId, UpdateSpecialEventsDto updateDto);
        Task<ApiResponse<bool>> DeleteSpecialEventAsync(int eventId);
    }
}