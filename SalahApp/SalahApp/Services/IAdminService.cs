using SalahApp.DTOs;

namespace SalahApp.Services
{
    public interface IAdminService
    {
        Task<ApiResponse<PagedResponse<AdminDto>>> GetAdminsAsync(PaginationParameters pagination);
        Task<ApiResponse<AdminDto?>> GetAdminByIdAsync(int adminId);
        Task<ApiResponse<AdminDto?>> GetAdminByUsernameAsync(string username);
        Task<ApiResponse<AdminDto>> CreateAdminAsync(CreateAdminDto createAdminDto);
        Task<ApiResponse<AdminDto?>> UpdateAdminAsync(int adminId, UpdateAdminDto updateAdminDto);
        Task<ApiResponse<bool>> DeleteAdminAsync(int adminId);
        Task<ApiResponse<AdminDto?>> AuthenticateAsync(AdminLoginDto loginDto);
        Task<ApiResponse<bool>> ChangePasswordAsync(int adminId, string currentPassword, string newPassword);
    }
}