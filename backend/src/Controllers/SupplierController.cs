using Microsoft.AspNetCore.Mvc;
using ProyectScrumTeams.Services;
using ProyectScrumTeams.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ProyectScrumTeams.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupplierController : ControllerBase
    {
        private readonly SupplierService _supplierService;

        public SupplierController(SupplierService supplierService)
        {
            _supplierService = supplierService;
        }

        // GET: api/Supplier
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Supplier>>> GetSuppliers()
        {
            var suppliers = await _supplierService.GetAllSuppliersAsync();
            return Ok(suppliers);
        }

        // GET: api/Supplier/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Supplier>> GetSupplier(int id)
        {
            var supplier = await _supplierService.GetSupplierByIdAsync(id);
            if (supplier == null)
            {
                return NotFound();
            }
            return Ok(supplier);
        }

        // POST: api/Supplier
        [HttpPost]
        public async Task<ActionResult<Supplier>> PostSupplier(Supplier supplier)
        {
            await _supplierService.AddSupplierAsync(supplier);
            return CreatedAtAction(nameof(GetSupplier), new { id = supplier.SupplierID }, supplier);
        }

        // PUT: api/Supplier/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSupplier(int id, Supplier supplier)
        {
            if (id != supplier.SupplierID)
            {
                return BadRequest();
            }

            await _supplierService.UpdateSupplierAsync(supplier);
            return NoContent();
        }

        // DELETE: api/Supplier/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSupplier(int id)
        {
            await _supplierService.DeleteSupplierAsync(id);
            return NoContent();
        }
    }
}