using Microsoft.EntityFrameworkCore;
using AutoMapper;
using BCrypt.Net;
using SalahApp.Data;
using SalahApp.DTOs;
using SalahApp.Models;
using SalahApp.Extensions;
using SalahApp.Utilities;

namespace SalahApp.Services
{
    public class AdminService : IAdminService
    {
        private readonly SalahAppDbContext _context;
        private readonly IMapper _mapper;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        public AdminService(SalahAppDbContext context, IMapper mapper, IJwtTokenGenerator jwtTokenGenerator)
        {
            _context = context;
            _mapper = mapper;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        public async Task<ApiResponse<PagedResponse<AdminDto>>> GetAdminsAsync(PaginationParameters pagination)
        {
            try
            {
                var query = _context.Admins.AsQueryable();

                var totalCount = await query.CountAsync();
                var admins = await query
                    .OrderBy(a => a.Username)
                    .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                    .Take(pagination.PageSize)
                    .ToListAsync();

                var adminDtos = _mapper.Map<List<AdminDto>>(admins);
                var pagedResponse = new PagedResponse<AdminDto>
                {
                    Data = adminDtos,
                    TotalCount = totalCount,
                    PageNumber = pagination.PageNumber,
                    PageSize = pagination.PageSize
                };

                return ApiResponseHelper.CreateSuccessResponse(pagedResponse);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<PagedResponse<AdminDto>>(
                    "Error retrieving admins", ex.Message);
            }
        }

        public async Task<ApiResponse<AdminDto?>> GetAdminByIdAsync(int adminId)
        {
            try
            {
                var admin = await _context.Admins.FindAsync(adminId);
                if (admin == null)
                    return ApiResponseHelper.CreateNotFoundResponse<AdminDto?>("Admin not found");

                var adminDto = _mapper.Map<AdminDto>(admin);
                return ApiResponseHelper.CreateSuccessResponse<AdminDto?>(adminDto);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<AdminDto?>(
                    "Error retrieving admin", ex.Message);
            }
        }

        public async Task<ApiResponse<AdminDto?>> GetAdminByUsernameAsync(string username)
        {
            try
            {
                var admin = await _context.Admins
                    .FirstOrDefaultAsync(a => a.Username.ToLower() == username.ToLower());

                if (admin == null)
                    return ApiResponseHelper.CreateNotFoundResponse<AdminDto?>("Admin not found");

                var adminDto = _mapper.Map<AdminDto>(admin);
                return ApiResponseHelper.CreateSuccessResponse<AdminDto?>(adminDto);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<AdminDto?>(
                    "Error retrieving admin", ex.Message);
            }
        }

        public async Task<ApiResponse<AdminDto>> CreateAdminAsync(CreateAdminDto createAdminDto)
        {
            try
            {
                // Check if username already exists
                var existingAdmin = await _context.Admins
                    .AnyAsync(a => a.Username.ToLower() == createAdminDto.Username.ToLower());

                if (existingAdmin)
                    return ApiResponseHelper.CreateErrorResponse<AdminDto>(
                        "Username already exists", "An admin with this username already exists");

                var admin = _mapper.Map<Admin>(createAdminDto);
                admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(createAdminDto.Password);
                admin.CreatedDate = DateTime.UtcNow;

                _context.Admins.Add(admin);
                await _context.SaveChangesAsync();

                var adminDto = _mapper.Map<AdminDto>(admin);
                return ApiResponseHelper.CreateSuccessResponse(adminDto, "Admin created successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<AdminDto>(
                    "Error creating admin", ex.Message);
            }
        }

        public async Task<ApiResponse<AdminDto?>> UpdateAdminAsync(int adminId, UpdateAdminDto updateAdminDto)
        {
            try
            {
                var admin = await _context.Admins.FindAsync(adminId);
                if (admin == null)
                    return ApiResponseHelper.CreateNotFoundResponse<AdminDto?>("Admin not found");

                // Check if new username conflicts with existing admin
                if (!string.IsNullOrEmpty(updateAdminDto.Username) && 
                    updateAdminDto.Username.ToLower() != admin.Username.ToLower())
                {
                    var existingAdmin = await _context.Admins
                        .AnyAsync(a => a.Username.ToLower() == updateAdminDto.Username.ToLower());

                    if (existingAdmin)
                        return ApiResponseHelper.CreateErrorResponse<AdminDto?>(
                            "Username already exists", "An admin with this username already exists");
                }

                _mapper.Map(updateAdminDto, admin);
                await _context.SaveChangesAsync();

                var adminDto = _mapper.Map<AdminDto>(admin);
                return ApiResponseHelper.CreateSuccessResponse<AdminDto?>(adminDto, "Admin updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<AdminDto?>(
                    "Error updating admin", ex.Message);
            }
        }

        public async Task<ApiResponse<bool>> DeleteAdminAsync(int adminId)
        {
            try
            {
                var admin = await _context.Admins.FindAsync(adminId);
                if (admin == null)
                    return ApiResponseHelper.CreateNotFoundResponse<bool>("Admin not found");

                _context.Admins.Remove(admin);
                await _context.SaveChangesAsync();

                return ApiResponseHelper.CreateSuccessResponse(true, "Admin deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<bool>(
                    "Error deleting admin", ex.Message);
            }
        }

        public async Task<ApiResponse<AdminDto?>> AuthenticateAsync(AdminLoginDto loginDto)
        {
            try
            {
                var admin = await _context.Admins
                    .FirstOrDefaultAsync(a => a.Username.ToLower() == loginDto.Username.ToLower());

                if (admin == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, admin.PasswordHash))
                    return ApiResponseHelper.CreateErrorResponse<AdminDto?>(
                        "Invalid credentials", "Username or password is incorrect");

                // Update last login date
                admin.LastLoginDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                var adminDto = _mapper.Map<AdminDto>(admin);
                
                // Generate JWT token
                var token = _jwtTokenGenerator.GenerateToken(admin.AdminId, admin.Username, admin.Role ?? "Admin");
                
                // Add token to the response
                adminDto.Token = token;
                
                return ApiResponseHelper.CreateSuccessResponse<AdminDto?>(adminDto, "Login successful");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<AdminDto?>(
                    "Error during authentication", ex.Message);
            }
        }

        public async Task<ApiResponse<bool>> ChangePasswordAsync(int adminId, string currentPassword, string newPassword)
        {
            try
            {
                var admin = await _context.Admins.FindAsync(adminId);
                if (admin == null)
                    return ApiResponseHelper.CreateNotFoundResponse<bool>("Admin not found");

                if (!BCrypt.Net.BCrypt.Verify(currentPassword, admin.PasswordHash))
                    return ApiResponseHelper.CreateErrorResponse<bool>(
                        "Invalid current password", "Current password is incorrect");

                admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
                await _context.SaveChangesAsync();

                return ApiResponseHelper.CreateSuccessResponse(true, "Password changed successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<bool>(
                    "Error changing password", ex.Message);
            }
        }
    }
}