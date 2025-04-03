using Microsoft.AspNetCore.Mvc;
using proyectInvetoryDSI.Services;
using proyectInvetoryDSI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace proyectInvetoryDSI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        // GET: api/User
        [HttpGet]
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
        public async Task<IActionResult> PutUser(int id, User user)
        {
            if (id != user.UserID)
            {
                return BadRequest();
            }

            try
            {
                await _userService.UpdateUserAsync(user);
                return NoContent();
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
        public async Task<IActionResult> DeleteUser(int id)
        {
            await _userService.DeleteUserAsync(id);
            return NoContent();
        }
    }
}