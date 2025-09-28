using Microsoft.EntityFrameworkCore;
using AutoMapper;
using SalahApp.Data;
using SalahApp.DTOs;
using SalahApp.Models;
using SalahApp.Extensions;
using System.Globalization;

namespace SalahApp.Services
{
    public class SalahTimingService : ISalahTimingService
    {
        private readonly SalahAppDbContext _context;
        private readonly IMapper _mapper;

        public SalahTimingService(SalahAppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ApiResponse<PagedResponse<SalahTimingDto>>> GetSalahTimingsAsync(PaginationParameters pagination, int? masjidId = null, DateOnly? date = null)
        {
            try
            {
                var query = _context.SalahTimings
                    .Include(st => st.Masjid)
                    .ThenInclude(m => m.City)
                    .ThenInclude(c => c.State)
                    .AsQueryable();

                if (masjidId.HasValue)
                    query = query.Where(st => st.MasjidId == masjidId.Value);

                if (date.HasValue)
                    query = query.Where(st => st.Date == date.Value);

                var totalCount = await query.CountAsync();
                var salahTimings = await query
                    .OrderByDescending(st => st.Date)
                    .ThenBy(st => st.Masjid.MasjidName)
                    .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                    .Take(pagination.PageSize)
                    .ToListAsync();

                var salahTimingDtos = _mapper.Map<List<SalahTimingDto>>(salahTimings);
                var pagedResponse = new PagedResponse<SalahTimingDto>
                {
                    Data = salahTimingDtos,
                    TotalCount = totalCount,
                    PageNumber = pagination.PageNumber,
                    PageSize = pagination.PageSize
                };

                return ApiResponseHelper.CreateSuccessResponse(pagedResponse);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<PagedResponse<SalahTimingDto>>(
                    "Error retrieving salah timings", ex.Message);
            }
        }

        public async Task<ApiResponse<SalahTimingDto?>> GetSalahTimingByIdAsync(int salahId)
        {
            try
            {
                var salahTiming = await _context.SalahTimings
                    .Include(st => st.Masjid)
                    .ThenInclude(m => m.City)
                    .ThenInclude(c => c.State)
                    .FirstOrDefaultAsync(st => st.SalahId == salahId);

                if (salahTiming == null)
                    return ApiResponseHelper.CreateNotFoundResponse<SalahTimingDto?>("Salah timing not found");

                var salahTimingDto = _mapper.Map<SalahTimingDto>(salahTiming);
                return ApiResponseHelper.CreateSuccessResponse<SalahTimingDto?>(salahTimingDto);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<SalahTimingDto?>(
                    "Error retrieving salah timing", ex.Message);
            }
        }

        public async Task<ApiResponse<SalahTimingDto?>> GetSalahTimingByMasjidAndDateAsync(int masjidId, DateOnly date)
        {
            try
            {
                // First, try to get the specific timing for the date
                var salahTiming = await _context.SalahTimings
                    .Include(st => st.Masjid)
                    .ThenInclude(m => m.City)
                    .ThenInclude(c => c.State)
                    .FirstOrDefaultAsync(st => st.MasjidId == masjidId && st.Date == date);

                bool isDefault = false;
                bool isFallback = false;

                // If no timing found for the specific date
                if (salahTiming == null)
                {
                    // Check if today's date - if so, use default schedule
                    if (date == DateOnly.FromDateTime(DateTime.Today))
                    {
                        var defaultSchedule = await _context.DefaultSchedules
                            .FirstOrDefaultAsync(ds => ds.MasjidId == masjidId);
                        
                        if (defaultSchedule != null)
                        {
                            // Create a temporary SalahTimingDto based on default schedule
                            var defaultTimingDto = new SalahTimingDto
                            {
                                MasjidId = masjidId,
                                Date = date,
                                FajrAzanTime = defaultSchedule.FajrAzanTime,
                                FajrIqamahTime = defaultSchedule.FajrIqamahTime,
                                DhuhrAzanTime = defaultSchedule.DhuhrAzanTime,
                                DhuhrIqamahTime = defaultSchedule.DhuhrIqamahTime,
                                AsrAzanTime = defaultSchedule.AsrAzanTime,
                                AsrIqamahTime = defaultSchedule.AsrIqamahTime,
                                MaghribAzanTime = defaultSchedule.MaghribAzanTime,
                                MaghribIqamahTime = defaultSchedule.MaghribIqamahTime,
                                IshaAzanTime = defaultSchedule.IshaAzanTime,
                                IshaIqamahTime = defaultSchedule.IshaIqamahTime,
                                JummahAzanTime = defaultSchedule.JummahAzanTime,
                                JummahIqamahTime = defaultSchedule.JummahIqamahTime
                            };
                            
                            // Also update the default schedule with these times
                            defaultSchedule.FajrAzanTime = defaultSchedule.FajrAzanTime;
                            defaultSchedule.FajrIqamahTime = defaultSchedule.FajrIqamahTime;
                            defaultSchedule.DhuhrAzanTime = defaultSchedule.DhuhrAzanTime;
                            defaultSchedule.DhuhrIqamahTime = defaultSchedule.DhuhrIqamahTime;
                            defaultSchedule.AsrAzanTime = defaultSchedule.AsrAzanTime;
                            defaultSchedule.AsrIqamahTime = defaultSchedule.AsrIqamahTime;
                            defaultSchedule.MaghribAzanTime = defaultSchedule.MaghribAzanTime;
                            defaultSchedule.MaghribIqamahTime = defaultSchedule.MaghribIqamahTime;
                            defaultSchedule.IshaAzanTime = defaultSchedule.IshaAzanTime;
                            defaultSchedule.IshaIqamahTime = defaultSchedule.IshaIqamahTime;
                            defaultSchedule.JummahAzanTime = defaultSchedule.JummahAzanTime;
                            defaultSchedule.JummahIqamahTime = defaultSchedule.JummahIqamahTime;
                            defaultSchedule.LastUpdated = DateTime.UtcNow;
                            
                            await _context.SaveChangesAsync();
                            
                            isDefault = true;
                            defaultTimingDto.IsDefault = true;
                            defaultTimingDto.IsFallback = false;
                            return ApiResponseHelper.CreateSuccessResponse<SalahTimingDto?>(defaultTimingDto);
                        }
                    }
                    
                    // If not today or no default schedule, get the latest timing for this masjid
                    salahTiming = await _context.SalahTimings
                        .Include(st => st.Masjid)
                        .ThenInclude(m => m.City)
                        .ThenInclude(c => c.State)
                        .Where(st => st.MasjidId == masjidId)
                        .OrderByDescending(st => st.Date)
                        .FirstOrDefaultAsync();
                        
                    isFallback = true;
                }

                if (salahTiming == null)
                    return ApiResponseHelper.CreateNotFoundResponse<SalahTimingDto?>("No salah timing found for this masjid");

                var salahTimingDto = _mapper.Map<SalahTimingDto>(salahTiming);
                salahTimingDto.IsDefault = isDefault;
                salahTimingDto.IsFallback = isFallback;
                return ApiResponseHelper.CreateSuccessResponse<SalahTimingDto?>(salahTimingDto);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<SalahTimingDto?>(
                    "Error retrieving salah timing", ex.Message);
            }
        }

        public async Task<ApiResponse<List<SalahTimingDto>>> GetSalahTimingsByMasjidAsync(int masjidId, DateOnly? startDate = null, DateOnly? endDate = null)
        {
            try
            {
                var query = _context.SalahTimings
                    .Include(st => st.Masjid)
                    .ThenInclude(m => m.City)
                    .ThenInclude(c => c.State)
                    .Where(st => st.MasjidId == masjidId);

                if (startDate.HasValue)
                    query = query.Where(st => st.Date >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(st => st.Date <= endDate.Value);

                var salahTimings = await query
                    .OrderBy(st => st.Date)
                    .ToListAsync();

                var salahTimingDtos = _mapper.Map<List<SalahTimingDto>>(salahTimings);
                return ApiResponseHelper.CreateSuccessResponse(salahTimingDtos);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<List<SalahTimingDto>>(
                    "Error retrieving salah timings by masjid", ex.Message);
            }
        }

        public async Task<ApiResponse<List<SalahTimingDto>>> GetSalahTimingsByDateRangeAsync(DateOnly startDate, DateOnly endDate, int? masjidId = null)
        {
            try
            {
                var query = _context.SalahTimings
                    .Include(st => st.Masjid)
                    .ThenInclude(m => m.City)
                    .ThenInclude(c => c.State)
                    .Where(st => st.Date >= startDate && st.Date <= endDate);

                if (masjidId.HasValue)
                    query = query.Where(st => st.MasjidId == masjidId.Value);

                var salahTimings = await query
                    .OrderBy(st => st.Date)
                    .ThenBy(st => st.Masjid.MasjidName)
                    .ToListAsync();

                var salahTimingDtos = _mapper.Map<List<SalahTimingDto>>(salahTimings);
                return ApiResponseHelper.CreateSuccessResponse(salahTimingDtos);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<List<SalahTimingDto>>(
                    "Error retrieving salah timings by date range", ex.Message);
            }
        }

        public async Task<ApiResponse<SalahTimingDto>> CreateSalahTimingAsync(CreateSalahTimingDto createSalahTimingDto)
        {
            try
            {
                // Check if timing already exists for this masjid and date
                var existingTiming = await _context.SalahTimings
                    .AnyAsync(st => st.MasjidId == createSalahTimingDto.MasjidId && st.Date == createSalahTimingDto.Date);

                if (existingTiming)
                    return ApiResponseHelper.CreateErrorResponse<SalahTimingDto>(
                        "Timing already exists", "Salah timing already exists for this masjid and date");

                var salahTiming = _mapper.Map<SalahTiming>(createSalahTimingDto);
                _context.SalahTimings.Add(salahTiming);
                await _context.SaveChangesAsync();

                // Reload with navigation properties
                await _context.Entry(salahTiming)
                    .Reference(st => st.Masjid)
                    .LoadAsync();
                await _context.Entry(salahTiming.Masjid)
                    .Reference(m => m.City)
                    .LoadAsync();
                await _context.Entry(salahTiming.Masjid.City)
                    .Reference(c => c.State)
                    .LoadAsync();

                var salahTimingDto = _mapper.Map<SalahTimingDto>(salahTiming);
                return ApiResponseHelper.CreateSuccessResponse(salahTimingDto, "Salah timing created successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<SalahTimingDto>(
                    "Error creating salah timing", ex.Message);
            }
        }

        public async Task<ApiResponse<SalahTimingDto?>> UpdateSalahTimingAsync(int salahId, UpdateSalahTimingDto updateSalahTimingDto)
        {
            try
            {
                var salahTiming = await _context.SalahTimings
                    .Include(st => st.Masjid)
                    .ThenInclude(m => m.City)
                    .ThenInclude(c => c.State)
                    .FirstOrDefaultAsync(st => st.SalahId == salahId);

                if (salahTiming == null)
                    return ApiResponseHelper.CreateNotFoundResponse<SalahTimingDto?>("Salah timing not found");

                _mapper.Map(updateSalahTimingDto, salahTiming);
                await _context.SaveChangesAsync();

                var salahTimingDto = _mapper.Map<SalahTimingDto>(salahTiming);
                return ApiResponseHelper.CreateSuccessResponse<SalahTimingDto?>(salahTimingDto, "Salah timing updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<SalahTimingDto?>(
                    "Error updating salah timing", ex.Message);
            }
        }

        public async Task<ApiResponse<bool>> DeleteSalahTimingAsync(int salahId)
        {
            try
            {
                var salahTiming = await _context.SalahTimings.FindAsync(salahId);
                if (salahTiming == null)
                    return ApiResponseHelper.CreateNotFoundResponse<bool>("Salah timing not found");

                _context.SalahTimings.Remove(salahTiming);
                await _context.SaveChangesAsync();

                return ApiResponseHelper.CreateSuccessResponse(true, "Salah timing deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<bool>(
                    "Error deleting salah timing", ex.Message);
            }
        }

        public async Task<ApiResponse<DailyScheduleDto?>> GetDailyScheduleAsync(int masjidId, DateOnly date)
        {
            try
            {
                var masjid = await _context.Masjids
                    .Include(m => m.City)
                    .ThenInclude(c => c.State)
                    .FirstOrDefaultAsync(m => m.MasjidId == masjidId);

                if (masjid == null)
                    return ApiResponseHelper.CreateNotFoundResponse<DailyScheduleDto?>("Masjid not found");

                var salahTiming = await _context.SalahTimings
                    .FirstOrDefaultAsync(st => st.MasjidId == masjidId && st.Date == date);

                // If no salah timing found for the specific date, get the latest timing for this masjid
                if (salahTiming == null)
                {
                    salahTiming = await _context.SalahTimings
                        .Where(st => st.MasjidId == masjidId)
                        .OrderByDescending(st => st.Date)
                        .FirstOrDefaultAsync();
                }

                var additionalTimings = await _context.DailyAdditionalTimings
                    .FirstOrDefaultAsync(dat => dat.MasjidId == masjidId && dat.Date == date);

                // If no additional timing found for the specific date, get the latest timing for this masjid
                if (additionalTimings == null)
                {
                    additionalTimings = await _context.DailyAdditionalTimings
                        .Where(dat => dat.MasjidId == masjidId)
                        .OrderByDescending(dat => dat.Date)
                        .FirstOrDefaultAsync();
                }

                var specialEvents = await _context.SpecialEvents
                    .Where(se => se.MasjidId == masjidId && se.EventDate == date)
                    .ToListAsync();

                var dailySchedule = new DailyScheduleDto
                {
                    Date = date,
                    Masjid = _mapper.Map<MasjidDto>(masjid),
                    SalahTiming = salahTiming != null ? _mapper.Map<SalahTimingDto>(salahTiming) : null,
                    AdditionalTimings = additionalTimings != null ? _mapper.Map<DailyAdditionalTimingsDto>(additionalTimings) : null,
                    SpecialEvents = _mapper.Map<List<SpecialEventsDto>>(specialEvents)
                };

                // Set Islamic date from salah timing if available
                if (salahTiming != null)
                    dailySchedule.IslamicDate = salahTiming.IslamicDate;

                return ApiResponseHelper.CreateSuccessResponse<DailyScheduleDto?>(dailySchedule);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<DailyScheduleDto?>(
                    "Error retrieving daily schedule", ex.Message);
            }
        }

        public async Task<ApiResponse<List<SalahTimingDto>>> BatchCreateSalahTimingsAsync(BatchCreateSalahTimingDto batchCreateDto)
        {
            try
            {
                var createdTimings = new List<SalahTimingDto>();
                var currentDate = batchCreateDto.StartDate;
                
                while (currentDate <= batchCreateDto.EndDate)
                {
                    // Check if timing already exists for this masjid and date
                    var existingTiming = await _context.SalahTimings
                        .AnyAsync(st => st.MasjidId == batchCreateDto.MasjidId && st.Date == currentDate);

                    if (!existingTiming)
                    {
                        var createDto = new CreateSalahTimingDto
                        {
                            MasjidId = batchCreateDto.MasjidId,
                            Date = currentDate,
                            FajrAzanTime = batchCreateDto.FajrAzanTime,
                            FajrIqamahTime = batchCreateDto.FajrIqamahTime,
                            DhuhrAzanTime = batchCreateDto.DhuhrAzanTime,
                            DhuhrIqamahTime = batchCreateDto.DhuhrIqamahTime,
                            AsrAzanTime = batchCreateDto.AsrAzanTime,
                            AsrIqamahTime = batchCreateDto.AsrIqamahTime,
                            MaghribAzanTime = batchCreateDto.MaghribAzanTime,
                            MaghribIqamahTime = batchCreateDto.MaghribIqamahTime,
                            IshaAzanTime = batchCreateDto.IshaAzanTime,
                            IshaIqamahTime = batchCreateDto.IshaIqamahTime,
                            JummahAzanTime = batchCreateDto.JummahAzanTime,
                            JummahIqamahTime = batchCreateDto.JummahIqamahTime
                        };

                        var salahTiming = _mapper.Map<SalahTiming>(createDto);
                        _context.SalahTimings.Add(salahTiming);
                        await _context.SaveChangesAsync();

                        // Reload with navigation properties
                        await _context.Entry(salahTiming)
                            .Reference(st => st.Masjid)
                            .LoadAsync();
                        await _context.Entry(salahTiming.Masjid)
                            .Reference(m => m.City)
                            .LoadAsync();
                        await _context.Entry(salahTiming.Masjid.City)
                            .Reference(c => c.State)
                            .LoadAsync();

                        var salahTimingDto = _mapper.Map<SalahTimingDto>(salahTiming);
                        createdTimings.Add(salahTimingDto);
                    }
                    
                    currentDate = currentDate.AddDays(1);
                }
                
                if (createdTimings.Count == 0)
                {
                    return ApiResponseHelper.CreateErrorResponse<List<SalahTimingDto>>(
                        "No timings created", "All dates in the range already have timings");
                }

                return ApiResponseHelper.CreateSuccessResponse(createdTimings, 
                    $"Successfully created {createdTimings.Count} salah timings");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<List<SalahTimingDto>>(
                    "Error creating batch salah timings", ex.Message);
            }
        }

        public async Task<ApiResponse<List<SalahTimingDto>>> BatchUpdateSalahTimingsAsync(List<BatchUpdateSalahTimingDto> batchUpdateDtos)
        {
            try
            {
                var updatedTimings = new List<SalahTimingDto>();
                
                foreach (var updateDto in batchUpdateDtos)
                {
                    var salahTiming = await _context.SalahTimings
                        .Include(st => st.Masjid)
                        .ThenInclude(m => m.City)
                        .ThenInclude(c => c.State)
                        .FirstOrDefaultAsync(st => st.MasjidId == updateDto.MasjidId && st.Date == updateDto.Date);

                    if (salahTiming != null)
                    {
                        // Update only the fields that are provided
                        if (updateDto.FajrAzanTime.HasValue) salahTiming.FajrAzanTime = updateDto.FajrAzanTime;
                        if (updateDto.FajrIqamahTime.HasValue) salahTiming.FajrIqamahTime = updateDto.FajrIqamahTime;
                        if (updateDto.DhuhrAzanTime.HasValue) salahTiming.DhuhrAzanTime = updateDto.DhuhrAzanTime;
                        if (updateDto.DhuhrIqamahTime.HasValue) salahTiming.DhuhrIqamahTime = updateDto.DhuhrIqamahTime;
                        if (updateDto.AsrAzanTime.HasValue) salahTiming.AsrAzanTime = updateDto.AsrAzanTime;
                        if (updateDto.AsrIqamahTime.HasValue) salahTiming.AsrIqamahTime = updateDto.AsrIqamahTime;
                        if (updateDto.MaghribAzanTime.HasValue) salahTiming.MaghribAzanTime = updateDto.MaghribAzanTime;
                        if (updateDto.MaghribIqamahTime.HasValue) salahTiming.MaghribIqamahTime = updateDto.MaghribIqamahTime;
                        if (updateDto.IshaAzanTime.HasValue) salahTiming.IshaAzanTime = updateDto.IshaAzanTime;
                        if (updateDto.IshaIqamahTime.HasValue) salahTiming.IshaIqamahTime = updateDto.IshaIqamahTime;
                        if (updateDto.JummahAzanTime.HasValue) salahTiming.JummahAzanTime = updateDto.JummahAzanTime;
                        if (updateDto.JummahIqamahTime.HasValue) salahTiming.JummahIqamahTime = updateDto.JummahIqamahTime;

                        await _context.SaveChangesAsync();

                        var salahTimingDto = _mapper.Map<SalahTimingDto>(salahTiming);
                        updatedTimings.Add(salahTimingDto);
                    }
                }
                
                if (updatedTimings.Count == 0)
                {
                    return ApiResponseHelper.CreateErrorResponse<List<SalahTimingDto>>(
                        "No timings updated", "None of the specified timings were found");
                }

                return ApiResponseHelper.CreateSuccessResponse(updatedTimings, 
                    $"Successfully updated {updatedTimings.Count} salah timings");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<List<SalahTimingDto>>(
                    "Error updating batch salah timings", ex.Message);
            }
        }

        public async Task<ApiResponse<List<SalahTimingDto>>> GetSalahTimingsByMasjidWithDefaultFallbackAsync(int masjidId, DateOnly? startDate = null, DateOnly? endDate = null)
        {
            try
            {
                var query = _context.SalahTimings
                    .Include(st => st.Masjid)
                    .ThenInclude(m => m.City)
                    .ThenInclude(c => c.State)
                    .Where(st => st.MasjidId == masjidId);

                if (startDate.HasValue)
                    query = query.Where(st => st.Date >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(st => st.Date <= endDate.Value);

                var salahTimings = await query
                    .OrderBy(st => st.Date)
                    .ToListAsync();

                // If no timings found and we have a date range, check for default schedule
                if (salahTimings.Count == 0 && (startDate.HasValue || endDate.HasValue))
                {
                    var defaultSchedule = await _context.DefaultSchedules
                        .FirstOrDefaultAsync(ds => ds.MasjidId == masjidId);
                    
                    if (defaultSchedule != null)
                    {
                        // Create a list of timings based on the default schedule for the date range
                        var currentDate = startDate ?? DateOnly.FromDateTime(DateTime.Today);
                        var endRange = endDate ?? currentDate.AddDays(30); // Default to 30 days
                        
                        while (currentDate <= endRange)
                        {
                            var defaultTimingDto = new SalahTimingDto
                            {
                                MasjidId = masjidId,
                                Date = currentDate,
                                FajrAzanTime = defaultSchedule.FajrAzanTime,
                                FajrIqamahTime = defaultSchedule.FajrIqamahTime,
                                DhuhrAzanTime = defaultSchedule.DhuhrAzanTime,
                                DhuhrIqamahTime = defaultSchedule.DhuhrIqamahTime,
                                AsrAzanTime = defaultSchedule.AsrAzanTime,
                                AsrIqamahTime = defaultSchedule.AsrIqamahTime,
                                MaghribAzanTime = defaultSchedule.MaghribAzanTime,
                                MaghribIqamahTime = defaultSchedule.MaghribIqamahTime,
                                IshaAzanTime = defaultSchedule.IshaAzanTime,
                                IshaIqamahTime = defaultSchedule.IshaIqamahTime,
                                JummahAzanTime = defaultSchedule.JummahAzanTime,
                                JummahIqamahTime = defaultSchedule.JummahIqamahTime
                            };
                            // Note: This is just for display, not actually saved to DB
                            salahTimings.Add(_mapper.Map<SalahTiming>(defaultTimingDto));
                            currentDate = currentDate.AddDays(1);
                        }
                    }
                }

                var salahTimingDtos = _mapper.Map<List<SalahTimingDto>>(salahTimings);
                return ApiResponseHelper.CreateSuccessResponse(salahTimingDtos);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<List<SalahTimingDto>>(
                    "Error retrieving salah timings by masjid", ex.Message);
            }
        }
    }
}