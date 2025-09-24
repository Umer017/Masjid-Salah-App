using SalahApp.DTOs;
using SalahApp.Models;

namespace SalahApp.Services
{
    public interface ILocationService
    {
        Task<ApiResponse<List<StateDto>>> GetAllStatesAsync();
        Task<ApiResponse<StateDto?>> GetStateByIdAsync(int stateId);
        Task<ApiResponse<StateDto>> CreateStateAsync(CreateStateDto createStateDto);
        Task<ApiResponse<StateDto?>> UpdateStateAsync(int stateId, UpdateStateDto updateStateDto);
        Task<ApiResponse<bool>> DeleteStateAsync(int stateId);

        Task<ApiResponse<List<CityDto>>> GetCitiesByStateAsync(int stateId);
        Task<ApiResponse<CityDto?>> GetCityByIdAsync(int cityId);
        Task<ApiResponse<CityDto>> CreateCityAsync(CreateCityDto createCityDto);
        Task<ApiResponse<CityDto?>> UpdateCityAsync(int cityId, UpdateCityDto updateCityDto);
        Task<ApiResponse<bool>> DeleteCityAsync(int cityId);
    }
}