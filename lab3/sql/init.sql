-- Створення бази даних
CREATE DATABASE IF NOT EXISTS auth_lab3;
USE auth_lab3;

-- Таблиця користувачів
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('user', 'admin') DEFAULT 'user',
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires DATETIME,
    login_attempts INT DEFAULT 0,
    locked_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Таблиця refresh токенів
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(500) NOT NULL,
    user_id INT NOT NULL,
    expires_at DATETIME NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token(255)),
    INDEX idx_user_id (user_id)
);

-- Таблиця логів помилок
CREATE TABLE IF NOT EXISTS error_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    error_message TEXT,
    error_stack TEXT,
    url VARCHAR(500),
    method VARCHAR(10),
    ip VARCHAR(45),
    user_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
);

-- Вставка тестового адміна
INSERT INTO users (email, password_hash, full_name, role, is_email_verified) 
VALUES ('admin@arthub.com', '$2a$10$YourHashedPasswordHere', 'Admin User', 'admin', TRUE);

-- Вставка тестового користувача
INSERT INTO users (email, password_hash, full_name, role, is_email_verified) 
VALUES ('user@example.com', '$2a$10$YourHashedPasswordHere', 'Test User', 'user', TRUE);