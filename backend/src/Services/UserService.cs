using Microsoft.EntityFrameworkCore;
using proyectInvetoryDSI.Data;
using proyectInvetoryDSI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using BCrypt.Net;

namespace proyectInvetoryDSI.Services
{
    public class UserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

            public async Task<List<User>> GetAllUsersAsync()
        {
            return await _context.Users.Include(u => u.Role).ToListAsync();
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.UserID == id);
        }


        public async Task<User> AddUserAsync(User user)
        {
            // Validar si el email ya existe
            var emailExists = await _context.Users.AnyAsync(u => u.Email == user.Email);
            if (emailExists)
            {
                throw new InvalidOperationException("El correo electrónico ya está registrado");
            }

            // Validar si el username ya existe
            var usernameExists = await _context.Users.AnyAsync(u => u.Username == user.Username);
            if (usernameExists)
            {
                throw new InvalidOperationException("El nombre de usuario ya está en uso");
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            
            // Cargar la información del rol
            var createdUser = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserID == user.UserID);

            if (createdUser == null)
            {
                throw new Exception("Error al recuperar el usuario recién creado");
            }
            
            return createdUser;
        }
            public async Task UpdateUserAsync(User user)
        {
            // Validar si el email ya existe en otro usuario
            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == user.Email && u.UserID != user.UserID);
            if (emailExists)
            {
                throw new InvalidOperationException("El correo electrónico ya está registrado en otro usuario");
            }

            // Validar si el username ya existe en otro usuario
            var usernameExists = await _context.Users
                .AnyAsync(u => u.Username == user.Username && u.UserID != user.UserID);
            if (usernameExists)
            {
                throw new InvalidOperationException("El nombre de usuario ya está en uso por otro usuario");
            }

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<User?> AuthenticateAsync(string email, string password)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                return null;
            }

            var user = await _context.Users
                .Include(u => u.Role)
                .SingleOrDefaultAsync(u => u.Email == email);

            if (user == null || !VerifyPasswordHash(password, user.Password))
            {
                return null;
            }

            return user;
        }

        private bool VerifyPasswordHash(string password, string storedHash)
        {
            return BCrypt.Net.BCrypt.Verify(password, storedHash);
        }
    }
}