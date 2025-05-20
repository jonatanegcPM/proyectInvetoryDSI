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
            public async Task<User> UpdateUserAsync(User user)
        {
            // Obtener el usuario existente
            var existingUser = await _context.Users.FindAsync(user.UserID);
            if (existingUser == null)
            {
                throw new InvalidOperationException("Usuario no encontrado");
            }

            // Validar email solo si se proporciona uno nuevo
            if (!string.IsNullOrEmpty(user.Email) && user.Email != existingUser.Email)
            {
                var emailExists = await _context.Users
                    .AnyAsync(u => u.Email == user.Email && u.UserID != user.UserID);
                if (emailExists)
                {
                    throw new InvalidOperationException("El correo electrónico ya está registrado en otro usuario");
                }
                existingUser.Email = user.Email;
            }

            // Validar username solo si se proporciona uno nuevo
            if (!string.IsNullOrEmpty(user.Username) && user.Username != existingUser.Username)
            {
                var usernameExists = await _context.Users
                    .AnyAsync(u => u.Username == user.Username && u.UserID != user.UserID);
                if (usernameExists)
                {
                    throw new InvalidOperationException("El nombre de usuario ya está en uso por otro usuario");
                }
                existingUser.Username = user.Username;
            }

            // Actualizar nombre solo si se proporciona uno nuevo
            if (!string.IsNullOrEmpty(user.Name))
            {
                existingUser.Name = user.Name;
            }

            // Actualizar contraseña solo si se proporciona una nueva
            if (!string.IsNullOrEmpty(user.Password))
            {
                existingUser.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
            }

            _context.Users.Update(existingUser);
            await _context.SaveChangesAsync();

            // Retornar el usuario actualizado con su rol
            var updatedUser = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserID == user.UserID);

            if (updatedUser == null)
            {
                throw new InvalidOperationException("Error al recuperar el usuario actualizado");
            }

            return updatedUser;
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