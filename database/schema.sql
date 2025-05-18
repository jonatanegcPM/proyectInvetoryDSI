CREATE DATABASE FarmaciasBrasil;
GO

USE FarmaciasBrasil;
GO

-- Table: Roles
CREATE TABLE Roles (
    RoleID INT PRIMARY KEY IDENTITY(1,1),
    RoleName NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255),
    IsActive BIT DEFAULT 1
);

-- Table: Users
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Username NVARCHAR(50) NOT NULL,
    Password NVARCHAR(255) NOT NULL,
    RoleID INT NOT NULL,
    Email NVARCHAR(100),
    CreatedAt DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
);

-- Table: Suppliers
CREATE TABLE Suppliers (
    SupplierID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Contact NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    Address NVARCHAR(255) NOT NULL,
    Status NVARCHAR(20) DEFAULT 'active',
    Category NVARCHAR(100)
);

-- Primero, creamos la tabla Categories que necesitamos para los productos
CREATE TABLE Categories (
    CategoryID INT PRIMARY KEY IDENTITY(1,1),
    CategoryName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    IsActive BIT DEFAULT 1
);
-- Table: Products
CREATE TABLE Products (
    ProductID INT PRIMARY KEY IDENTITY(1,1),
    -- Campos originales
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    Price DECIMAL(18,2) NOT NULL,
    StockQuantity INT NOT NULL,
    ExpirationDate DATE,
    SupplierID INT,
    Barcode NVARCHAR(100),
    
    -- Campos nuevos para los endpoints
    SKU NVARCHAR(50),
    CategoryID INT,
    ReorderLevel INT,
    CostPrice DECIMAL(18,2),
    Location NVARCHAR(100),
    Status NVARCHAR(20) DEFAULT 'in-stock',
    CreatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT,
    LastUpdated DATETIME DEFAULT GETDATE(),
    
    -- Claves foráneas
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID),
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

-- Table: Customers
CREATE TABLE Customers (
    CustomerID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20),
    Email NVARCHAR(100),
    Address NVARCHAR(255),
    DateOfBirth DATE,
    Gender NVARCHAR(20),
    Insurance NVARCHAR(100),
    Status NVARCHAR(20) DEFAULT 'active',
    RegistrationDate DATETIME DEFAULT GETDATE(),
    LastVisit DATETIME,
    Allergies NVARCHAR(255),
    Notes NVARCHAR(MAX)
);

-- Table: Sales
CREATE TABLE Sales (
    SaleID INT PRIMARY KEY IDENTITY(1,1),
    SaleDate DATETIME NOT NULL,
    CustomerID INT,
    TotalAmount DECIMAL(18,2) NOT NULL,
    UserID INT NOT NULL,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Table: SaleDetails
CREATE TABLE SaleDetails (
    SaleDetailID INT PRIMARY KEY IDENTITY(1,1),
    SaleID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    Subtotal DECIMAL(18,2) NOT NULL,
    FOREIGN KEY (SaleID) REFERENCES Sales(SaleID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

-- Table: Inventory
CREATE TABLE Inventory (
    InventoryID INT PRIMARY KEY IDENTITY(1,1),
    ProductID INT NOT NULL,
    Quantity INT NOT NULL,
    LastUpdated DATETIME NOT NULL,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

CREATE TABLE InventoryTransactions (
    TransactionID INT PRIMARY KEY IDENTITY(1,1),
    ProductID INT NOT NULL,
    TransactionType NVARCHAR(50) NOT NULL, -- 'Recepción', 'Venta', 'Ajuste', etc.
    Quantity INT NOT NULL,
    PreviousStock INT NOT NULL,
    NewStock INT NOT NULL,
    TransactionDate DATETIME DEFAULT GETDATE(),
    UserID INT NOT NULL,
    Notes NVARCHAR(255),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);
-- Table: Invoices
CREATE TABLE Invoices (
    InvoiceID INT PRIMARY KEY IDENTITY(1,1),
    SaleID INT NOT NULL,
    IssueDate DATETIME NOT NULL,
    TotalAmount DECIMAL(18,2) NOT NULL,
    FOREIGN KEY (SaleID) REFERENCES Sales(SaleID)
);

-- Table: Permissions
CREATE TABLE Permissions (
    PermissionID INT PRIMARY KEY IDENTITY(1,1),
    RoleID INT NOT NULL,
    PermissionName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
);

-- Table: UserPermissions
CREATE TABLE UserPermissions (
    UserPermissionID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    PermissionID INT NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (PermissionID) REFERENCES Permissions(PermissionID)
);

-- Table: Purchases
CREATE TABLE Purchases (
    PurchaseID INT PRIMARY KEY IDENTITY(1,1),
    PurchaseDate DATETIME NOT NULL,
    SupplierID INT NOT NULL,
    TotalAmount DECIMAL(18,2) NOT NULL,
    UserID INT NOT NULL,
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Table: PurchaseDetails
CREATE TABLE PurchaseDetails (
    PurchaseDetailID INT PRIMARY KEY IDENTITY(1,1),
    PurchaseID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    Subtotal DECIMAL(18,2) NOT NULL,
    FOREIGN KEY (PurchaseID) REFERENCES Purchases(PurchaseID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

CREATE TABLE Notifications (
    Id NVARCHAR(50) PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(1000) NOT NULL,
    Type NVARCHAR(20) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    Read BIT NOT NULL DEFAULT 0,
    Category NVARCHAR(50),
    EntityId NVARCHAR(50),
    EntityType NVARCHAR(50),
    UserId INT,
    FOREIGN KEY (UserId) REFERENCES Users(UserID) ON DELETE CASCADE
);

 INSERT INTO Notifications (Id, Title, Message, Type, CreatedAt, [Read], Category, EntityId, EntityType, UserId)
VALUES 
('notif-001', 'Stock bajo de Paracetamol', 'Solo quedan 5 unidades de Paracetamol 500mg', 'warning', GETDATE(), 0, 'inventory', 'prod-123', 'product', NULL),
('notif-002', 'Actualización del sistema', 'Nueva versión 2.1 disponible', 'info', GETDATE(), 0, 'system', 'update-456', 'system', NULL),
('notif-003', 'Pedido recibido', 'El pedido #789 ha sido recibido', 'success', GETDATE(), 1, 'orders', 'order-789', 'order', 1);