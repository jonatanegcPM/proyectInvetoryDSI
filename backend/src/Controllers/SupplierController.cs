// Controllers/SupplierController.cs
using Microsoft.AspNetCore.Mvc;
using proyectInvetoryDSI.Services;
using proyectInvetoryDSI.DTOs;
using System.Threading.Tasks;

namespace proyectInvetoryDSI.Controllers
{
    [Route("api/suppliers")]
    [ApiController]
    public class SupplierController : ControllerBase
    {
        private readonly SupplierService _supplierService;

        public SupplierController(SupplierService supplierService)
        {
            _supplierService = supplierService;
        }

        [HttpGet]
        public async Task<ActionResult<SuppliersResponse>> GetSuppliers(
            [FromQuery] string? search,
            [FromQuery] string? category,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10)
        {
            var response = await _supplierService.GetAllSuppliersAsync(search, category, page, limit);
            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SupplierDetailDTO>> GetSupplier(int id)
        {
            var supplier = await _supplierService.GetSupplierByIdAsync(id);
            if (supplier == null)
            {
                return NotFound();
            }
            return Ok(supplier);
        }

        [HttpPost]
        public async Task<ActionResult<SupplierDTO>> CreateSupplier([FromBody] SupplierCreateDTO supplierDto)
        {
            var supplier = await _supplierService.CreateSupplierAsync(supplierDto);
            return CreatedAtAction(nameof(GetSupplier), new { id = supplier.Id }, supplier);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<SupplierDTO>> UpdateSupplier(int id, [FromBody] SupplierCreateDTO supplierDto)
        {
            var supplier = await _supplierService.UpdateSupplierAsync(id, supplierDto);
            if (supplier == null)
            {
                return NotFound();
            }
            return Ok(supplier);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSupplier(int id)
        {
            var success = await _supplierService.DeleteSupplierAsync(id);
            if (!success)
            {
                return NotFound();
            }
            return Ok(new { success = true, message = "Proveedor eliminado correctamente" });
        }

        [HttpGet("{id}/products")]
        public async Task<ActionResult<SupplierProductsResponse>> GetSupplierProducts(
            int id, 
            [FromQuery] int page = 1, 
            [FromQuery] int limit = 10)
        {
            var response = await _supplierService.GetSupplierProductsAsync(id, page, limit);
            return Ok(response);
        }

        [HttpGet("{id}/orders")]
        public async Task<ActionResult<SupplierOrdersResponse>> GetSupplierOrders(
            int id, 
            [FromQuery] int page = 1, 
            [FromQuery] int limit = 10)
        {
            var response = await _supplierService.GetSupplierOrdersAsync(id, page, limit);
            return Ok(response);
        }

        [HttpGet("categories")]
        public async Task<ActionResult<SupplierCategoriesResponse>> GetSupplierCategories()
        {
            var response = await _supplierService.GetSupplierCategoriesAsync();
            return Ok(response);
        }

        [HttpGet("stats")]
        public async Task<ActionResult<SupplierStatsDTO>> GetSupplierStats()
        {
            var response = await _supplierService.GetSupplierStatsAsync();
            return Ok(response);
        }
    }
}