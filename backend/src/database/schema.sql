-- Alpha Car Rental Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS alpha_car_rental CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE alpha_car_rental;

-- ==================== USERS TABLE ====================
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('SUPER_ADMIN', 'ADMIN', 'OPERADOR', 'CLIENTE') NOT NULL DEFAULT 'CLIENTE',
  phone VARCHAR(20),
  avatar TEXT,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
);

-- ==================== CLIENTES TABLE ====================
CREATE TABLE clientes (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  company VARCHAR(255),
  country VARCHAR(100) NOT NULL,
  status ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  approved_by VARCHAR(36),
  approved_at TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_status (status),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ==================== VEHICULOS TABLE ====================
CREATE TABLE vehiculos (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  plate VARCHAR(20) UNIQUE NOT NULL,
  type ENUM('sedan', 'suv', 'truck', 'van') NOT NULL,
  status ENUM('available', 'reserved', 'maintenance', 'rented') NOT NULL DEFAULT 'available',
  daily_rate DECIMAL(10, 2) NOT NULL,
  features JSON,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_plate (plate),
  INDEX idx_status (status),
  INDEX idx_type (type)
);

-- ==================== RESERVAS TABLE ====================
CREATE TABLE reservas (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  cliente_id VARCHAR(36) NOT NULL,
  cliente_name VARCHAR(255) NOT NULL,
  vehiculo_id VARCHAR(36) NOT NULL,
  vehiculo_info VARCHAR(255) NOT NULL,
  vehiculo_alternativo_id VARCHAR(36),
  vehiculo_alternativo_info VARCHAR(255),
  vehiculo_seleccionado_id VARCHAR(36),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  anticipo_monto DECIMAL(10, 2),
  status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  approved_by VARCHAR(36),
  approved_at TIMESTAMP NULL,
  notes TEXT,
  inspeccion_data JSON,
  INDEX idx_cliente (cliente_id),
  INDEX idx_vehiculo (vehiculo_id),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ==================== CONTRATOS TABLE ====================
CREATE TABLE contratos (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  reserva_id VARCHAR(36) UNIQUE NOT NULL,
  cliente_id VARCHAR(36) NOT NULL,
  cliente_name VARCHAR(255) NOT NULL,
  vehiculo_info VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  terms JSON,
  signed_date TIMESTAMP NULL,
  status ENUM('draft', 'active', 'completed', 'terminated') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  contrato_data JSON,
  firma_cliente LONGTEXT,
  firma_representante LONGTEXT,
  INDEX idx_reserva (reserva_id),
  INDEX idx_cliente (cliente_id),
  INDEX idx_status (status),
  FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- ==================== FACTURAS TABLE ====================
CREATE TABLE facturas (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  reserva_id VARCHAR(36) NOT NULL,
  cliente_id VARCHAR(36) NOT NULL,
  cliente_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  anticipo DECIMAL(10, 2),
  monto_pendiente DECIMAL(10, 2) NOT NULL,
  extras DECIMAL(10, 2),
  status ENUM('pending', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'pending',
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE NULL,
  payment_method VARCHAR(50),
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reserva (reserva_id),
  INDEX idx_cliente (cliente_id),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date),
  FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ==================== DAMAGE_REPORTS TABLE ====================
CREATE TABLE damage_reports (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  vehiculo_id VARCHAR(36) NOT NULL,
  vehiculo_info VARCHAR(255) NOT NULL,
  cliente_id VARCHAR(36),
  cliente_name VARCHAR(255),
  fecha DATE NOT NULL,
  danos JSON NOT NULL,
  total_estimado DECIMAL(10, 2) NOT NULL,
  estado ENUM('en_revision', 'reparado') NOT NULL DEFAULT 'en_revision',
  created_by VARCHAR(36),
  reparado_fecha DATE NULL,
  factura_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vehiculo (vehiculo_id),
  INDEX idx_estado (estado),
  INDEX idx_fecha (fecha),
  FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ==================== INSPECCIONES TABLE ====================
CREATE TABLE inspecciones (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  reserva_id VARCHAR(36) NOT NULL,
  vehiculo_id VARCHAR(36) NOT NULL,
  vehiculo_marca VARCHAR(100),
  vehiculo_modelo VARCHAR(100),
  vehiculo_placa VARCHAR(20),
  unidad VARCHAR(50),
  tipo ENUM('entrega', 'devolucion') NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  kilometraje INT NOT NULL,
  nivel_combustible INT NOT NULL,
  checklist_interior JSON,
  checklist_exterior JSON,
  danos JSON,
  danos_visuales JSON,
  fotos JSON,
  observaciones TEXT,
  inspeccionado_por VARCHAR(36),
  firma_cliente LONGTEXT,
  firma_representante LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reserva (reserva_id),
  INDEX idx_vehiculo (vehiculo_id),
  INDEX idx_tipo (tipo),
  FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
  FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
  FOREIGN KEY (inspeccionado_por) REFERENCES users(id) ON DELETE SET NULL
);

-- ==================== EXTRAS TABLE ====================
CREATE TABLE extras (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  reserva_id VARCHAR(36) NOT NULL,
  tipo ENUM('dias_extra', 'kilometraje', 'combustible', 'dano', 'otro') NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  cantidad DECIMAL(10, 2) NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  fecha DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reserva (reserva_id),
  INDEX idx_tipo (tipo),
  FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE
);

-- ==================== ANTICIPOS TABLE ====================
CREATE TABLE anticipos (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  reserva_id VARCHAR(36) NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  fecha DATE NOT NULL,
  concepto ENUM('deposito', 'anticipo') NOT NULL,
  metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia') NOT NULL,
  recibido_por VARCHAR(36),
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reserva (reserva_id),
  FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
  FOREIGN KEY (recibido_por) REFERENCES users(id) ON DELETE SET NULL
);

-- ==================== SEED DATA ====================
-- Usuario Super Admin por defecto (password: admin123)
INSERT INTO users (id, name, email, password_hash, role, phone, status) VALUES
('sa-001', 'Valeria Rodríguez', 'valeria@sistema.com', '$2a$10$k2qO9rBqz8OhZXYgQ4kVYeYr8yCz7HRnJqXBh8wLQlXX.GzXxDjVG', 'SUPER_ADMIN', '+1 (234) 555-0001', 'active');

-- Usuario Admin por defecto (password: admin123)
INSERT INTO users (id, name, email, password_hash, role, phone, status) VALUES
('adm-001', 'Carlos Mendoza', 'carlos@alpha.com', '$2a$10$k2qO9rBqz8OhZXYgQ4kVYeYr8yCz7HRnJqXBh8wLQlXX.GzXxDjVG', 'ADMIN', '+1 (234) 555-0002', 'active');

-- Usuario Operador por defecto (password: oper123)
INSERT INTO users (id, name, email, password_hash, role, phone, status) VALUES
('op-001', 'Ana García', 'ana@alpha.com', '$2a$10$k2qO9rBqz8OhZXYgQ4kVYeYr8yCz7HRnJqXBh8wLQlXX.GzXxDjVG', 'OPERADOR', '+1 (234) 555-0003', 'active');
