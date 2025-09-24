using SalahApp.DTOs;

namespace SalahApp.Services
{
    public interface IMasjidService
    {
        Task<ApiResponse<PagedResponse<MasjidDto>>> GetMasjidsAsync(PaginationParameters pagination, MasjidSearchDto? searchDto = null);
        Task<ApiResponse<MasjidDto?>> GetMasjidByIdAsync(int masjidId);
        Task<ApiResponse<MasjidWithTimingsDto?>> GetMasjidWithTimingsAsync(int masjidId, DateOnly? date = null);
        Task<ApiResponse<List<MasjidDto>>> GetMasjidsByCityAsync(int cityId);
        Task<ApiResponse<List<MasjidDto>>> GetNearbyMasjidsAsync(decimal latitude, decimal longitude, double radiusInKm = 5.0);
        Task<ApiResponse<MasjidDto>> CreateMasjidAsync(CreateMasjidDto createMasjidDto);
        Task<ApiResponse<MasjidDto?>> UpdateMasjidAsync(int masjidId, UpdateMasjidDto updateMasjidDto);
        Task<ApiResponse<bool>> DeleteMasjidAsync(int masjidId);
    }
}