using Microsoft.AspNetCore.Mvc;
using SalahApp.DTOs;
using SalahApp.Services;

namespace SalahApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DefaultSchedulesController : ControllerBase
    {
        private readonly IDefaultScheduleService _defaultScheduleService;

        public DefaultSchedulesController(IDefaultScheduleService defaultScheduleService)
        {
            _defaultScheduleService = defaultScheduleService;
        }

        /// <summary>
        /// Get default schedule for a specific masjid
        /// </summary>
        [HttpGet("masjid/{masjidId}")]
        public async Task<ActionResult<ApiResponse<DefaultScheduleDto?>>> GetDefaultScheduleByMasjidId(int masjidId)
        {
            var result = await _defaultScheduleService.GetDefaultScheduleByMasjidIdAsync(masjidId);
            if (!result.Success || result.Data == null)
                return NotFound(result);
            
            return Ok(result);
        }

        /// <summary>
        /// Create a new default schedule
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<DefaultScheduleDto>>> CreateDefaultSchedule([FromBody] CreateDefaultScheduleDto createDefaultScheduleDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _defaultScheduleService.CreateDefaultScheduleAsync(createDefaultScheduleDto);
            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetDefaultScheduleByMasjidId), new { masjidId = result.Data!.MasjidId }, result);
        }

        /// <summary>
        /// Update an existing default schedule
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<DefaultScheduleDto?>>> UpdateDefaultSchedule(int id, [FromBody] UpdateDefaultScheduleDto updateDefaultScheduleDto)
        {
            var result = await _defaultScheduleService.UpdateDefaultScheduleAsync(id, updateDefaultScheduleDto);
            if (!result.Success)
                return BadRequest(result);
            
            if (result.Data == null)
                return NotFound(result);

            return Ok(result);
        }

        /// <summary>
        /// Delete a default schedule
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteDefaultSchedule(int id)
        {
            var result = await _defaultScheduleService.DeleteDefaultScheduleAsync(id);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
    }
}