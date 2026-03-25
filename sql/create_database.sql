-- Створення бази даних
CREATE DATABASE IF NOT EXISTS web_backend_lab
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Використання бази даних
USE web_backend_lab;

-- Таблиця користувачів
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('artist', 'collector', 'admin') DEFAULT 'artist',
    bio TEXT,
    avatar VARCHAR(255),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Таблиця постів
CREATE TABLE IF NOT EXISTS posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    views INT DEFAULT 0,
    userId INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_status (status)
);

-- Вставка тестових даних
INSERT INTO users (name, email, role, bio) VALUES
('Іван Петренко', 'ivan@example.com', 'artist', 'Художник-ілюстратор'),
('Марія Шевченко', 'maria@example.com', 'artist', 'Цифровий художник'),
('Олексій Коваленко', 'oleksiy@example.com', 'collector', 'Колекціонер мистецтва'),
('Анна Мельник', 'anna@example.com', 'admin', 'Адміністратор платформи');

INSERT INTO posts (title, content, status, userId) VALUES
('Вступ до цифрового живопису', 'У цій статті я розповім про основи цифрового живопису...', 'published', 1),
('Як обрати графічний планшет', 'Поради для початківців щодо вибору графічного планшета...', 'published', 1),
('Моя творча подорож', 'Розповідь про те, як я почала займатися мистецтвом...', 'published', 2);