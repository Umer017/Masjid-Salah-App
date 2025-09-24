using Microsoft.EntityFrameworkCore;
using AutoMapper;
using SalahApp.Data;
using SalahApp.DTOs;
using SalahApp.Models;
using SalahApp.Extensions;

namespace SalahApp.Services
{
    public class DefaultScheduleService : IDefaultScheduleService
    {
        private readonly SalahAppDbContext _context;
        private readonly IMapper _mapper;

        public DefaultScheduleService(SalahAppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ApiResponse<DefaultScheduleDto?>> GetDefaultScheduleByMasjidIdAsync(int masjidId)
        {
            try
            {
                var defaultSchedule = await _context.DefaultSchedules
                    .Include(ds => ds.Masjid)
                    .ThenInclude(m => m.City)
                    .ThenInclude(c => c.State)
                    .FirstOrDefaultAsync(ds => ds.MasjidId == masjidId);

                if (defaultSchedule == null)
                    return ApiResponseHelper.CreateNotFoundResponse<DefaultScheduleDto?>("Default schedule not found for this masjid");

                var defaultScheduleDto = _mapper.Map<DefaultScheduleDto>(defaultSchedule);
                return ApiResponseHelper.CreateSuccessResponse<DefaultScheduleDto?>(defaultScheduleDto);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<DefaultScheduleDto?>(
                    "Error retrieving default schedule", ex.Message);
            }
        }

        public async Task<ApiResponse<DefaultScheduleDto>> CreateDefaultScheduleAsync(CreateDefaultScheduleDto createDefaultScheduleDto)
        {
            try
            {
                // Check if schedule already exists for this masjid
                var existingSchedule = await _context.DefaultSchedules
                    .AnyAsync(ds => ds.MasjidId == createDefaultScheduleDto.MasjidId);

                if (existingSchedule)
                    return ApiResponseHelper.CreateErrorResponse<DefaultScheduleDto>(
                        "Schedule already exists", "Default schedule already exists for this masjid");

                var defaultSchedule = _mapper.Map<DefaultSchedule>(createDefaultScheduleDto);
                defaultSchedule.LastUpdated = DateTime.UtcNow;
                
                _context.DefaultSchedules.Add(defaultSchedule);
                await _context.SaveChangesAsync();

                // Reload with navigation properties
                await _context.Entry(defaultSchedule)
                    .Reference(ds => ds.Masjid)
                    .LoadAsync();
                await _context.Entry(defaultSchedule.Masjid)
                    .Reference(m => m.City)
                    .LoadAsync();
                await _context.Entry(defaultSchedule.Masjid.City)
                    .Reference(c => c.State)
                    .LoadAsync();

                var defaultScheduleDto = _mapper.Map<DefaultScheduleDto>(defaultSchedule);
                return ApiResponseHelper.CreateSuccessResponse(defaultScheduleDto, "Default schedule created successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<DefaultScheduleDto>(
                    "Error creating default schedule", ex.Message);
            }
        }

        public async Task<ApiResponse<DefaultScheduleDto?>> UpdateDefaultScheduleAsync(int scheduleId, UpdateDefaultScheduleDto updateDefaultScheduleDto)
        {
            try
            {
                var defaultSchedule = await _context.DefaultSchedules
                    .Include(ds => ds.Masjid)
                    .ThenInclude(m => m.City)
                    .ThenInclude(c => c.State)
                    .FirstOrDefaultAsync(ds => ds.ScheduleId == scheduleId);

                if (defaultSchedule == null)
                    return ApiResponseHelper.CreateNotFoundResponse<DefaultScheduleDto?>("Default schedule not found");

                _mapper.Map(updateDefaultScheduleDto, defaultSchedule);
                defaultSchedule.LastUpdated = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                var defaultScheduleDto = _mapper.Map<DefaultScheduleDto>(defaultSchedule);
                return ApiResponseHelper.CreateSuccessResponse<DefaultScheduleDto?>(defaultScheduleDto, "Default schedule updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<DefaultScheduleDto?>(
                    "Error updating default schedule", ex.Message);
            }
        }

        public async Task<ApiResponse<bool>> DeleteDefaultScheduleAsync(int scheduleId)
        {
            try
            {
                var defaultSchedule = await _context.DefaultSchedules.FindAsync(scheduleId);
                if (defaultSchedule == null)
                    return ApiResponseHelper.CreateNotFoundResponse<bool>("Default schedule not found");

                _context.DefaultSchedules.Remove(defaultSchedule);
                await _context.SaveChangesAsync();

                return ApiResponseHelper.CreateSuccessResponse(true, "Default schedule deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<bool>(
                    "Error deleting default schedule", ex.Message);
            }
        }
    }
}