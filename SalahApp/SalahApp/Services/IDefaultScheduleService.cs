using SalahApp.DTOs;

namespace SalahApp.Services
{
    public interface IDefaultScheduleService
    {
        Task<ApiResponse<DefaultScheduleDto?>> GetDefaultScheduleByMasjidIdAsync(int masjidId);
        Task<ApiResponse<DefaultScheduleDto>> CreateDefaultScheduleAsync(CreateDefaultScheduleDto createDefaultScheduleDto);
        Task<ApiResponse<DefaultScheduleDto?>> UpdateDefaultScheduleAsync(int scheduleId, UpdateDefaultScheduleDto updateDefaultScheduleDto);
        Task<ApiResponse<bool>> DeleteDefaultScheduleAsync(int scheduleId);
    }
}