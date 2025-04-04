using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using proyectInvetoryDSI.Services;
using proyectInvetoryDSI.DTOs;
using System.Security.Claims; 

namespace proyectInvetoryDSI.Controllers
{
    [Route("api/pos")]
    [ApiController]
    [Authorize]
    public class POSController : ControllerBase
    {
        private readonly IPosService _posService;

        public POSController(IPosService posService)
        {
            _posService = posService;
        }

        // GET: api/pos/products
        [HttpGet("products")]
        public async Task<ActionResult<ProductResponse>> GetProducts(
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10)
        {
            try
            {
                var result = await _posService.GetProducts(search ?? "", page, limit);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // GET: api/pos/products/barcode/{code}
        [HttpGet("products/barcode/{code}")]
        public async Task<ActionResult<ProductDTO>> GetProductByBarcode(string code)
        {
            try
            {
                var product = await _posService.GetProductByBarcode(code);
                if (product == null)
                {
                    return NotFound(new { message = "Producto no encontrado" });
                }
                return Ok(new { product });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // GET: api/pos/customers
        [HttpGet("customers")]
        public async Task<ActionResult<CustomersResponse>> GetCustomers()
        {
            try
            {
                var result = await _posService.GetCustomers();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // POST: api/pos/sales
            [HttpPost("sales")]
        public async Task<ActionResult<SaleResponseDTO>> CreateSale([FromBody] CreateSaleDTO saleDto)
        {
            try
            {
                // Depuración: Mostrar todas las claims del usuario
                Console.WriteLine("Claims del usuario:");
                foreach (var claim in User.Claims)
                {
                    Console.WriteLine($"{claim.Type}: {claim.Value}");
                }

                // Intentar obtener userId de diferentes claims
                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "userId") ?? 
                                User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                
                if (userIdClaim == null)
                {
                    return Unauthorized(new { message = "No se encontró el userId en el token" });
                }

                if (!int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized(new { message = "El userId en el token no es válido" });
                }

                var result = await _posService.CreateSale(saleDto, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}