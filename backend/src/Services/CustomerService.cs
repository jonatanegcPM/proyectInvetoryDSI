// Services/CustomerService.cs
using Microsoft.EntityFrameworkCore;
using proyectInvetoryDSI.Data;
using proyectInvetoryDSI.Models;
using proyectInvetoryDSI.DTOs;
using System.Linq.Dynamic.Core;

namespace proyectInvetoryDSI.Services
{
    public class CustomerService
    {
        private readonly AppDbContext _context;
        private readonly IEventNotificationService _eventNotificationService;

        public CustomerService(AppDbContext context, IEventNotificationService eventNotificationService)
        {
            _context = context;
            _eventNotificationService = eventNotificationService;
        }

        public async Task<CustomersResponse> GetAllCustomersAsync(string? search, string? status, int page = 1, int limit = 10, string? sort = "name", string? direction = "asc")
        {
            IQueryable<Customer> query = _context.Customers;

            // Apply search filter
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(c => 
                    (c.Name != null && c.Name.Contains(search)) || 
                    (c.Email != null && c.Email.Contains(search)) || 
                    (c.Phone != null && c.Phone.Contains(search)));
            }

            // Apply status filter
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(c => c.Status == status);
            }

            // Get total count before pagination
            int total = await query.CountAsync();

            // Apply sorting
            if (!string.IsNullOrEmpty(sort))
            {
                string sortOrder = direction == "desc" ? "DESC" : "ASC";
                query = query.OrderBy($"{sort} {sortOrder}");
            }

            // Apply pagination
            query = query.Skip((page - 1) * limit).Take(limit);

            var customers = await query.Select(c => new CustomerDTO
            {
                Id = c.CustomerID,
                Name = c.Name ?? string.Empty,
                Email = c.Email ?? string.Empty,
                Phone = c.Phone ?? string.Empty,
                Address = c.Address ?? string.Empty,
                DateOfBirth = c.DateOfBirth.HasValue ? c.DateOfBirth.Value.ToString("yyyy-MM-dd") : null,
                Gender = c.Gender ?? string.Empty,
                Insurance = c.Insurance ?? string.Empty,
                Status = c.Status ?? "active",
                RegistrationDate = c.RegistrationDate.ToString("yyyy-MM-dd"),
                LastVisit = c.LastVisit.HasValue ? c.LastVisit.Value.ToString("yyyy-MM-dd") : null
            }).ToListAsync();

            return new CustomersResponse
            {
                Customers = customers,
                Pagination = new PaginationDTO
                {
                    Total = total,
                    Page = page,
                    Limit = limit,
                    Pages = (int)Math.Ceiling(total / (double)limit)
                }
            };
        }

        public async Task<CustomerDetailDTO?> GetCustomerByIdAsync(int id)
        {
            var customer = await _context.Customers
                .Include(c => c.Sales!)
                .ThenInclude(s => s.SaleDetails!)
                .FirstOrDefaultAsync(c => c.CustomerID == id);

            if (customer == null)
            {
                return null;
            }

            var purchases = customer.Sales?.Select(s => new CustomerPurchaseDTO
            {
                Id = $"P-{s.SaleID}",
                Date = s.SaleDate.ToString("yyyy-MM-dd"),
                Items = s.SaleDetails?.Count ?? 0,
                Total = s.TotalAmount,
                PaymentMethod = s.PaymentMethod
            }).ToList() ?? new List<CustomerPurchaseDTO>();

            return new CustomerDetailDTO
            {
                Id = customer.CustomerID,
                Name = customer.Name ?? string.Empty,
                Email = customer.Email ?? string.Empty,
                Phone = customer.Phone ?? string.Empty,
                Address = customer.Address ?? string.Empty,
                DateOfBirth = customer.DateOfBirth.HasValue ? customer.DateOfBirth.Value.ToString("yyyy-MM-dd") : null,
                Gender = customer.Gender ?? string.Empty,
                Insurance = customer.Insurance ?? string.Empty,
                Status = customer.Status ?? "active",
                RegistrationDate = customer.RegistrationDate.ToString("yyyy-MM-dd"),
                LastVisit = customer.LastVisit.HasValue ? customer.LastVisit.Value.ToString("yyyy-MM-dd") : null,
                Allergies = customer.Allergies ?? string.Empty,
                Notes = customer.Notes ?? string.Empty,
                TotalPurchases = customer.Sales?.Count ?? 0,
                TotalSpent = customer.Sales?.Sum(s => s.TotalAmount) ?? 0,
                Purchases = purchases
            };
        }

        public async Task<CustomerDTO> CreateCustomerAsync(CustomerCreateDTO customerDto)
        {
            var customer = new Customer
            {
                Name = customerDto.Name ?? string.Empty,
                Email = customerDto.Email ?? string.Empty,
                Phone = customerDto.Phone ?? string.Empty,
                Address = customerDto.Address ?? string.Empty,
                DateOfBirth = !string.IsNullOrEmpty(customerDto.DateOfBirth) ? DateTime.Parse(customerDto.DateOfBirth) : null,
                Gender = customerDto.Gender ?? string.Empty,
                Insurance = customerDto.Insurance ?? string.Empty,
                Status = customerDto.Status ?? "active",
                Allergies = customerDto.Allergies ?? string.Empty,
                Notes = customerDto.Notes ?? string.Empty,
                RegistrationDate = DateTime.UtcNow,
                LastVisit = DateTime.UtcNow
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            await _eventNotificationService.NotifyCustomerEvent(
                CustomerEventType.NewCustomer,
                customer
            );

            return new CustomerDTO
            {
                Id = customer.CustomerID,
                Name = customer.Name ?? string.Empty,
                Email = customer.Email ?? string.Empty,
                Phone = customer.Phone ?? string.Empty,
                Address = customer.Address ?? string.Empty,
                DateOfBirth = customer.DateOfBirth.HasValue ? customer.DateOfBirth.Value.ToString("yyyy-MM-dd") : null,
                Gender = customer.Gender ?? string.Empty,
                Insurance = customer.Insurance ?? string.Empty,
                Status = customer.Status ?? "active",
                RegistrationDate = customer.RegistrationDate.ToString("yyyy-MM-dd")
            };
        }

        public async Task<CustomerDTO?> UpdateCustomerAsync(int id, CustomerCreateDTO customerDto)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return null;
            }

            customer.Name = customerDto.Name ?? string.Empty;
            customer.Email = customerDto.Email ?? string.Empty;
            customer.Phone = customerDto.Phone ?? string.Empty;
            customer.Address = customerDto.Address ?? string.Empty;
            customer.DateOfBirth = !string.IsNullOrEmpty(customerDto.DateOfBirth) ? DateTime.Parse(customerDto.DateOfBirth) : null;
            customer.Gender = customerDto.Gender ?? string.Empty;
            customer.Insurance = customerDto.Insurance ?? string.Empty;
            customer.Status = customerDto.Status ?? "active";
            customer.Allergies = customerDto.Allergies ?? string.Empty;
            customer.Notes = customerDto.Notes ?? string.Empty;

            _context.Customers.Update(customer);
            await _context.SaveChangesAsync();

            await _eventNotificationService.NotifyCustomerEvent(
                CustomerEventType.CustomerUpdated,
                customer
            );

            return new CustomerDTO
            {
                Id = customer.CustomerID,
                Name = customer.Name ?? string.Empty,
                Email = customer.Email ?? string.Empty,
                Phone = customer.Phone ?? string.Empty,
                Address = customer.Address ?? string.Empty,
                DateOfBirth = customer.DateOfBirth.HasValue ? customer.DateOfBirth.Value.ToString("yyyy-MM-dd") : null,
                Gender = customer.Gender ?? string.Empty,
                Insurance = customer.Insurance ?? string.Empty,
                Status = customer.Status ?? "active",
                RegistrationDate = customer.RegistrationDate.ToString("yyyy-MM-dd"),
                LastVisit = customer.LastVisit.HasValue ? customer.LastVisit.Value.ToString("yyyy-MM-dd") : null
            };
        }

        public async Task<bool> DeleteCustomerAsync(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return false;
            }

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<CustomerStatsDTO> GetCustomerStatsAsync()
        {
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);

            return new CustomerStatsDTO
            {
                Total = await _context.Customers.CountAsync(),
                Active = await _context.Customers.CountAsync(c => c.Status == "active"),
                Inactive = await _context.Customers.CountAsync(c => c.Status == "inactive"),
                NewThisMonth = await _context.Customers.CountAsync(c => c.RegistrationDate >= startOfMonth),
                WithInsurance = await _context.Customers.CountAsync(c => !string.IsNullOrEmpty(c.Insurance))
            };
        }

        public async Task<CustomersResponse> GetCustomerPurchasesAsync(int id, int page = 1, int limit = 10)
        {
            var query = _context.Sales
                .Where(s => s.CustomerID == id)
                .Include(s => s.SaleDetails)
                .OrderByDescending(s => s.SaleDate);

            int total = await query.CountAsync();

            var sales = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(s => new CustomerPurchaseDTO
                {
                    Id = $"P-{s.SaleID}",
                    Date = s.SaleDate.ToString("yyyy-MM-dd"),
                    Items = s.SaleDetails != null ? s.SaleDetails.Count : 0,
                    Total = s.TotalAmount,
                    PaymentMethod = s.PaymentMethod
                })
                .ToListAsync();

            return new CustomersResponse
            {
                Customers = sales.Select(s => new CustomerDTO
                {
                    Id = int.Parse(s.Id.Replace("P-", "")),
                    Name = s.Id,
                    DateOfBirth = s.Date
                }).ToList(),
                Pagination = new PaginationDTO
                {
                    Total = total,
                    Page = page,
                    Limit = limit,
                    Pages = (int)Math.Ceiling(total / (double)limit)
                }
            };
        }
    }
}