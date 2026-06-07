-- Create database if not exists
CREATE DATABASE IF NOT EXISTS hospitalSQL;

-- Use database
USE hospitalSQL;

-- User Table with corrected role enum
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name varchar(255) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    role ENUM('admin', 'doctor', 'nurse', 'receptionist', 'user') NOT NULL DEFAULT 'user',
    refreshToken varchar(500) NULL,  -- Increased length for JWT token
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_refreshToken (refreshToken)
);