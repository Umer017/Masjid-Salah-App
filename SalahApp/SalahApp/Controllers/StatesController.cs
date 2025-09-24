using Microsoft.AspNetCore.Mvc;
using SalahApp.DTOs;
using SalahApp.Services;

namespace SalahApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatesController : ControllerBase
    {
        private readonly ILocationService _locationService;

        public StatesController(ILocationService locationService)
        {
            _locationService = locationService;
        }

        /// <summary>
        /// Get all states with their cities
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<StateDto>>>> GetAllStates()
        {
            var result = await _locationService.GetAllStatesAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get a specific state by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<StateDto?>>> GetState(int id)
        {
            var result = await _locationService.GetStateByIdAsync(id);
            if (!result.Success || result.Data == null)
                return NotFound(result);
            
            return Ok(result);
        }

        /// <summary>
        /// Create a new state
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<StateDto>>> CreateState([FromBody] CreateStateDto createStateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _locationService.CreateStateAsync(createStateDto);
            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetState), new { id = result.Data!.StateId }, result);
        }

        /// <summary>
        /// Update an existing state
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<StateDto?>>> UpdateState(int id, [FromBody] UpdateStateDto updateStateDto)
        {
            var result = await _locationService.UpdateStateAsync(id, updateStateDto);
            if (!result.Success)
                return BadRequest(result);
            
            if (result.Data == null)
                return NotFound(result);

            return Ok(result);
        }

        /// <summary>
        /// Delete a state
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteState(int id)
        {
            var result = await _locationService.DeleteStateAsync(id);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
    }
}