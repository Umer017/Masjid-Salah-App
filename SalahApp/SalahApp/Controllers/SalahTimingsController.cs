using Microsoft.AspNetCore.Mvc;
using SalahApp.DTOs;
using SalahApp.Services;
// Add this using statement for Hijri date conversion
using System.Globalization;

namespace SalahApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalahTimingsController : ControllerBase
    {
        private readonly ISalahTimingService _salahTimingService;
        private readonly IDefaultScheduleService _defaultScheduleService;

        public SalahTimingsController(ISalahTimingService salahTimingService, IDefaultScheduleService defaultScheduleService)
        {
            _salahTimingService = salahTimingService;
            _defaultScheduleService = defaultScheduleService;
        }

        /// <summary>
        /// Get all salah timings with pagination and optional filters
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<PagedResponse<SalahTimingDto>>>> GetSalahTimings(
            [FromQuery] PaginationParameters pagination,
            [FromQuery] int? masjidId = null,
            [FromQuery] DateOnly? date = null)
        {
            var result = await _salahTimingService.GetSalahTimingsAsync(pagination, masjidId, date);
            return Ok(result);
        }

        /// <summary>
        /// Get a specific salah timing by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<SalahTimingDto?>>> GetSalahTiming(int id)
        {
            var result = await _salahTimingService.GetSalahTimingByIdAsync(id);
            if (!result.Success || result.Data == null)
                return NotFound(result);
            
            return Ok(result);
        }

        /// <summary>
        /// Get salah timing for a specific masjid and date
        /// </summary>
        [HttpGet("masjid/{masjidId}/date/{date}")]
        public async Task<ActionResult<ApiResponse<SalahTimingDto?>>> GetSalahTimingByMasjidAndDate(int masjidId, DateOnly date)
        {
            var result = await _salahTimingService.GetSalahTimingByMasjidAndDateAsync(masjidId, date);
            if (!result.Success || result.Data == null)
                return NotFound(result);
            
            return Ok(result);
        }

        /// <summary>
        /// Get salah timings for a specific masjid with optional date range
        /// </summary>
        [HttpGet("masjid/{masjidId}")]
        public async Task<ActionResult<ApiResponse<List<SalahTimingDto>>>> GetSalahTimingsByMasjid(
            int masjidId,
            [FromQuery] DateOnly? startDate = null,
            [FromQuery] DateOnly? endDate = null)
        {
            var result = await _salahTimingService.GetSalahTimingsByMasjidAsync(masjidId, startDate, endDate);
            return Ok(result);
        }

        /// <summary>
        /// Get salah timings by date range
        /// </summary>
        [HttpGet("date-range")]
        public async Task<ActionResult<ApiResponse<List<SalahTimingDto>>>> GetSalahTimingsByDateRange(
            [FromQuery] DateOnly startDate,
            [FromQuery] DateOnly endDate,
            [FromQuery] int? masjidId = null)
        {
            var result = await _salahTimingService.GetSalahTimingsByDateRangeAsync(startDate, endDate, masjidId);
            return Ok(result);
        }

        /// <summary>
        /// Get daily schedule (combined prayer timings, additional timings, and events)
        /// </summary>
        [HttpGet("daily-schedule/masjid/{masjidId}/date/{date}")]
        public async Task<ActionResult<ApiResponse<DailyScheduleDto?>>> GetDailySchedule(int masjidId, DateOnly date)
        {
            var result = await _salahTimingService.GetDailyScheduleAsync(masjidId, date);
            
            // Add Hijri date to the response
            if (result.Success && result.Data != null)
            {
                // Convert Gregorian date to Hijri
                var hijriDate = new HijriCalendar();
                var gregorianDate = date.ToDateTime(TimeOnly.MinValue);
                var hijriYear = hijriDate.GetYear(gregorianDate);
                var hijriMonth = hijriDate.GetMonth(gregorianDate);
                var hijriDay = hijriDate.GetDayOfMonth(gregorianDate);
                
                // Format Hijri date
                result.Data.IslamicDate = $"{hijriDay} {GetHijriMonthName(hijriMonth)} {hijriYear}";
            }
            
            if (!result.Success || result.Data == null)
                return NotFound(result);
            
            return Ok(result);
        }

        /// <summary>
        /// Get default schedule for a masjid (single schedule that can be updated)
        /// </summary>
        [HttpGet("default-schedule/masjid/{masjidId}")]
        public async Task<ActionResult<ApiResponse<DefaultScheduleDto?>>> GetDefaultSchedule(int masjidId)
        {
            var result = await _defaultScheduleService.GetDefaultScheduleByMasjidIdAsync(masjidId);
            if (!result.Success || result.Data == null)
                return NotFound(result);
            
            return Ok(result);
        }

        /// <summary>
        /// Create a new salah timing
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<SalahTimingDto>>> CreateSalahTiming([FromBody] CreateSalahTimingDto createSalahTimingDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _salahTimingService.CreateSalahTimingAsync(createSalahTimingDto);
            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetSalahTiming), new { id = result.Data!.SalahId }, result);
        }

        /// <summary>
        /// Update an existing salah timing
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<SalahTimingDto?>>> UpdateSalahTiming(int id, [FromBody] UpdateSalahTimingDto updateSalahTimingDto)
        {
            var result = await _salahTimingService.UpdateSalahTimingAsync(id, updateSalahTimingDto);
            if (!result.Success)
                return BadRequest(result);
            
            if (result.Data == null)
                return NotFound(result);

            return Ok(result);
        }

        /// <summary>
        /// Delete a salah timing
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteSalahTiming(int id)
        {
            var result = await _salahTimingService.DeleteSalahTimingAsync(id);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Create a new default schedule for a masjid
        /// </summary>
        [HttpPost("default-schedule")]
        public async Task<ActionResult<ApiResponse<DefaultScheduleDto>>> CreateDefaultSchedule([FromBody] CreateDefaultScheduleDto createDefaultScheduleDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _defaultScheduleService.CreateDefaultScheduleAsync(createDefaultScheduleDto);
            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetDefaultSchedule), new { masjidId = result.Data!.MasjidId }, result);
        }

        /// <summary>
        /// Update an existing default schedule for a masjid
        /// </summary>
        [HttpPut("default-schedule/{scheduleId}")]
        public async Task<ActionResult<ApiResponse<DefaultScheduleDto?>>> UpdateDefaultSchedule(int scheduleId, [FromBody] UpdateDefaultScheduleDto updateDefaultScheduleDto)
        {
            var result = await _defaultScheduleService.UpdateDefaultScheduleAsync(scheduleId, updateDefaultScheduleDto);
            if (!result.Success)
                return BadRequest(result);
            
            if (result.Data == null)
                return NotFound(result);

            return Ok(result);
        }

        /// <summary>
        /// Helper method to get Hijri month name
        /// </summary>
        private string GetHijriMonthName(int month)
        {
            switch (month)
            {
                case 1: return "Muharram";
                case 2: return "Safar";
                case 3: return "Rabi' al-Awwal";
                case 4: return "Rabi' al-Thani";
                case 5: return "Jumada al-Awwal";
                case 6: return "Jumada al-Thani";
                case 7: return "Rajab";
                case 8: return "Sha'ban";
                case 9: return "Ramadan";
                case 10: return "Shawwal";
                case 11: return "Dhu al-Qi'dah";
                case 12: return "Dhu al-Hijjah";
                default: return "";
            }
        }
    }
}