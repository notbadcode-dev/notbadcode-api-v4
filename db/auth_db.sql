-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS `auth_db` DEFAULT CHARACTER
SET
    utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci;

USE `auth_db`;

-- Crear tabla 'users' con buenas prácticas
CREATE TABLE
    IF NOT EXISTS `users` (
        `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
        `email` VARCHAR(255) NOT NULL,
        `passwordHash` VARCHAR(255) NOT NULL,
        `createdAt` DATETIME (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        `updatedAt` DATETIME (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        `deletedAt` DATETIME (6) DEFAULT NULL,
        `lastLoginAt` DATETIME (6) DEFAULT NULL,
        `lastLogoutAt` DATETIME (6) DEFAULT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `UX_users_email` (`email`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;