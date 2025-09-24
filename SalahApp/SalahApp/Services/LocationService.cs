using Microsoft.EntityFrameworkCore;
using AutoMapper;
using SalahApp.Data;
using SalahApp.DTOs;
using SalahApp.Models;
using SalahApp.Extensions;

namespace SalahApp.Services
{
    public class LocationService : ILocationService
    {
        private readonly SalahAppDbContext _context;
        private readonly IMapper _mapper;

        public LocationService(SalahAppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ApiResponse<List<StateDto>>> GetAllStatesAsync()
        {
            try
            {
                var states = await _context.States
                    .Include(s => s.Cities)
                    .OrderBy(s => s.StateName)
                    .ToListAsync();

                var stateDtos = _mapper.Map<List<StateDto>>(states);
                return SalahApp.Extensions.ApiResponseHelper.CreateSuccessResponse(stateDtos);
            }
            catch (Exception ex)
            {
                return SalahApp.Extensions.ApiResponseHelper.CreateErrorResponse<List<StateDto>>(
                    "Error retrieving states", ex.Message);
            }
        }

        public async Task<ApiResponse<StateDto?>> GetStateByIdAsync(int stateId)
        {
            try
            {
                var state = await _context.States
                    .Include(s => s.Cities)
                    .FirstOrDefaultAsync(s => s.StateId == stateId);

                if (state == null)
                    return ApiResponseHelper.CreateNotFoundResponse<StateDto?>("State not found");

                var stateDto = _mapper.Map<StateDto>(state);
                return SalahApp.Extensions.ApiResponseHelper.CreateSuccessResponse<StateDto?>(stateDto);
            }
            catch (Exception ex)
            {
                return SalahApp.Extensions.ApiResponseHelper.CreateErrorResponse<StateDto?>(
                    "Error retrieving state", ex.Message);
            }
        }

        public async Task<ApiResponse<StateDto>> CreateStateAsync(CreateStateDto createStateDto)
        {
            try
            {
                var state = _mapper.Map<State>(createStateDto);
                _context.States.Add(state);
                await _context.SaveChangesAsync();

                var stateDto = _mapper.Map<StateDto>(state);
                return ApiResponseHelper.CreateSuccessResponse(stateDto, "State created successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<StateDto>(
                    "Error creating state", ex.Message);
            }
        }

        public async Task<ApiResponse<StateDto?>> UpdateStateAsync(int stateId, UpdateStateDto updateStateDto)
        {
            try
            {
                var state = await _context.States.FindAsync(stateId);
                if (state == null)
                    return ApiResponseHelper.CreateNotFoundResponse<StateDto?>("State not found");

                _mapper.Map(updateStateDto, state);
                await _context.SaveChangesAsync();

                var stateDto = _mapper.Map<StateDto>(state);
                return ApiResponseHelper.CreateSuccessResponse<StateDto?>(stateDto, "State updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<StateDto?>(
                    "Error updating state", ex.Message);
            }
        }

        public async Task<ApiResponse<bool>> DeleteStateAsync(int stateId)
        {
            try
            {
                var state = await _context.States.FindAsync(stateId);
                if (state == null)
                    return ApiResponseHelper.CreateNotFoundResponse<bool>("State not found");

                _context.States.Remove(state);
                await _context.SaveChangesAsync();

                return ApiResponseHelper.CreateSuccessResponse(true, "State deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<bool>(
                    "Error deleting state", ex.Message);
            }
        }

        public async Task<ApiResponse<List<CityDto>>> GetCitiesByStateAsync(int stateId)
        {
            try
            {
                var cities = await _context.Cities
                    .Where(c => c.StateId == stateId)
                    .OrderBy(c => c.CityName)
                    .ToListAsync();

                var cityDtos = _mapper.Map<List<CityDto>>(cities);
                return ApiResponseHelper.CreateSuccessResponse(cityDtos);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<List<CityDto>>(
                    "Error retrieving cities", ex.Message);
            }
        }

        public async Task<ApiResponse<CityDto?>> GetCityByIdAsync(int cityId)
        {
            try
            {
                var city = await _context.Cities
                    .Include(c => c.State)
                    .FirstOrDefaultAsync(c => c.CityId == cityId);

                if (city == null)
                    return ApiResponseHelper.CreateNotFoundResponse<CityDto?>("City not found");

                var cityDto = _mapper.Map<CityDto>(city);
                return ApiResponseHelper.CreateSuccessResponse<CityDto?>(cityDto);
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<CityDto?>(
                    "Error retrieving city", ex.Message);
            }
        }

        public async Task<ApiResponse<CityDto>> CreateCityAsync(CreateCityDto createCityDto)
        {
            try
            {
                var city = _mapper.Map<City>(createCityDto);
                _context.Cities.Add(city);
                await _context.SaveChangesAsync();

                var cityDto = _mapper.Map<CityDto>(city);
                return ApiResponseHelper.CreateSuccessResponse(cityDto, "City created successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<CityDto>(
                    "Error creating city", ex.Message);
            }
        }

        public async Task<ApiResponse<CityDto?>> UpdateCityAsync(int cityId, UpdateCityDto updateCityDto)
        {
            try
            {
                var city = await _context.Cities.FindAsync(cityId);
                if (city == null)
                    return ApiResponseHelper.CreateNotFoundResponse<CityDto?>("City not found");

                _mapper.Map(updateCityDto, city);
                await _context.SaveChangesAsync();

                var cityDto = _mapper.Map<CityDto>(city);
                return ApiResponseHelper.CreateSuccessResponse<CityDto?>(cityDto, "City updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<CityDto?>(
                    "Error updating city", ex.Message);
            }
        }

        public async Task<ApiResponse<bool>> DeleteCityAsync(int cityId)
        {
            try
            {
                var city = await _context.Cities.FindAsync(cityId);
                if (city == null)
                    return ApiResponseHelper.CreateNotFoundResponse<bool>("City not found");

                _context.Cities.Remove(city);
                await _context.SaveChangesAsync();

                return ApiResponseHelper.CreateSuccessResponse(true, "City deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponseHelper.CreateErrorResponse<bool>(
                    "Error deleting city", ex.Message);
            }
        }
    }
}