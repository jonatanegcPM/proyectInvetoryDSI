using Microsoft.AspNetCore.Mvc;
using ProyectScrumTeams.Services;
using ProyectScrumTeams.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ProyectScrumTeams.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly RoleService _roleService;

        public RoleController(RoleService roleService)
        {
            _roleService = roleService;
        }

        // GET: api/Role
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Role>>> GetRoles()
        {
            var roles = await _roleService.GetAllRolesAsync();
            return Ok(roles);
        }

        // GET: api/Role/id
        [HttpGet("{id}")]
        public async Task<ActionResult<Role>> GetRole(int id)
        {
            var role = await _roleService.GetRoleByIdAsync(id);
            if (role == null)
            {
                return NotFound();
            }
            return Ok(role);
        }

        // POST: api/Role
        [HttpPost]
        public async Task<ActionResult<Role>> PostRole(Role role)
        {
            await _roleService.AddRoleAsync(role);
            return CreatedAtAction(nameof(GetRole), new { id = role.RoleID }, role);
        }

        // PUT: api/Role/id
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRole(int id, Role role)
        {
            if (id != role.RoleID)
            {
                return BadRequest();
            }

            await _roleService.UpdateRoleAsync(role);
            return NoContent();
        }

        // DELETE: api/Role/id
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            await _roleService.DeleteRoleAsync(id);
            return NoContent();
        }
    }
}
