using Microsoft.AspNetCore.Mvc;
using SalahApp.DTOs;
using SalahApp.Services;

namespace SalahApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        /// <summary>
        /// Admin login
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<AdminDto?>>> Login([FromBody] AdminLoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _adminService.AuthenticateAsync(loginDto);
            if (!result.Success || result.Data == null)
                return Unauthorized(result);
            
            return Ok(result);
        }

        /// <summary>
        /// Get all admins with pagination
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<PagedResponse<AdminDto>>>> GetAdmins([FromQuery] PaginationParameters pagination)
        {
            var result = await _adminService.GetAdminsAsync(pagination);
            return Ok(result);
        }

        /// <summary>
        /// Get a specific admin by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<AdminDto?>>> GetAdmin(int id)
        {
            var result = await _adminService.GetAdminByIdAsync(id);
            if (!result.Success || result.Data == null)
                return NotFound(result);
            
            return Ok(result);
        }

        /// <summary>
        /// Get admin by username
        /// </summary>
        [HttpGet("username/{username}")]
        public async Task<ActionResult<ApiResponse<AdminDto?>>> GetAdminByUsername(string username)
        {
            var result = await _adminService.GetAdminByUsernameAsync(username);
            if (!result.Success || result.Data == null)
                return NotFound(result);
            
            return Ok(result);
        }

        /// <summary>
        /// Create a new admin
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<AdminDto>>> CreateAdmin([FromBody] CreateAdminDto createAdminDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _adminService.CreateAdminAsync(createAdminDto);
            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetAdmin), new { id = result.Data!.AdminId }, result);
        }

        /// <summary>
        /// Update an existing admin
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<AdminDto?>>> UpdateAdmin(int id, [FromBody] UpdateAdminDto updateAdminDto)
        {
            var result = await _adminService.UpdateAdminAsync(id, updateAdminDto);
            if (!result.Success)
                return BadRequest(result);
            
            if (result.Data == null)
                return NotFound(result);

            return Ok(result);
        }

        /// <summary>
        /// Change admin password
        /// </summary>
        [HttpPost("{id}/change-password")]
        public async Task<ActionResult<ApiResponse<bool>>> ChangePassword(int id, [FromBody] ChangePasswordDto changePasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _adminService.ChangePasswordAsync(id, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Delete an admin
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteAdmin(int id)
        {
            var result = await _adminService.DeleteAdminAsync(id);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
    }

    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}