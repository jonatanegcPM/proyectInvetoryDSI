﻿using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using proyectInvetoryDSI.Data;
using proyectInvetoryDSI.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Configuración de la base de datos
var configuration = new ConfigurationBuilder()
    .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "src")) 
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .Build();

// Registrar DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

// Configuración de JWT
var jwtSettings = configuration.GetSection("Jwt");
if (jwtSettings["Key"] == null || jwtSettings["Issuer"] == null || jwtSettings["Audience"] == null)
{
    throw new InvalidOperationException("La configuración de JWT no está completa en appsettings.json.");
}

var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key),
        // Añade estas líneas para mapear correctamente los claims
        NameClaimType = ClaimTypes.Name,
        RoleClaimType = ClaimTypes.Role
    };
});

// Configuración de autorización para roles
builder.Services.AddAuthorization(options =>
{
    // Esta política asegura que el usuario tenga el claim Role con valor "Admin"
    options.AddPolicy("AdminOnly", policy => 
        policy.RequireRole("Admin"));
    
    // Opcional: política alternativa que busca en ambos claims
    options.AddPolicy("AdminPolicy", policy => 
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => 
                (c.Type == ClaimTypes.Role && c.Value == "Admin") ||
                (c.Type == "RoleName" && c.Value == "Admin")
            )
        ));
});

// Configuración de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder.WithOrigins("https://proyectinvetorydsi.onrender.com") 
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials(); 
    });
});

// Registrar servicios
builder.Services.AddScoped<CustomerService>();
builder.Services.AddScoped<SupplierService>();
builder.Services.AddScoped<PurchaseService>();
builder.Services.AddScoped<IPosService, PosService>();
builder.Services.AddScoped<RoleService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<IPosService, PosService>(); 
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IEventNotificationService, EventNotificationService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<ISettingsService, SettingsService>();
builder.Services.AddScoped<INotificationSettingsService, NotificationSettingsService>();
builder.Services.AddHttpContextAccessor();
// Configuración de la API
builder.Services.AddControllers();
builder.Services.AddHostedService<InventoryCheckService>();

var app = builder.Build();

// Configuración del pipeline de la API
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseRouting();

// Habilitar CORS
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();