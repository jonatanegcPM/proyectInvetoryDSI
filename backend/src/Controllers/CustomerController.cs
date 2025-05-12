// Controllers/CustomerController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using proyectInvetoryDSI.Services;
using proyectInvetoryDSI.DTOs;
using System.Threading.Tasks;

namespace proyectInvetoryDSI.Controllers
{
    [Authorize]
    [Route("api/customers")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly CustomerService _customerService;

        public CustomerController(CustomerService customerService)
        {
            _customerService = customerService;
        }

        [HttpGet]
        public async Task<ActionResult<CustomersResponse>> GetCustomers(
            [FromQuery] string? search,
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10,
            [FromQuery] string? sort = "name",
            [FromQuery] string? direction = "asc")
        {
            var response = await _customerService.GetAllCustomersAsync(search, status, page, limit, sort, direction);
            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CustomerDetailDTO>> GetCustomer(int id)
        {
            var customer = await _customerService.GetCustomerByIdAsync(id);
            if (customer == null)
            {
                return NotFound();
            }
            return Ok(customer);
        }

        [HttpPost]
        public async Task<ActionResult<CustomerDTO>> CreateCustomer([FromBody] CustomerCreateDTO customerDto)
        {
            var customer = await _customerService.CreateCustomerAsync(customerDto);
            return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCustomer(int id, [FromBody] CustomerCreateDTO customerDto)
        {
            var customer = await _customerService.UpdateCustomerAsync(id, customerDto);
            if (customer == null)
            {
                return NotFound();
            }
            return Ok(customer);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var success = await _customerService.DeleteCustomerAsync(id);
            if (!success)
            {
                return NotFound();
            }
            return Ok(new { success = true, message = "Cliente eliminado correctamente" });
        }

        [HttpGet("{id}/purchases")]
        public async Task<ActionResult<CustomersResponse>> GetCustomerPurchases(int id, [FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var response = await _customerService.GetCustomerPurchasesAsync(id, page, limit);
            return Ok(response);
        }

        [HttpGet("stats")]
        public async Task<ActionResult<CustomerStatsDTO>> GetCustomerStats()
        {
            var stats = await _customerService.GetCustomerStatsAsync();
            return Ok(stats);
        }
    }
}