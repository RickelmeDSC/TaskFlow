CREATE DATABASE IF NOT EXISTS taskflow_db;
USE taskflow_db;

CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pendente', 'concluida') DEFAULT 'pendente',
    priority ENUM('baixa', 'media', 'alta') DEFAULT 'media',
    category ENUM('lazer', 'estudo', 'trabalho', 'saude', 'casa', 'compras', 'outros') DEFAULT 'outros',
    due_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);