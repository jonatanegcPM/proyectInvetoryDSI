using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using proyectInvetoryDSI.Services;
using proyectInvetoryDSI.DTOs;

namespace proyectInvetoryDSI.Controllers
{
    [Authorize]
    [Route("api/purchases")]
    [ApiController]
    public class PurchaseController : ControllerBase
    {
        private readonly PurchaseService _purchaseService;

        public PurchaseController(PurchaseService purchaseService)
        {
            _purchaseService = purchaseService;
        }

        [HttpPost]
        public async Task<ActionResult<PurchaseResponseDTO>> CreatePurchase([FromBody] CreatePurchaseDTO purchaseDto)
        {
            try
            {
                var purchase = await _purchaseService.CreatePurchaseAsync(purchaseDto);
                return Ok(purchase);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message, details = ex.InnerException?.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetAllPurchases(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var (purchases, total) = await _purchaseService.GetAllPurchasesAsync(
                    page, limit, status, startDate, endDate);

                return Ok(new
                {
                    Purchases = purchases,
                    Pagination = new
                    {
                        Total = total,
                        Page = page,
                        Limit = limit,
                        Pages = (int)Math.Ceiling(total / (double)limit)
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PurchaseResponseDTO>> GetPurchase(int id)
        {
            var purchase = await _purchaseService.GetPurchaseByIdAsync(id);
            if (purchase == null)
                return NotFound(new { message = $"Pedido con ID {id} no encontrado" });

            return Ok(purchase);
        }

        [HttpPatch("{id}/status")]
        public async Task<ActionResult<PurchaseResponseDTO>> UpdatePurchaseStatus(int id, [FromBody] UpdatePurchaseStatusDTO statusDto)
        {
            try
            {
                var updatedPurchase = await _purchaseService.UpdatePurchaseStatusAsync(id, statusDto.Status);
                return Ok(updatedPurchase);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar el estado del pedido", error = ex.Message });
            }
        }
    }
} 