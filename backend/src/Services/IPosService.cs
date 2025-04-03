using System.Threading.Tasks;
using proyectInvetoryDSI.DTOs;

namespace proyectInvetoryDSI.Services
{
    public interface IPosService
    {
        Task<ProductResponse> GetProducts(string search, int page, int limit);
        Task<ProductDTO?> GetProductByBarcode(string barcode);
        Task<CustomersResponse> GetCustomers();
        Task<SaleResponseDTO> CreateSale(CreateSaleDTO saleDto, int userId);
    }
}