const express = require('express');
const app = express();

// ========== НАЛАШТУВАННЯ КОДУВАННЯ ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware для правильного кодування UTF-8
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});

// ========== ДАНІ (українською для коректної фільтрації) ==========
let students = [
    { id: 1, name: 'Іван Петренко', group: 'ІП-01', email: 'ivan.petrenko@kpi.ua' },
    { id: 2, name: 'Марія Шевченко', group: 'ІП-01', email: 'maria.shevchenko@kpi.ua' },
    { id: 3, name: 'Олексій Коваленко', group: 'ІП-02', email: 'oleksiy.kovalenko@kpi.ua' },
    { id: 4, name: 'Анна Мельник', group: 'ІП-02', email: 'anna.melnyk@kpi.ua' },
    { id: 5, name: 'Дмитро Бондаренко', group: 'ІП-03', email: 'dmytro.bondarenko@kpi.ua' }
];

let nextId = 6;

// ========== МАРШРУТИ ==========

// Кореневий маршрут
app.get('/', (req, res) => {
    res.json({
        message: 'Лабораторна робота №1 (Частина 2)',
        description: 'REST API для керування студентами',
        endpoints: {
            students: {
                GET_all: 'GET /students',
                GET_one: 'GET /students/:id',
                GET_by_group: 'GET /students/group/:group',
                POST: 'POST /students',
                PUT: 'PUT /students/:id',
                PATCH: 'PATCH /students/:id',
                DELETE: 'DELETE /students/:id',
                stats: 'GET /stats'
            }
        }
    });
});

// GET /students - отримати всіх студентів (з фільтрацією)
app.get('/students', (req, res) => {
    let { group, name } = req.query;
    let result = [...students];

    // Фільтрація за групою (з декодуванням URL)
    if (group) {
        const decodedGroup = decodeURIComponent(group);
        result = result.filter(s => s.group === decodedGroup);
    }

    // Фільтрація за ім'ям (частковий збіг, регістронезалежний)
    if (name) {
        const decodedName = decodeURIComponent(name);
        result = result.filter(s => s.name.toLowerCase().includes(decodedName.toLowerCase()));
    }

    res.json({
        count: result.length,
        students: result
    });
});

// GET /students/:id - отримати студента за ID
app.get('/students/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const student = students.find(s => s.id === id);

    if (student) {
        res.json(student);
    } else {
        res.status(404).json({ error: `Студента з ID ${id} не знайдено` });
    }
});

// GET /students/group/:group - отримати студентів за групою (виправлено)
app.get('/students/group/:group', (req, res) => {
    try {
        const group = decodeURIComponent(req.params.group);
        const groupStudents = students.filter(s => s.group === group);

        if (groupStudents.length === 0) {
            return res.status(404).json({ error: `Студентів у групі ${group} не знайдено` });
        }

        res.json({
            group,
            count: groupStudents.length,
            students: groupStudents
        });
    } catch (error) {
        res.status(500).json({ error: 'Внутрішня помилка сервера' });
    }
});

// POST /students - додати нового студента
app.post('/students', (req, res) => {
    const { name, group, email } = req.body;

    if (!name || !group || !email) {
        return res.status(400).json({ 
            error: 'Відсутні обов\'язкові поля. Потрібно: name, group, email' 
        });
    }

    if (students.some(s => s.email === email)) {
        return res.status(409).json({ error: `Студент з email ${email} вже існує` });
    }

    const newStudent = {
        id: nextId++,
        name,
        group,
        email
    };

    students.push(newStudent);
    res.status(201).json({
        message: 'Студента успішно додано',
        student: newStudent
    });
});

// PUT /students/:id - повне оновлення студента
app.put('/students/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, group, email } = req.body;
    
    const studentIndex = students.findIndex(s => s.id === id);

    if (studentIndex === -1) {
        return res.status(404).json({ error: `Студента з ID ${id} не знайдено` });
    }

    if (email && email !== students[studentIndex].email) {
        if (students.some(s => s.email === email)) {
            return res.status(409).json({ error: `Студент з email ${email} вже існує` });
        }
    }

    if (name) students[studentIndex].name = name;
    if (group) students[studentIndex].group = group;
    if (email) students[studentIndex].email = email;

    res.json({
        message: 'Дані студента успішно оновлено',
        student: students[studentIndex]
    });
});

// PATCH /students/:id - часткове оновлення студента (ДОДАНО)
app.patch('/students/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    const studentIndex = students.findIndex(s => s.id === id);

    if (studentIndex === -1) {
        return res.status(404).json({ error: `Студента з ID ${id} не знайдено` });
    }

    // Перевірка унікальності email при зміні
    if (updates.email && updates.email !== students[studentIndex].email) {
        if (students.some(s => s.email === updates.email)) {
            return res.status(409).json({ error: `Студент з email ${updates.email} вже існує` });
        }
    }

    // Часткове оновлення
    Object.assign(students[studentIndex], updates);

    res.json({
        message: 'Дані студента успішно оновлено',
        student: students[studentIndex]
    });
});

// DELETE /students/:id - видалити студента
app.delete('/students/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const studentIndex = students.findIndex(s => s.id === id);

    if (studentIndex === -1) {
        return res.status(404).json({ error: `Студента з ID ${id} не знайдено` });
    }

    const deletedStudent = students[studentIndex];
    students.splice(studentIndex, 1);

    res.json({
        message: 'Студента успішно видалено',
        student: deletedStudent
    });
});

// GET /stats - статистика
app.get('/stats', (req, res) => {
    const groups = {};
    students.forEach(s => {
        groups[s.group] = (groups[s.group] || 0) + 1;
    });

    res.json({
        totalStudents: students.length,
        groups,
        groupsList: Object.keys(groups)
    });
});

// Обробка неіснуючих маршрутів
app.use((req, res) => {
    res.status(404).json({ error: `Маршрут ${req.method} ${req.url} не знайдено` });
});

// Глобальна обробка помилок
app.use((err, req, res, next) => {
    console.error('Помилка сервера:', err);
    res.status(500).json({ error: 'Внутрішня помилка сервера' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
    console.log('📋 Доступні ендпоінти:');
    console.log(`   GET    /students              - всі студенти`);
    console.log(`   GET    /students/:id          - студент за ID`);
    console.log(`   GET    /students/group/:group - студенти за групою`);
    console.log(`   POST   /students              - додати студента`);
    console.log(`   PUT    /students/:id          - оновити студента`);
    console.log(`   PATCH  /students/:id          - часткове оновлення`);
    console.log(`   DELETE /students/:id          - видалити студента`);
    console.log(`   GET    /stats                 - статистика`);
    console.log('='.repeat(50));
});