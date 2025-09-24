using SalahApp.DTOs;

namespace SalahApp.Services
{
    public interface ISalahTimingService
    {
        Task<ApiResponse<PagedResponse<SalahTimingDto>>> GetSalahTimingsAsync(PaginationParameters pagination, int? masjidId = null, DateOnly? date = null);
        Task<ApiResponse<SalahTimingDto?>> GetSalahTimingByIdAsync(int salahId);
        Task<ApiResponse<SalahTimingDto?>> GetSalahTimingByMasjidAndDateAsync(int masjidId, DateOnly date);
        Task<ApiResponse<List<SalahTimingDto>>> GetSalahTimingsByMasjidAsync(int masjidId, DateOnly? startDate = null, DateOnly? endDate = null);
        Task<ApiResponse<List<SalahTimingDto>>> GetSalahTimingsByDateRangeAsync(DateOnly startDate, DateOnly endDate, int? masjidId = null);
        Task<ApiResponse<SalahTimingDto>> CreateSalahTimingAsync(CreateSalahTimingDto createSalahTimingDto);
        Task<ApiResponse<SalahTimingDto?>> UpdateSalahTimingAsync(int salahId, UpdateSalahTimingDto updateSalahTimingDto);
        Task<ApiResponse<bool>> DeleteSalahTimingAsync(int salahId);
        Task<ApiResponse<DailyScheduleDto?>> GetDailyScheduleAsync(int masjidId, DateOnly date);
    }
}