-- Crear usuario de base de datos si no existe y dar permisos
CREATE USER IF NOT EXISTS 'bgr'@'%' IDENTIFIED BY '6900';
GRANT ALL PRIVILEGES ON *.* TO 'bgr'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;