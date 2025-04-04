using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using proyectInvetoryDSI.Services;
using System.Threading.Tasks;

namespace proyectInvetoryDSI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly DashboardService _dashboardService;

        public DashboardController(DashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats([FromQuery] string dateFilter = "month")
        {
            var stats = await _dashboardService.GetDashboardStats(dateFilter);
            return Ok(stats);
        }

        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions([FromQuery] string dateFilter = "week", [FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var transactions = await _dashboardService.GetRecentTransactions(dateFilter, page, limit);
            return Ok(transactions);
        }

        [HttpGet("inventory/low-stock")]
        public async Task<IActionResult> GetLowStockProducts([FromQuery] int limit = 5, [FromQuery] string threshold = "critical")
        {
            var products = await _dashboardService.GetLowStockProducts(limit, threshold);
            return Ok(products);
        }

        [HttpGet("transaction/{id}")]
        public async Task<IActionResult> GetTransactionDetails(int id)
        {
            var transaction = await _dashboardService.GetTransactionDetails(id);
            if (transaction == null)
            {
                return NotFound();
            }
            return Ok(transaction);
        }

        [HttpGet("inventory/top-selling")]
        public async Task<IActionResult> GetTopSellingProducts([FromQuery] string dateFilter = "month", [FromQuery] int limit = 5)
        {
            var products = await _dashboardService.GetTopSellingProducts(dateFilter, limit);
            return Ok(products);
        }

    }
}