using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using proyectInvetoryDSI.Services;
using proyectInvetoryDSI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace proyectInvetoryDSI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        // GET: api/User
        [HttpGet]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        // GET: api/User/id
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        // POST: api/User
        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            try
            {
                var createdUser = await _userService.AddUserAsync(user);
                return CreatedAtAction(nameof(GetUser), new { id = createdUser.UserID }, createdUser);
            }
            catch (InvalidOperationException ex)
            {
                // Manejar el caso de email o username duplicado
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                // Manejar otros errores
                return StatusCode(500, new { message = "Error interno del servidor", details = ex.Message });
            }
        }

        // PUT: api/User/id
        [HttpPut("{id}")]
        public async Task<ActionResult<User>> PutUser(int id, User user)
        {
            // Verificar si el usuario actual es admin o el mismo usuario
            var currentUserId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            var isAdmin = User.IsInRole("Administrador");

            if (!isAdmin && currentUserId != id)
            {
                return Forbid();
            }

            if (id != user.UserID)
            {
                return BadRequest();
            }

            try
            {
                var updatedUser = await _userService.UpdateUserAsync(user);
                return Ok(updatedUser);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", details = ex.Message });
            }
        }

        // DELETE: api/User/id
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            await _userService.DeleteUserAsync(id);
            return NoContent();
        }
    }
}