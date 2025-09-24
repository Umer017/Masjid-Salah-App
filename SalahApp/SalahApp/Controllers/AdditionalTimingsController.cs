using Microsoft.AspNetCore.Mvc;
using SalahApp.DTOs;
using SalahApp.Services;

namespace SalahApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdditionalTimingsController : ControllerBase
    {
        private readonly IAdditionalTimingsService _additionalTimingsService;

        public AdditionalTimingsController(IAdditionalTimingsService additionalTimingsService)
        {
            _additionalTimingsService = additionalTimingsService;
        }

        /// <summary>
        /// Get all additional timings with pagination and optional filters
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<PagedResponse<DailyAdditionalTimingsDto>>>> GetAdditionalTimings(
            [FromQuery] PaginationParameters pagination,
            [FromQuery] int? masjidId = null,
            [FromQuery] DateOnly? date = null)
        {
            var result = await _additionalTimingsService.GetAdditionalTimingsAsync(pagination, masjidId, date);
            return Ok(result);
        }

        /// <summary>
        /// Get a specific additional timing by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<DailyAdditionalTimingsDto?>>> GetAdditionalTiming(int id)
        {
            var result = await _additionalTimingsService.GetAdditionalTimingByIdAsync(id);
            if (!result.Success || result.Data == null)
                return NotFound(result);
            
            return Ok(result);
        }

        /// <summary>
        /// Get additional timing for a specific masjid and date
        /// </summary>
        [HttpGet("masjid/{masjidId}/date/{date}")]
        public async Task<ActionResult<ApiResponse<DailyAdditionalTimingsDto?>>> GetAdditionalTimingByMasjidAndDate(int masjidId, DateOnly date)
        {
            var result = await _additionalTimingsService.GetAdditionalTimingByMasjidAndDateAsync(masjidId, date);
            if (!result.Success || result.Data == null)
                return NotFound(result);
            
            return Ok(result);
        }

        /// <summary>
        /// Get additional timings for a specific masjid with optional date range
        /// </summary>
        [HttpGet("masjid/{masjidId}")]
        public async Task<ActionResult<ApiResponse<List<DailyAdditionalTimingsDto>>>> GetAdditionalTimingsByMasjid(
            int masjidId,
            [FromQuery] DateOnly? startDate = null,
            [FromQuery] DateOnly? endDate = null)
        {
            var result = await _additionalTimingsService.GetAdditionalTimingsByMasjidAsync(masjidId, startDate, endDate);
            return Ok(result);
        }

        /// <summary>
        /// Create a new additional timing
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<DailyAdditionalTimingsDto>>> CreateAdditionalTiming([FromBody] CreateDailyAdditionalTimingsDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _additionalTimingsService.CreateAdditionalTimingAsync(createDto);
            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetAdditionalTiming), new { id = result.Data!.AdditionalId }, result);
        }

        /// <summary>
        /// Update an existing additional timing
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<DailyAdditionalTimingsDto?>>> UpdateAdditionalTiming(int id, [FromBody] UpdateDailyAdditionalTimingsDto updateDto)
        {
            var result = await _additionalTimingsService.UpdateAdditionalTimingAsync(id, updateDto);
            if (!result.Success)
                return BadRequest(result);
            
            if (result.Data == null)
                return NotFound(result);

            return Ok(result);
        }

        /// <summary>
        /// Delete an additional timing
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteAdditionalTiming(int id)
        {
            var result = await _additionalTimingsService.DeleteAdditionalTimingAsync(id);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
    }
}