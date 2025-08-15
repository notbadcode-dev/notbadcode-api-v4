USE auth_db;

-- Insertar usuarios de prueba
INSERT INTO
    users (email, passwordHash)
VALUES
    (
        'admin@test.com',
        '$2b$10$pD53uN6NY5M4lFTU4/s5m.NUN9DHYhRzp2kbbSUbS4xoc/rCXDZDO'
    ),
    (
        'user@test.com',
        '$2b$10$pD53uN6NY5M4lFTU4/s5m.NUN9DHYhRzp2kbbSUbS4xoc/rCXDZDO'
    ),
    (
        'test@test.com',
        '$2b$10$pD53uN6NY5M4lFTU4/s5m.NUN9DHYhRzp2kbbSUbS4xoc/rCXDZDO'
    );