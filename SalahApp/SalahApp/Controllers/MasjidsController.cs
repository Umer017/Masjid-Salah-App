using Microsoft.AspNetCore.Mvc;
using SalahApp.DTOs;
using SalahApp.Services;

namespace SalahApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MasjidsController : ControllerBase
    {
        private readonly IMasjidService _masjidService;

        public MasjidsController(IMasjidService masjidService)
        {
            _masjidService = masjidService;
        }

        /// <summary>
        /// Get all masjids with pagination and optional search
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<PagedResponse<MasjidDto>>>> GetMasjids(
            [FromQuery] PaginationParameters pagination,
            [FromQuery] MasjidSearchDto? searchDto = null)
        {
            var result = await _masjidService.GetMasjidsAsync(pagination, searchDto);
            return Ok(result);
        }

        /// <summary>
        /// Get a specific masjid by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<MasjidDto?>>> GetMasjid(int id)
        {
            var result = await _masjidService.GetMasjidByIdAsync(id);
            if (!result.Success || result.Data == null)
                return NotFound(result);
            
            return Ok(result);
        }

        /// <summary>
        /// Get a masjid with all its timings and events
        /// </summary>
        [HttpGet("{id}/with-timings")]
        public async Task<ActionResult<ApiResponse<MasjidWithTimingsDto?>>> GetMasjidWithTimings(int id, [FromQuery] DateOnly? date = null)
        {
            var result = await _masjidService.GetMasjidWithTimingsAsync(id, date);
            if (!result.Success || result.Data == null)
                return NotFound(result);
            
            return Ok(result);
        }

        /// <summary>
        /// Get masjids by city ID
        /// </summary>
        [HttpGet("by-city/{cityId}")]
        public async Task<ActionResult<ApiResponse<List<MasjidDto>>>> GetMasjidsByCity(int cityId)
        {
            var result = await _masjidService.GetMasjidsByCityAsync(cityId);
            return Ok(result);
        }

        /// <summary>
        /// Get nearby masjids based on coordinates
        /// </summary>
        [HttpGet("nearby")]
        public async Task<ActionResult<ApiResponse<List<MasjidDto>>>> GetNearbyMasjids(
            [FromQuery] decimal latitude,
            [FromQuery] decimal longitude,
            [FromQuery] double radiusInKm = 5.0)
        {
            var result = await _masjidService.GetNearbyMasjidsAsync(latitude, longitude, radiusInKm);
            return Ok(result);
        }

        /// <summary>
        /// Create a new masjid
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<MasjidDto>>> CreateMasjid([FromBody] CreateMasjidDto createMasjidDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _masjidService.CreateMasjidAsync(createMasjidDto);
            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetMasjid), new { id = result.Data!.MasjidId }, result);
        }

        /// <summary>
        /// Update an existing masjid
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<MasjidDto?>>> UpdateMasjid(int id, [FromBody] UpdateMasjidDto updateMasjidDto)
        {
            var result = await _masjidService.UpdateMasjidAsync(id, updateMasjidDto);
            if (!result.Success)
                return BadRequest(result);
            
            if (result.Data == null)
                return NotFound(result);

            return Ok(result);
        }

        /// <summary>
        /// Delete a masjid
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteMasjid(int id)
        {
            var result = await _masjidService.DeleteMasjidAsync(id);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
    }
}