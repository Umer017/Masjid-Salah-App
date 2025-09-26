using Microsoft.EntityFrameworkCore;
using AutoMapper;
using SalahApp.Data;
using SalahApp.DTOs;
using SalahApp.Models;
using SalahApp.Extensions;

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
                var salahTiming = await _context.SalahTimings
                    .Include(st => st.Masjid)
                    .ThenInclude(m => m.City)
                    .ThenInclude(c => c.State)
                    .FirstOrDefaultAsync(st => st.MasjidId == masjidId && st.Date == date);

                // If no timing found for the specific date, get the latest timing for this masjid
                if (salahTiming == null)
                {
                    salahTiming = await _context.SalahTimings
                        .Include(st => st.Masjid)
                        .ThenInclude(m => m.City)
                        .ThenInclude(c => c.State)
                        .Where(st => st.MasjidId == masjidId)
                        .OrderByDescending(st => st.Date)
                        .FirstOrDefaultAsync();
                }

                if (salahTiming == null)
                    return ApiResponseHelper.CreateNotFoundResponse<SalahTimingDto?>("No salah timing found for this masjid");

                var salahTimingDto = _mapper.Map<SalahTimingDto>(salahTiming);
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
    }
}