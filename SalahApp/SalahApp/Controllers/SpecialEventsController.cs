using Microsoft.AspNetCore.Mvc;
using SalahApp.DTOs;
using SalahApp.Services;

namespace SalahApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SpecialEventsController : ControllerBase
    {
        private readonly ISpecialEventsService _specialEventsService;

        public SpecialEventsController(ISpecialEventsService specialEventsService)
        {
            _specialEventsService = specialEventsService;
        }

        /// <summary>
        /// Get all special events with pagination and optional filters
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<PagedResponse<SpecialEventsDto>>>> GetSpecialEvents(
            [FromQuery] PaginationParameters pagination,
            [FromQuery] int? masjidId = null,
            [FromQuery] DateOnly? date = null)
        {
            var result = await _specialEventsService.GetSpecialEventsAsync(pagination, masjidId, date);
            return Ok(result);
        }

        /// <summary>
        /// Get a specific special event by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<SpecialEventsDto?>>> GetSpecialEvent(int id)
        {
            var result = await _specialEventsService.GetSpecialEventByIdAsync(id);
            if (!result.Success || result.Data == null)
                return NotFound(result);
            
            return Ok(result);
        }

        /// <summary>
        /// Get special events for a specific masjid with optional date range
        /// </summary>
        [HttpGet("masjid/{masjidId}")]
        public async Task<ActionResult<ApiResponse<List<SpecialEventsDto>>>> GetSpecialEventsByMasjid(
            int masjidId,
            [FromQuery] DateOnly? startDate = null,
            [FromQuery] DateOnly? endDate = null)
        {
            var result = await _specialEventsService.GetSpecialEventsByMasjidAsync(masjidId, startDate, endDate);
            return Ok(result);
        }

        /// <summary>
        /// Get upcoming special events
        /// </summary>
        [HttpGet("upcoming")]
        public async Task<ActionResult<ApiResponse<List<SpecialEventsDto>>>> GetUpcomingEvents(
            [FromQuery] int? masjidId = null,
            [FromQuery] int daysAhead = 30)
        {
            var result = await _specialEventsService.GetUpcomingEventsAsync(masjidId, daysAhead);
            return Ok(result);
        }

        /// <summary>
        /// Create a new special event
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<SpecialEventsDto>>> CreateSpecialEvent([FromBody] CreateSpecialEventsDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _specialEventsService.CreateSpecialEventAsync(createDto);
            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetSpecialEvent), new { id = result.Data!.EventId }, result);
        }

        /// <summary>
        /// Update an existing special event
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<SpecialEventsDto?>>> UpdateSpecialEvent(int id, [FromBody] UpdateSpecialEventsDto updateDto)
        {
            var result = await _specialEventsService.UpdateSpecialEventAsync(id, updateDto);
            if (!result.Success)
                return BadRequest(result);
            
            if (result.Data == null)
                return NotFound(result);

            return Ok(result);
        }

        /// <summary>
        /// Delete a special event
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteSpecialEvent(int id)
        {
            var result = await _specialEventsService.DeleteSpecialEventAsync(id);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
    }
}