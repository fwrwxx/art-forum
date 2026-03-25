-- Використання бази даних
USE web_backend_lab;

-- ========== SELECT запити ==========

-- Отримати всіх користувачів
SELECT * FROM users;

-- Отримати всіх художників
SELECT * FROM users WHERE role = 'artist';

-- Отримати всі опубліковані пости
SELECT * FROM posts WHERE status = 'published';

-- Отримати пости з інформацією про автора (JOIN)
SELECT p.id, p.title, p.content, p.status, u.name as author, u.email
FROM posts p
JOIN users u ON p.userId = u.id
WHERE p.status = 'published';

-- ========== INSERT запити ==========

-- Додати нового користувача
INSERT INTO users (name, email, role, bio) 
VALUES ('Дмитро Бондаренко', 'dmytro@example.com', 'artist', 'Художник-пейзажист');

-- Додати новий пост
INSERT INTO posts (title, content, status, userId) 
VALUES ('Нова техніка малювання', 'Сьогодні я спробував нову техніку...', 'published', 1);

-- ========== UPDATE запити ==========

-- Оновити дані користувача
UPDATE users 
SET bio = 'Професійний художник-ілюстратор, 5 років досвіду' 
WHERE id = 1;

-- Опублікувати чернетку
UPDATE posts 
SET status = 'published' 
WHERE id = 4 AND status = 'draft';

-- ========== DELETE запити ==========

-- Видалити пост (з обережністю!)
DELETE FROM posts WHERE id = 4;

-- Видалити користувача (каскадно видалить його пости)
DELETE FROM users WHERE id = 4;

-- ========== Агрегаційні запити ==========

-- Кількість користувачів за ролями
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;

-- Кількість постів за статусами
SELECT status, COUNT(*) as count 
FROM posts 
GROUP BY status;

-- Кількість постів у кожного автора
SELECT u.name, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.userId
GROUP BY u.id, u.name
ORDER BY post_count DESC;

-- ========== Пошукові запити ==========

-- Пошук користувачів за ім'ям
SELECT * FROM users WHERE name LIKE '%Іван%';

-- Пошук постів за заголовком
SELECT * FROM posts WHERE title LIKE '%цифровий%';

-- ========== Очищення даних ==========

-- Видалити всі чернетки
DELETE FROM posts WHERE status = 'draft';

-- Видалити неактивних користувачів
DELETE FROM users WHERE isActive = FALSE;