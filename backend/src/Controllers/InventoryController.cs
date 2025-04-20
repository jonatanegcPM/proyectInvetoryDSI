using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using proyectInvetoryDSI.Data;
using proyectInvetoryDSI.DTOs;
using proyectInvetoryDSI.Models;
using proyectInvetoryDSI.Services;
using System.Security.Claims;

namespace proyectInvetoryDSI.Controllers
{
    [Route("api/inventory")]
    [ApiController]
    [Authorize]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;
        private readonly ILogger<InventoryController> _logger;

        public InventoryController(
            IInventoryService inventoryService, 
            ILogger<InventoryController> logger)
        {
            _inventoryService = inventoryService;
            _logger = logger;
        }

        [HttpGet("products")]
        public async Task<ActionResult<ProductResponse>> GetProducts(
            [FromQuery] string? search = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10,
            [FromQuery] string? sort = "name",
            [FromQuery] string? direction = "asc")
        {
            try
            {
                var result = await _inventoryService.GetProductsAsync(
                    search, categoryId, page, limit, sort, direction);
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener productos");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("products/{id}")]
        public async Task<ActionResult<ProductDTO>> GetProduct(int id)
        {
            try
            {
                var product = await _inventoryService.GetProductByIdAsync(id);
                
                if (product == null)
                {
                    return NotFound(new { message = "Producto no encontrado" });
                }
                
                return Ok(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener producto con ID {id}");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPost("products")]
        public async Task<ActionResult<ProductDTO>> CreateProduct([FromBody] CreateProductDTO createProductDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var product = await _inventoryService.CreateProductAsync(createProductDto);
                
                return CreatedAtAction(
                    nameof(GetProduct), 
                    new { id = product.Id }, 
                    product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear producto");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPut("products/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDTO updateProductDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                await _inventoryService.UpdateProductAsync(id, updateProductDto);
                
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, $"Producto con ID {id} no encontrado");
                return NotFound(new { message = "Producto no encontrado" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar producto con ID {id}");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpDelete("products/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                await _inventoryService.DeleteProductAsync(id);
                
                return Ok(new { success = true, message = "Producto eliminado correctamente" });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, $"Producto con ID {id} no encontrado");
                return NotFound(new { message = "Producto no encontrado" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar producto con ID {id}");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPost("products/{id}/adjust")]
        public async Task<IActionResult> AdjustStock(int id, [FromBody] AdjustStockDTO adjustStockDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _inventoryService.AdjustStockAsync(id, adjustStockDto);
                
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, $"Producto con ID {id} no encontrado");
                return NotFound(new { message = "Producto no encontrado" });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al ajustar stock para producto con ID {id}");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("transactions")]
        public async Task<ActionResult<IEnumerable<InventoryTransactionDTO>>> GetTransactions(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10,
            [FromQuery] int? productId = null,
            [FromQuery] string? type = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var result = await _inventoryService.GetTransactionsAsync(
                    page, limit, productId, type, startDate, endDate);
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener transacciones de inventario");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetCategories()
        {
            try
            {
                var categories = await _inventoryService.GetCategoriesAsync();
                
                return Ok(new { categories });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener categorías");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("stats")]
        public async Task<ActionResult<InventoryStatsDTO>> GetInventoryStats()
        {
            try
            {
                var stats = await _inventoryService.GetInventoryStatsAsync();
                
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estadísticas de inventario");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<List<ProductDTO>>> SearchProducts([FromQuery] string name)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                {
                    return BadRequest(new { message = "El nombre del producto es requerido" });
                }

                var products = await _inventoryService.SearchProductsByNameAsync(name);
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al buscar productos por nombre");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("stock")]
        public async Task<ActionResult<object>> GetProductStock([FromQuery] string name)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                {
                    return BadRequest(new { message = "El nombre del producto es requerido" });
                }

                var stockInfo = await _inventoryService.GetProductStockByNameAsync(name);
                
                if (stockInfo == null)
                {
                    return NotFound(new { message = "Producto no encontrado" });
                }
                
                return Ok(stockInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener stock de producto por nombre");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpGet("low-stock")]
        public async Task<ActionResult<List<object>>> GetLowStockProducts()
        {
            try
            {
                var lowStockProducts = await _inventoryService.GetLowStockProductsAsync();
                return Ok(lowStockProducts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener productos con bajo stock");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}