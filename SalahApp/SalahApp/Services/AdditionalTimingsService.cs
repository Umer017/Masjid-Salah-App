using Microsoft.EntityFrameworkCore;
using AutoMapper;
using SalahApp.Data;
using SalahApp.DTOs;
using SalahApp.Models;
using SalahApp.Extensions;

namespace SalahApp.Services
{
    public class AdditionalTimingsService : IAdditionalTimingsService
    {
        private readonly SalahAppDbContext _context;
        private readonly IMapper _mapper;

        public AdditionalTimingsService(SalahAppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ApiResponse<PagedResponse<DailyAdditionalTimingsDto>>> GetAdditionalTimingsAsync(PaginationParameters pagination, int? masjidId = null, DateOnly? date = null)
        {
            try
            {
                var query = _context.DailyAdditionalTimings
                    .Include(dat => dat.Masjid)
                    .ThenInclude(m => m.City)
                    .ThenInclude(c => c.State)
                    .AsQueryable();

                if (masjidId.HasValue)
                    query = query.Where(dat => dat.MasjidId == masjidId.Value);

                if (date.HasValue)
                    query = query.Where(dat => dat.Date == date.Value);

                var totalCount = await query.CountAsync();
                var additionalTimings = await query
                    .OrderByDescending(dat => dat.Date)
                    .ThenBy(dat => dat.Masjid.MasjidName)
                    .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                    .Take(pagination.PageSize)
                    .ToListAsync();

                var additionalTimingDtos = _mapper.Map<List<DailyAdditionalTimingsDto>>(additionalTimings);
                var pagedResponse = new PagedResponse<DailyAdditionalTimingsDto>
                {
                    Data = additionalTimingDtos,
                    TotalCount = totalCount,
                    PageNumber = pagination.PageNumber,
                    PageSize = pagination.PageSize
                };

                return ApiResponseHelper.CreateSuccessResponse(pagedResponse);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<PagedResponse<DailyAdditionalTimingsDto>>(
                    "Error retrieving additional timings", ex.Message);
            }
        }

        public async Task<ApiResponse<DailyAdditionalTimingsDto?>> GetAdditionalTimingByIdAsync(int additionalId)
        {
            try
            {
                var additionalTiming = await _context.DailyAdditionalTimings
                    .Include(dat => dat.Masjid)
                    .ThenInclude(m => m.City)
                    .ThenInclude(c => c.State)
                    .FirstOrDefaultAsync(dat => dat.AdditionalId == additionalId);

                if (additionalTiming == null)
                    return ApiResponseHelper.CreateNotFoundResponse<DailyAdditionalTimingsDto?>("Additional timing not found");

                var additionalTimingDto = _mapper.Map<DailyAdditionalTimingsDto>(additionalTiming);
                return ApiResponseHelper.CreateSuccessResponse<DailyAdditionalTimingsDto?>(additionalTimingDto);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<DailyAdditionalTimingsDto?>(
                    "Error retrieving additional timing", ex.Message);
            }
        }

        public async Task<ApiResponse<DailyAdditionalTimingsDto?>> GetAdditionalTimingByMasjidAndDateAsync(int masjidId, DateOnly date)
        {
            try
            {
                var additionalTiming = await _context.DailyAdditionalTimings
                    .Include(dat => dat.Masjid)
                    .ThenInclude(m => m.City)
                    .ThenInclude(c => c.State)
                    .FirstOrDefaultAsync(dat => dat.MasjidId == masjidId && dat.Date == date);

                if (additionalTiming == null)
                    return ApiResponseHelper.CreateNotFoundResponse<DailyAdditionalTimingsDto?>("Additional timing not found for this date");

                var additionalTimingDto = _mapper.Map<DailyAdditionalTimingsDto>(additionalTiming);
                return ApiResponseHelper.CreateSuccessResponse<DailyAdditionalTimingsDto?>(additionalTimingDto);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<DailyAdditionalTimingsDto?>(
                    "Error retrieving additional timing", ex.Message);
            }
        }

        public async Task<ApiResponse<List<DailyAdditionalTimingsDto>>> GetAdditionalTimingsByMasjidAsync(int masjidId, DateOnly? startDate = null, DateOnly? endDate = null)
        {
            try
            {
                var query = _context.DailyAdditionalTimings
                    .Include(dat => dat.Masjid)
                    .ThenInclude(m => m.City)
                    .ThenInclude(c => c.State)
                    .Where(dat => dat.MasjidId == masjidId);

                if (startDate.HasValue)
                    query = query.Where(dat => dat.Date >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(dat => dat.Date <= endDate.Value);

                var additionalTimings = await query
                    .OrderBy(dat => dat.Date)
                    .ToListAsync();

                var additionalTimingDtos = _mapper.Map<List<DailyAdditionalTimingsDto>>(additionalTimings);
                return ApiResponseHelper.CreateSuccessResponse(additionalTimingDtos);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<List<DailyAdditionalTimingsDto>>(
                    "Error retrieving additional timings by masjid", ex.Message);
            }
        }

        public async Task<ApiResponse<DailyAdditionalTimingsDto>> CreateAdditionalTimingAsync(CreateDailyAdditionalTimingsDto createDto)
        {
            try
            {
                // Check if timing already exists for this masjid and date
                var existingTiming = await _context.DailyAdditionalTimings
                    .AnyAsync(dat => dat.MasjidId == createDto.MasjidId && dat.Date == createDto.Date);

                if (existingTiming)
                    return ApiResponseHelper.CreateErrorResponse<DailyAdditionalTimingsDto>(
                        "Timing already exists", "Additional timing already exists for this masjid and date");

                var additionalTiming = _mapper.Map<DailyAdditionalTimings>(createDto);
                _context.DailyAdditionalTimings.Add(additionalTiming);
                await _context.SaveChangesAsync();

                // Reload with navigation properties
                await _context.Entry(additionalTiming)
                    .Reference(dat => dat.Masjid)
                    .LoadAsync();
                await _context.Entry(additionalTiming.Masjid)
                    .Reference(m => m.City)
                    .LoadAsync();
                await _context.Entry(additionalTiming.Masjid.City)
                    .Reference(c => c.State)
                    .LoadAsync();

                var additionalTimingDto = _mapper.Map<DailyAdditionalTimingsDto>(additionalTiming);
                return ApiResponseHelper.CreateSuccessResponse(additionalTimingDto, "Additional timing created successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<DailyAdditionalTimingsDto>(
                    "Error creating additional timing", ex.Message);
            }
        }

        public async Task<ApiResponse<DailyAdditionalTimingsDto?>> UpdateAdditionalTimingAsync(int additionalId, UpdateDailyAdditionalTimingsDto updateDto)
        {
            try
            {
                var additionalTiming = await _context.DailyAdditionalTimings
                    .Include(dat => dat.Masjid)
                    .ThenInclude(m => m.City)
                    .ThenInclude(c => c.State)
                    .FirstOrDefaultAsync(dat => dat.AdditionalId == additionalId);

                if (additionalTiming == null)
                    return ApiResponseHelper.CreateNotFoundResponse<DailyAdditionalTimingsDto?>("Additional timing not found");

                _mapper.Map(updateDto, additionalTiming);
                await _context.SaveChangesAsync();

                var additionalTimingDto = _mapper.Map<DailyAdditionalTimingsDto>(additionalTiming);
                return ApiResponseHelper.CreateSuccessResponse<DailyAdditionalTimingsDto?>(additionalTimingDto, "Additional timing updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<DailyAdditionalTimingsDto?>(
                    "Error updating additional timing", ex.Message);
            }
        }

        public async Task<ApiResponse<bool>> DeleteAdditionalTimingAsync(int additionalId)
        {
            try
            {
                var additionalTiming = await _context.DailyAdditionalTimings.FindAsync(additionalId);
                if (additionalTiming == null)
                    return ApiResponseHelper.CreateNotFoundResponse<bool>("Additional timing not found");

                _context.DailyAdditionalTimings.Remove(additionalTiming);
                await _context.SaveChangesAsync();

                return ApiResponseHelper.CreateSuccessResponse(true, "Additional timing deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<bool>(
                    "Error deleting additional timing", ex.Message);
            }
        }
    }

    public class SpecialEventsService : ISpecialEventsService
    {
        private readonly SalahAppDbContext _context;
        private readonly IMapper _mapper;

        public SpecialEventsService(SalahAppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ApiResponse<PagedResponse<SpecialEventsDto>>> GetSpecialEventsAsync(PaginationParameters pagination, int? masjidId = null, DateOnly? date = null)
        {
            try
            {
                var query = _context.SpecialEvents
                    .Include(se => se.Masjid)
                    .ThenInclude(m => m.City)
                    .ThenInclude(c => c.State)
                    .AsQueryable();

                if (masjidId.HasValue)
                    query = query.Where(se => se.MasjidId == masjidId.Value);

                if (date.HasValue)
                    query = query.Where(se => se.EventDate == date.Value);

                var totalCount = await query.CountAsync();
                var events = await query
                    .OrderByDescending(se => se.EventDate)
                    .ThenBy(se => se.EventTime)
                    .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                    .Take(pagination.PageSize)
                    .ToListAsync();

                var eventDtos = _mapper.Map<List<SpecialEventsDto>>(events);
                var pagedResponse = new PagedResponse<SpecialEventsDto>
                {
                    Data = eventDtos,
                    TotalCount = totalCount,
                    PageNumber = pagination.PageNumber,
                    PageSize = pagination.PageSize
                };

                return ApiResponseHelper.CreateSuccessResponse(pagedResponse);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<PagedResponse<SpecialEventsDto>>(
                    "Error retrieving special events", ex.Message);
            }
        }

        public async Task<ApiResponse<SpecialEventsDto?>> GetSpecialEventByIdAsync(int eventId)
        {
            try
            {
                var specialEvent = await _context.SpecialEvents
                    .Include(se => se.Masjid)
                    .ThenInclude(m => m.City)
                    .ThenInclude(c => c.State)
                    .FirstOrDefaultAsync(se => se.EventId == eventId);

                if (specialEvent == null)
                    return ApiResponseHelper.CreateNotFoundResponse<SpecialEventsDto?>("Special event not found");

                var eventDto = _mapper.Map<SpecialEventsDto>(specialEvent);
                return ApiResponseHelper.CreateSuccessResponse<SpecialEventsDto?>(eventDto);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<SpecialEventsDto?>(
                    "Error retrieving special event", ex.Message);
            }
        }

        public async Task<ApiResponse<List<SpecialEventsDto>>> GetSpecialEventsByMasjidAsync(int masjidId, DateOnly? startDate = null, DateOnly? endDate = null)
        {
            try
            {
                var query = _context.SpecialEvents
                    .Include(se => se.Masjid)
                    .ThenInclude(m => m.City)
                    .ThenInclude(c => c.State)
                    .Where(se => se.MasjidId == masjidId);

                if (startDate.HasValue)
                    query = query.Where(se => se.EventDate >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(se => se.EventDate <= endDate.Value);

                var events = await query
                    .OrderBy(se => se.EventDate)
                    .ThenBy(se => se.EventTime)
                    .ToListAsync();

                var eventDtos = _mapper.Map<List<SpecialEventsDto>>(events);
                return ApiResponseHelper.CreateSuccessResponse(eventDtos);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<List<SpecialEventsDto>>(
                    "Error retrieving special events by masjid", ex.Message);
            }
        }

        public async Task<ApiResponse<List<SpecialEventsDto>>> GetUpcomingEventsAsync(int? masjidId = null, int daysAhead = 30)
        {
            try
            {
                var startDate = DateOnly.FromDateTime(DateTime.Today);
                var endDate = startDate.AddDays(daysAhead);

                var query = _context.SpecialEvents
                    .Include(se => se.Masjid)
                    .ThenInclude(m => m.City)
                    .ThenInclude(c => c.State)
                    .Where(se => se.EventDate >= startDate && se.EventDate <= endDate);

                if (masjidId.HasValue)
                    query = query.Where(se => se.MasjidId == masjidId.Value);

                var events = await query
                    .OrderBy(se => se.EventDate)
                    .ThenBy(se => se.EventTime)
                    .ToListAsync();

                var eventDtos = _mapper.Map<List<SpecialEventsDto>>(events);
                return ApiResponseHelper.CreateSuccessResponse(eventDtos);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<List<SpecialEventsDto>>(
                    "Error retrieving upcoming events", ex.Message);
            }
        }

        public async Task<ApiResponse<SpecialEventsDto>> CreateSpecialEventAsync(CreateSpecialEventsDto createDto)
        {
            try
            {
                var specialEvent = _mapper.Map<SpecialEvents>(createDto);
                _context.SpecialEvents.Add(specialEvent);
                await _context.SaveChangesAsync();

                // Reload with navigation properties
                await _context.Entry(specialEvent)
                    .Reference(se => se.Masjid)
                    .LoadAsync();
                await _context.Entry(specialEvent.Masjid)
                    .Reference(m => m.City)
                    .LoadAsync();
                await _context.Entry(specialEvent.Masjid.City)
                    .Reference(c => c.State)
                    .LoadAsync();

                var eventDto = _mapper.Map<SpecialEventsDto>(specialEvent);
                return ApiResponseHelper.CreateSuccessResponse(eventDto, "Special event created successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<SpecialEventsDto>(
                    "Error creating special event", ex.Message);
            }
        }

        public async Task<ApiResponse<SpecialEventsDto?>> UpdateSpecialEventAsync(int eventId, UpdateSpecialEventsDto updateDto)
        {
            try
            {
                var specialEvent = await _context.SpecialEvents
                    .Include(se => se.Masjid)
                    .ThenInclude(m => m.City)
                    .ThenInclude(c => c.State)
                    .FirstOrDefaultAsync(se => se.EventId == eventId);

                if (specialEvent == null)
                    return ApiResponseHelper.CreateNotFoundResponse<SpecialEventsDto?>("Special event not found");

                _mapper.Map(updateDto, specialEvent);
                await _context.SaveChangesAsync();

                var eventDto = _mapper.Map<SpecialEventsDto>(specialEvent);
                return ApiResponseHelper.CreateSuccessResponse<SpecialEventsDto?>(eventDto, "Special event updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<SpecialEventsDto?>(
                    "Error updating special event", ex.Message);
            }
        }

        public async Task<ApiResponse<bool>> DeleteSpecialEventAsync(int eventId)
        {
            try
            {
                var specialEvent = await _context.SpecialEvents.FindAsync(eventId);
                if (specialEvent == null)
                    return ApiResponseHelper.CreateNotFoundResponse<bool>("Special event not found");

                _context.SpecialEvents.Remove(specialEvent);
                await _context.SaveChangesAsync();

                return ApiResponseHelper.CreateSuccessResponse(true, "Special event deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<bool>(
                    "Error deleting special event", ex.Message);
            }
        }
    }
}