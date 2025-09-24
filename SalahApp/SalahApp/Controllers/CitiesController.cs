using Microsoft.AspNetCore.Mvc;
using SalahApp.DTOs;
using SalahApp.Services;

namespace SalahApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CitiesController : ControllerBase
    {
        private readonly ILocationService _locationService;

        public CitiesController(ILocationService locationService)
        {
            _locationService = locationService;
        }

        /// <summary>
        /// Get cities by state ID
        /// </summary>
        [HttpGet("by-state/{stateId}")]
        public async Task<ActionResult<ApiResponse<List<CityDto>>>> GetCitiesByState(int stateId)
        {
            var result = await _locationService.GetCitiesByStateAsync(stateId);
            return Ok(result);
        }

        /// <summary>
        /// Get a specific city by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<CityDto?>>> GetCity(int id)
        {
            var result = await _locationService.GetCityByIdAsync(id);
            if (!result.Success || result.Data == null)
                return NotFound(result);
            
            return Ok(result);
        }

        /// <summary>
        /// Create a new city
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<CityDto>>> CreateCity([FromBody] CreateCityDto createCityDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _locationService.CreateCityAsync(createCityDto);
            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetCity), new { id = result.Data!.CityId }, result);
        }

        /// <summary>
        /// Update an existing city
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<CityDto?>>> UpdateCity(int id, [FromBody] UpdateCityDto updateCityDto)
        {
            var result = await _locationService.UpdateCityAsync(id, updateCityDto);
            if (!result.Success)
                return BadRequest(result);
            
            if (result.Data == null)
                return NotFound(result);

            return Ok(result);
        }

        /// <summary>
        /// Delete a city
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteCity(int id)
        {
            var result = await _locationService.DeleteCityAsync(id);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
    }
}