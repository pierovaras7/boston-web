-- Crear tabla para registro de postulaciones
CREATE TABLE IF NOT EXISTS admissions_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_name VARCHAR(100) NOT NULL,
  student_age INT,
  grade VARCHAR(50),
  parent_name VARCHAR(100) NOT NULL,
  parent_phone VARCHAR(20),
  parent_email VARCHAR(100) NOT NULL,
  preferred_contact VARCHAR(20) DEFAULT 'phone',
  language VARCHAR(5) DEFAULT 'es',
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  notes TEXT,
  INDEX idx_email (parent_email),
  INDEX idx_created (created_at),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
