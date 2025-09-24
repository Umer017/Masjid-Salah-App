using Microsoft.EntityFrameworkCore;
using AutoMapper;
using SalahApp.Data;
using SalahApp.DTOs;
using SalahApp.Models;
using SalahApp.Extensions;

namespace SalahApp.Services
{
    public class MasjidService : IMasjidService
    {
        private readonly SalahAppDbContext _context;
        private readonly IMapper _mapper;

        public MasjidService(SalahAppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ApiResponse<PagedResponse<MasjidDto>>> GetMasjidsAsync(PaginationParameters pagination, MasjidSearchDto? searchDto = null)
        {
            try
            {
                var query = _context.Masjids
                    .Include(m => m.City)
                    .ThenInclude(c => c.State)
                    .AsQueryable();

                // Apply search filters
                if (searchDto != null)
                {
                    if (!string.IsNullOrEmpty(searchDto.Name))
                        query = query.Where(m => m.MasjidName.Contains(searchDto.Name));

                    if (searchDto.CityId.HasValue)
                        query = query.Where(m => m.CityId == searchDto.CityId.Value);

                    if (searchDto.StateId.HasValue)
                        query = query.Where(m => m.City.StateId == searchDto.StateId.Value);
                }

                var totalCount = await query.CountAsync();
                var masjids = await query
                    .OrderBy(m => m.MasjidName)
                    .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                    .Take(pagination.PageSize)
                    .ToListAsync();

                var masjidDtos = _mapper.Map<List<MasjidDto>>(masjids);
                var pagedResponse = new PagedResponse<MasjidDto>
                {
                    Data = masjidDtos,
                    TotalCount = totalCount,
                    PageNumber = pagination.PageNumber,
                    PageSize = pagination.PageSize
                };

                return ApiResponseHelper.CreateSuccessResponse(pagedResponse);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<PagedResponse<MasjidDto>>(
                    "Error retrieving masjids", ex.Message);
            }
        }

        public async Task<ApiResponse<MasjidDto?>> GetMasjidByIdAsync(int masjidId)
        {
            try
            {
                var masjid = await _context.Masjids
                    .Include(m => m.City)
                    .ThenInclude(c => c.State)
                    .FirstOrDefaultAsync(m => m.MasjidId == masjidId);

                if (masjid == null)
                    return ApiResponseHelper.CreateNotFoundResponse<MasjidDto?>("Masjid not found");

                var masjidDto = _mapper.Map<MasjidDto>(masjid);
                return ApiResponseHelper.CreateSuccessResponse<MasjidDto?>(masjidDto);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<MasjidDto?>(
                    "Error retrieving masjid", ex.Message);
            }
        }

        public async Task<ApiResponse<MasjidWithTimingsDto?>> GetMasjidWithTimingsAsync(int masjidId, DateOnly? date = null)
        {
            try
            {
                var targetDate = date ?? DateOnly.FromDateTime(DateTime.Today);

                var masjid = await _context.Masjids
                    .Include(m => m.City)
                    .ThenInclude(c => c.State)
                    .Include(m => m.SalahTimings.Where(st => st.Date == targetDate))
                    .Include(m => m.DailyAdditionalTimings.Where(dat => dat.Date == targetDate))
                    .Include(m => m.SpecialEvents.Where(se => se.EventDate == targetDate))
                    .FirstOrDefaultAsync(m => m.MasjidId == masjidId);

                if (masjid == null)
                    return ApiResponseHelper.CreateNotFoundResponse<MasjidWithTimingsDto?>("Masjid not found");

                var masjidDto = _mapper.Map<MasjidWithTimingsDto>(masjid);
                return ApiResponseHelper.CreateSuccessResponse<MasjidWithTimingsDto?>(masjidDto);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<MasjidWithTimingsDto?>(
                    "Error retrieving masjid with timings", ex.Message);
            }
        }

        public async Task<ApiResponse<List<MasjidDto>>> GetMasjidsByCityAsync(int cityId)
        {
            try
            {
                var masjids = await _context.Masjids
                    .Include(m => m.City)
                    .ThenInclude(c => c.State)
                    .Where(m => m.CityId == cityId)
                    .OrderBy(m => m.MasjidName)
                    .ToListAsync();

                var masjidDtos = _mapper.Map<List<MasjidDto>>(masjids);
                return ApiResponseHelper.CreateSuccessResponse(masjidDtos);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<List<MasjidDto>>(
                    "Error retrieving masjids by city", ex.Message);
            }
        }

        public async Task<ApiResponse<List<MasjidDto>>> GetNearbyMasjidsAsync(decimal latitude, decimal longitude, double radiusInKm = 5.0)
        {
            try
            {
                var masjids = await _context.Masjids
                    .Include(m => m.City)
                    .ThenInclude(c => c.State)
                    .Where(m => m.Latitude.HasValue && m.Longitude.HasValue)
                    .ToListAsync();

                var nearbyMasjids = masjids
                    .Where(m => CalculateDistance(latitude, longitude, m.Latitude!.Value, m.Longitude!.Value) <= radiusInKm)
                    .OrderBy(m => CalculateDistance(latitude, longitude, m.Latitude!.Value, m.Longitude!.Value))
                    .ToList();

                var masjidDtos = _mapper.Map<List<MasjidDto>>(nearbyMasjids);
                return ApiResponseHelper.CreateSuccessResponse(masjidDtos);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<List<MasjidDto>>(
                    "Error retrieving nearby masjids", ex.Message);
            }
        }

        public async Task<ApiResponse<MasjidDto>> CreateMasjidAsync(CreateMasjidDto createMasjidDto)
        {
            try
            {
                var masjid = _mapper.Map<Masjid>(createMasjidDto);
                _context.Masjids.Add(masjid);
                await _context.SaveChangesAsync();

                // Reload with navigation properties
                await _context.Entry(masjid)
                    .Reference(m => m.City)
                    .LoadAsync();
                await _context.Entry(masjid.City)
                    .Reference(c => c.State)
                    .LoadAsync();

                var masjidDto = _mapper.Map<MasjidDto>(masjid);
                return ApiResponseHelper.CreateSuccessResponse(masjidDto, "Masjid created successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<MasjidDto>(
                    "Error creating masjid", ex.Message);
            }
        }

        public async Task<ApiResponse<MasjidDto?>> UpdateMasjidAsync(int masjidId, UpdateMasjidDto updateMasjidDto)
        {
            try
            {
                var masjid = await _context.Masjids
                    .Include(m => m.City)
                    .ThenInclude(c => c.State)
                    .FirstOrDefaultAsync(m => m.MasjidId == masjidId);

                if (masjid == null)
                    return ApiResponseHelper.CreateNotFoundResponse<MasjidDto?>("Masjid not found");

                _mapper.Map(updateMasjidDto, masjid);
                await _context.SaveChangesAsync();

                var masjidDto = _mapper.Map<MasjidDto>(masjid);
                return ApiResponseHelper.CreateSuccessResponse<MasjidDto?>(masjidDto, "Masjid updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<MasjidDto?>(
                    "Error updating masjid", ex.Message);
            }
        }

        public async Task<ApiResponse<bool>> DeleteMasjidAsync(int masjidId)
        {
            try
            {
                var masjid = await _context.Masjids.FindAsync(masjidId);
                if (masjid == null)
                    return ApiResponseHelper.CreateNotFoundResponse<bool>("Masjid not found");

                _context.Masjids.Remove(masjid);
                await _context.SaveChangesAsync();

                return ApiResponseHelper.CreateSuccessResponse(true, "Masjid deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<bool>(
                    "Error deleting masjid", ex.Message);
            }
        }

        private static double CalculateDistance(decimal lat1, decimal lon1, decimal lat2, decimal lon2)
        {
            const double earthRadius = 6371; // Earth radius in kilometers

            var dLat = ToRadians((double)(lat2 - lat1));
            var dLon = ToRadians((double)(lon2 - lon1));

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians((double)lat1)) * Math.Cos(ToRadians((double)lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return earthRadius * c;
        }

        private static double ToRadians(double degrees)
        {
            return degrees * Math.PI / 180;
        }
    }
}