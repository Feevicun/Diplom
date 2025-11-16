import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import pool from './db.js';
import { fileURLToPath } from "url";
import jwt from 'jsonwebtoken';
import ChatWebSocketServer from './websocket-server.ts';
// __dirname для ES-модулів
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT) || 4000;
// JWT секрет (поки що тут, пізніше краще винести в env)
const JWT_SECRET = "super_secret_key_change_this";
// Middleware
app.use(cors({
    origin: "*",
    credentials: true
}));
app.use(express.json());
// Структури проектів
const PROJECT_STRUCTURES = {
    diploma: [
        { key: 'intro', name: 'Вступ' },
        { key: 'theory', name: 'Теоретична частина' },
        { key: 'design', name: 'Проектна частина' },
        { key: 'implementation', name: 'Реалізація' },
        { key: 'conclusion', name: 'Висновки' },
        { key: 'sources', name: 'Список літератури' },
        { key: 'appendix', name: 'Додатки' },
        { key: 'abstract', name: 'Реферат' },
        { key: 'cover', name: 'Титульна сторінка' },
        { key: 'content', name: 'Зміст' }
    ],
    coursework: [
        { key: 'intro', name: 'Вступ' },
        { key: 'theory', name: 'Теоретична частина' },
        { key: 'design', name: 'Практична частина' },
        { key: 'conclusion', name: 'Висновки' },
        { key: 'sources', name: 'Список літератури' },
        { key: 'appendix', name: 'Додатки' },
        { key: 'cover', name: 'Титульна сторінка' },
        { key: 'content', name: 'Зміст' }
    ],
    practice: [
        { key: 'intro', name: 'Вступ' },
        { key: 'tasks', name: 'Завдання практики' },
        { key: 'diary', name: 'Щоденник практики' },
        { key: 'report', name: 'Звіт про практику' },
        { key: 'conclusion', name: 'Висновки' },
        { key: 'sources', name: 'Список літератури' },
        { key: 'appendix', name: 'Додатки' }
    ]
};
// Функція для ініціалізації структури проекту
async function initializeProjectStructure(userId, projectType) {
    const structure = PROJECT_STRUCTURES[projectType];
    if (!structure) {
        throw new Error(`Unknown project type: ${projectType}`);
    }
    // Видаляємо існуючі записи для цього користувача та типу проекту
    await pool.query('DELETE FROM user_chapters WHERE user_id = $1 AND project_type = $2', [userId, projectType]);
    // Створюємо нові записи для всіх глав
    for (const chapter of structure) {
        await pool.query(`INSERT INTO user_chapters 
       (user_id, project_type, chapter_key, progress, status, student_note, created_at, updated_at)
       VALUES ($1, $2, $3, 0, 'pending', '', NOW(), NOW())
       ON CONFLICT (user_id, project_type, chapter_key) 
       DO NOTHING`, [userId, projectType, chapter.key]);
    }
}
// ============ API ROUTES ============
// Middleware для аутентифікації через JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token)
        return res.status(401).json({ message: "No token provided" });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err)
            return res.status(403).json({ message: "Invalid token" });
        // Here we assert that decoded is JwtUserPayload
        req.user = decoded;
        next();
    });
}
// Отримати всіх користувачів
app.get("/api/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, email, role, faculty_id, department_id FROM users ORDER BY id");
        res.json(result.rows);
    }
    catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Database error fetching users" });
    }
});
// POST /api/register
app.post("/api/register", async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, facultyId, departmentId } = req.body;
        const name = `${firstName.trim()} ${lastName.trim()}`;
        if (!facultyId || !departmentId) {
            return res.status(400).json({ message: "Faculty and department must be selected" });
        }
        const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "User with this email already exists" });
        }
        const result = await pool.query(`INSERT INTO users (name, email, password, role, faculty_id, department_id, registeredAt) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING id, name, email, role, faculty_id, department_id, registeredAt`, [name, email, password, role, facultyId, departmentId]);
        res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
});
// GET /api/faculties
app.get("/api/faculties", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name FROM faculties ORDER BY id");
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
});
// GET /api/faculties/:facultyId/departments
app.get("/api/faculties/:facultyId/departments", async (req, res) => {
    try {
        const facultyId = Number(req.params.facultyId);
        if (isNaN(facultyId)) {
            return res.status(400).json({ message: "Invalid faculty ID" });
        }
        const result = await pool.query("SELECT id, name FROM departments WHERE faculty_id = $1 ORDER BY id", [facultyId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Departments not found" });
        }
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
});
// POST /api/login
app.post("/api/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const result = await pool.query(`SELECT id, name, email, role FROM users 
       WHERE email = $1 AND password = $2 AND role = $3`, [email.trim(), password.trim(), role]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid email, password or role" });
        }
        const user = result.rows[0];
        // Генеруємо JWT токен
        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
        await pool.query("UPDATE users SET lastLoginAt = NOW() WHERE email = $1", [email.trim()]);
        res.json({ message: "Login successful", user, token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
});
// GET /api/current-user 
app.get('/api/current-user', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const result = await pool.query(`SELECT 
        u.id,
        u.name, 
        u.email, 
        u.role, 
        u.faculty_id,
        u.department_id,
        f.name as faculty_name,
        d.name as department_name
       FROM users u
       LEFT JOIN faculties f ON u.faculty_id = f.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = $1`, [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userData = result.rows[0];
        // Розділяємо ім'я на частини
        const [firstName, ...lastNameParts] = userData.name.split(' ');
        const lastName = lastNameParts.join(' ');
        res.json({
            user: {
                id: userData.id,
                firstName,
                lastName,
                email: userData.email,
                role: userData.role,
                faculty_id: userData.faculty_id,
                department_id: userData.department_id,
                faculty_name: userData.faculty_name,
                department_name: userData.department_name
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});
// POST /api/logout
app.post("/api/logout", async (req, res) => {
    try {
        const { email } = req.body;
        const result = await pool.query("UPDATE users SET lastLogoutAt = NOW() WHERE email = $1 RETURNING email, lastLogoutAt", [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "Logout successful", ...result.rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
});
// PUT /api/update-profile
// app.put("/api/update-profile", async (req: Request, res: Response) => {
//   try {
//     const { id, name, email, avatarUrl } = req.body;
//     if (!id) {
//       return res.status(400).json({ message: "User id is required" });
//     }
//     // Оновлення користувача
//     const result = await pool.query(
//       `UPDATE users
//        SET name = $1, email = $2, avatar_url = $3
//        WHERE id = $4
//        RETURNING id, name, email, role, avatar_url`,
//       [name, email, avatarUrl, id]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.json({ message: "Profile updated successfully", user: result.rows[0] });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Database error" });
//   }
// });
// API для перевірки користувача при забутому паролі
app.post("/api/forgot-password/verify", async (req, res) => {
    try {
        const { email, role } = req.body;
        if (!email || !role) {
            return res.status(400).json({ message: "Email and role are required" });
        }
        // Перевіряємо чи існує користувач з такою поштою та роллю
        const result = await pool.query("SELECT id, email, role FROM users WHERE email = $1 AND role = $2", [email, role]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        // Повертаємо успішну відповідь (без паролю!)
        res.json({
            message: "User found",
            user: {
                id: result.rows[0].id,
                email: result.rows[0].email,
                role: result.rows[0].role
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
});
// API для зміни паролю
app.post("/api/forgot-password/reset", async (req, res) => {
    try {
        const { email, role, newPassword } = req.body;
        if (!email || !role || !newPassword) {
            return res.status(400).json({ message: "Email, role and new password are required" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        // Знаходимо користувача
        const userResult = await pool.query("SELECT id FROM users WHERE email = $1 AND role = $2", [email, role]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        const userId = userResult.rows[0].id;
        // Оновлюємо пароль в БД
        await pool.query("UPDATE users SET password = $1 WHERE id = $2", [newPassword, userId]);
        res.json({ message: "Password updated successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
});
// POST /api/events - створення події
app.post("/api/events", authenticateToken, async (req, res) => {
    try {
        const { title, date, type, time, location, link, description, completed } = req.body;
        const userEmail = req.user?.email;
        if (!userEmail || !title || !date || !type) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const result = await pool.query(`INSERT INTO events ("userEmail", title, date, type, time, location, link, description, completed) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, [userEmail, title, date, type, time, location, link, description, completed || false]);
        res.status(201).json({ message: "Event created successfully", event: result.rows[0] });
    }
    catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ message: "Database error creating event" });
    }
});
// GET /api/events - отримання подій
app.get("/api/events", authenticateToken, async (req, res) => {
    try {
        const userEmail = req.user?.email;
        if (!userEmail)
            return res.status(401).json({ message: "Unauthorized" });
        const result = await pool.query(`SELECT id, title, date, type, time, location, link, description, completed
       FROM events 
       WHERE "userEmail" = $1 
       ORDER BY date`, [userEmail]);
        res.json(result.rows);
    }
    catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Database error fetching events" });
    }
});
// PUT /api/events/:id - оновлення події
app.put("/api/events/:id", authenticateToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        const { title, date, type, time, location, link, description, completed } = req.body;
        const userEmail = req.user?.email;
        if (!userEmail) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const existingEvent = await pool.query('SELECT id FROM events WHERE id = $1 AND "userEmail" = $2', [eventId, userEmail]);
        if (existingEvent.rows.length === 0) {
            return res.status(404).json({ message: "Event not found or access denied" });
        }
        const result = await pool.query(`UPDATE events 
       SET title = $1, date = $2, type = $3, time = $4, location = $5, link = $6, description = $7, completed = $8
       WHERE id = $9 AND "userEmail" = $10
       RETURNING *`, [title, date, type, time, location, link, description, completed, eventId, userEmail]);
        res.json({ message: "Event updated successfully", event: result.rows[0] });
    }
    catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ message: "Database error updating event" });
    }
});
// DELETE /api/events/:id - видалення події
app.delete("/api/events/:id", authenticateToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        const userEmail = req.user?.email;
        if (!userEmail) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const existingEvent = await pool.query('SELECT id FROM events WHERE id = $1 AND "userEmail" = $2', [eventId, userEmail]);
        if (existingEvent.rows.length === 0) {
            return res.status(404).json({ message: "Event not found or access denied" });
        }
        await pool.query('DELETE FROM events WHERE id = $1 AND "userEmail" = $2', [eventId, userEmail]);
        res.json({ message: "Event deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ message: "Database error deleting event" });
    }
});
// GET /api/user-project - отримати активний тип проекту користувача
app.get("/api/user-project", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const result = await pool.query('SELECT active_project_type FROM user_projects WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.json({ projectType: null });
        }
        res.json({ projectType: result.rows[0].active_project_type });
    }
    catch (err) {
        console.error('Error getting project type:', err);
        res.status(500).json({ message: 'Database error' });
    }
});
// POST /api/user-project - встановити активний тип проекту
app.post("/api/user-project", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { projectType } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!projectType || !['diploma', 'coursework', 'practice'].includes(projectType)) {
            return res.status(400).json({ message: "Invalid project type" });
        }
        // Оновлюємо або створюємо запис користувача з активним типом проекту
        await pool.query(`INSERT INTO user_projects (user_id, active_project_type, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET active_project_type = $2, updated_at = NOW()`, [userId, projectType]);
        // Ініціалізуємо структуру проекту
        await initializeProjectStructure(userId, projectType);
        res.json({
            message: "Project type set successfully",
            projectType
        });
    }
    catch (err) {
        console.error('Error setting project type:', err);
        res.status(500).json({ message: 'Database error' });
    }
});
// GET /api/user-chapters - отримати глави користувача для активного проекту
app.get("/api/user-chapters", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { projectType } = req.query;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!projectType) {
            return res.status(400).json({ message: "Project type is required" });
        }
        const result = await pool.query(`SELECT 
        ROW_NUMBER() OVER (ORDER BY 
          CASE chapter_key 
            WHEN 'intro' THEN 1
            WHEN 'theory' THEN 2  
            WHEN 'design' THEN 3
            WHEN 'implementation' THEN 4
            WHEN 'tasks' THEN 2
            WHEN 'diary' THEN 3
            WHEN 'conclusion' THEN 5
            WHEN 'report' THEN 6
            WHEN 'appendix' THEN 7
            WHEN 'sources' THEN 8
            WHEN 'abstract' THEN 9
            WHEN 'cover' THEN 10
            WHEN 'content' THEN 11
            ELSE 99 
          END
        ) as id,
        chapter_key as key,
        progress,
        status,
        student_note,
        uploaded_file_name,
        uploaded_file_date,
        uploaded_file_size
       FROM user_chapters 
       WHERE user_id = $1 AND project_type = $2
       ORDER BY 
         CASE chapter_key 
           WHEN 'intro' THEN 1
           WHEN 'theory' THEN 2  
           WHEN 'design' THEN 3
           WHEN 'implementation' THEN 4
           WHEN 'tasks' THEN 2
           WHEN 'diary' THEN 3
           WHEN 'conclusion' THEN 5
           WHEN 'report' THEN 6
           WHEN 'appendix' THEN 7
           WHEN 'sources' THEN 8
           WHEN 'abstract' THEN 9
           WHEN 'cover' THEN 10
           WHEN 'content' THEN 11
           ELSE 99 
         END`, [userId, projectType]);
        // Форматуємо дані для фронтенду
        const chapters = result.rows.map((row) => ({
            id: row.id,
            key: row.key,
            progress: row.progress,
            status: row.status,
            studentNote: row.student_note || '',
            uploadedFile: row.uploaded_file_name ? {
                name: row.uploaded_file_name,
                uploadDate: row.uploaded_file_date ? new Date(row.uploaded_file_date).toLocaleDateString('uk-UA') : '',
                size: row.uploaded_file_size || ''
            } : undefined,
            teacherComments: []
        }));
        res.json(chapters);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});
// PUT /api/user-chapters/:chapterKey - оновити главу
app.put("/api/user-chapters/:chapterKey", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { chapterKey } = req.params;
        const { projectType, progress, status, studentNote, uploadedFile } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        let query = `UPDATE user_chapters SET updated_at = NOW()`;
        const values = [userId, projectType, chapterKey];
        let paramIndex = 4;
        if (progress !== undefined) {
            query += `, progress = $${paramIndex}`;
            values.push(progress);
            paramIndex++;
        }
        if (status !== undefined) {
            query += `, status = $${paramIndex}`;
            values.push(status);
            paramIndex++;
        }
        if (studentNote !== undefined) {
            query += `, student_note = $${paramIndex}`;
            values.push(studentNote);
            paramIndex++;
        }
        if (uploadedFile) {
            query += `, uploaded_file_name = $${paramIndex}, uploaded_file_date = $${paramIndex + 1}, uploaded_file_size = $${paramIndex + 2}`;
            values.push(uploadedFile.name, new Date(), uploadedFile.size);
            paramIndex += 3;
        }
        query += ` WHERE user_id = $1 AND project_type = $2 AND chapter_key = $3`;
        await pool.query(query, values);
        res.json({ message: "Chapter updated successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});
// DELETE /api/user-chapters/:chapterKey/file - видалити файл глави
app.delete("/api/user-chapters/:chapterKey/file", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { chapterKey } = req.params;
        const { projectType } = req.query;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        await pool.query(`UPDATE user_chapters 
       SET uploaded_file_name = NULL, uploaded_file_date = NULL, uploaded_file_size = NULL, 
           progress = 0, status = 'pending', updated_at = NOW()
       WHERE user_id = $1 AND project_type = $2 AND chapter_key = $3`, [userId, projectType, chapterKey]);
        res.json({ message: "File deleted successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});
app.post("/api/generate-topics", async (req, res) => {
    try {
        const { idea } = req.body;
        console.log("Generate topics request:", { idea: idea?.substring(0, 100) });
        if (!idea || typeof idea !== "string") {
            return res.status(400).json({ message: "Idea is required and should be a string." });
        }
        // Динамічна генерація тем на основі ідеї
        const topics = generateDynamicTopics(idea);
        console.log(`Generated ${topics.length} topics for idea:`, idea.substring(0, 50));
        res.json({ topics });
    }
    catch (error) {
        console.error("Error in generate-topics:", error);
        // Fallback з динамічною генерацією
        const fallbackTopics = generateDynamicTopics("освітній проект");
        res.json({ topics: fallbackTopics });
    }
});
// Покращена функція для динамічної генерації тем
function generateDynamicTopics(idea) {
    const analysis = analyzeIdea(idea);
    // Динамічно визначаємо скільки тем згенерувати (від 3 до 8)
    const topicCount = determineTopicCount(analysis);
    const topics = [];
    // Генеруємо унікальні теми
    const usedTitles = new Set();
    for (let i = 0; i < topicCount; i++) {
        const topic = generateUniqueTopic(analysis, i, usedTitles);
        if (topic) {
            topics.push(topic);
            usedTitles.add(topic.title);
        }
    }
    return topics;
}
// Функція для визначення кількості тем на основі складності ідеї
function determineTopicCount(analysis) {
    const { complexity, keywords, components } = analysis;
    let count = 3; // мінімум
    // Більше ключових слів = більше потенційних тем
    if (keywords.length > 3)
        count++;
    if (keywords.length > 6)
        count++;
    // Складніші ідеї мають більше аспектів для розгляду
    if (complexity > 6)
        count++;
    if (complexity > 8)
        count++;
    // Якщо багато технологій - більше технічних тем
    if (components.technologies.length > 1)
        count++;
    return Math.min(count, 8); // не більше 8 тем
}
// Функція для глибокого аналізу ідеї
function analyzeIdea(idea) {
    const lowercaseIdea = idea.toLowerCase();
    // Визначаємо ключові компоненти
    const components = {
        action: extractAction(lowercaseIdea),
        target: extractTarget(lowercaseIdea),
        domain: extractDomain(lowercaseIdea),
        technologies: extractTechnologies(lowercaseIdea),
        purpose: extractPurpose(lowercaseIdea),
        scale: extractScale(lowercaseIdea),
        audience: extractAudience(lowercaseIdea)
    };
    // Визначаємо тип проекту
    const projectType = determineProjectTypeFromComponents(components);
    const complexity = calculateComplexity(lowercaseIdea, components);
    return {
        original: idea,
        components,
        projectType,
        keywords: extractKeywords(lowercaseIdea),
        complexity
    };
}
// Нова функція для визначення масштабу проекту
function extractScale(idea) {
    const scales = [
        { pattern: /персональн|особист|мої/, value: 'персональний' },
        { pattern: /груп|команд|спільн/, value: 'груповий' },
        { pattern: /інститут|універ|факультет/, value: 'інституційний' },
        { pattern: /глобальн|загальн|всіх/, value: 'глобальний' }
    ];
    for (const scale of scales) {
        if (scale.pattern.test(idea))
            return scale.value;
    }
    return 'локальний';
}
// Нова функція для визначення аудиторії
function extractAudience(idea) {
    const audiences = [
        { pattern: /студент|учн|школяр/, value: 'студенти' },
        { pattern: /викладач|вчитель|професор/, value: 'викладачі' },
        { pattern: /адмін|керівник|декан/, value: 'адміністрація' },
        { pattern: /абітур|вступник/, value: 'абітурієнти' },
        { pattern: /дослідник|науков/, value: 'дослідники' }
    ];
    for (const audience of audiences) {
        if (audience.pattern.test(idea))
            return audience.value;
    }
    return 'користувачі';
}
// Функція для оцінки складності ідеї
function calculateComplexity(idea, components) {
    let complexity = 3; // базова складність
    // Довжина ідеї
    if (idea.length > 50)
        complexity += 1;
    if (idea.length > 100)
        complexity += 1;
    // Кількість технологій
    complexity += Math.min(components.technologies.length, 3);
    // Специфічність цілі
    if (components.target !== 'навчального процесу')
        complexity += 1;
    if (components.purpose !== 'підвищення якості')
        complexity += 1;
    // Масштаб
    if (components.scale === 'глобальний')
        complexity += 2;
    if (components.scale === 'інституційний')
        complexity += 1;
    return Math.min(complexity, 10);
}
// Допоміжні функції для аналізу (залишаються подібними, але можна розширити)
function extractAction(idea) {
    const actions = [
        { pattern: /створити|розробити|зробити|побудувати/, value: 'розробка' },
        { pattern: /вдосконалити|покращити|оптимізувати/, value: 'оптимізація' },
        { pattern: /дослідити|проаналізувати|вивчити/, value: 'дослідження' },
        { pattern: /автоматизувати|систематизувати/, value: 'автоматизація' },
        { pattern: /рекомендувати|підбирати/, value: 'рекомендації' },
        { pattern: /організувати|структурувати/, value: 'організація' },
        { pattern: /візуалізувати|представити/, value: 'візуалізація' }
    ];
    for (const action of actions) {
        if (action.pattern.test(idea))
            return action.value;
    }
    return 'розробка';
}
function extractTarget(idea) {
    const targets = [
        { pattern: /студент|учн|школяр/, value: 'студентів' },
        { pattern: /викладач|вчитель|викладач/, value: 'викладачів' },
        { pattern: /універ|колег|заклад/, value: 'навчальних закладів' },
        { pattern: /книг|літератур|підручник/, value: 'книг та літератури' },
        { pattern: /розклад|графік|розпорядок/, value: 'навчального розкладу' },
        { pattern: /завданн|проект/, value: 'навчальних завдань' },
        { pattern: /оцінк|рейтинг|успішн/, value: 'академічних оцінок' },
        { pattern: /курс|дисциплин|предмет/, value: 'навчальних курсів' }
    ];
    for (const target of targets) {
        if (target.pattern.test(idea))
            return target.value;
    }
    return 'навчального процесу';
}
function extractDomain(idea) {
    const domains = [
        { pattern: /книг|літератур|читан/, value: 'літератури' },
        { pattern: /розклад|графік|час/, value: 'планування часу' },
        { pattern: /навчан|освіт|учб/, value: 'освіти' },
        { pattern: /технолог|програм|додаток/, value: 'технологій' },
        { pattern: /рекомендац|підбір/, value: 'рекомендаційних систем' },
        { pattern: /оцінк|тест|екзамен/, value: 'оцінювання' },
        { pattern: /комунікац|спілкуван/, value: 'комунікації' }
    ];
    for (const domain of domains) {
        if (domain.pattern.test(idea))
            return domain.value;
    }
    return 'освітніх технологій';
}
function extractTechnologies(idea) {
    const techs = [];
    const technologyPatterns = [
        { pattern: /ai|штучн|машинн|нейрон/, name: 'AI' },
        { pattern: /мобіл|телефон|додаток/, name: 'мобільні технології' },
        { pattern: /веб|сайт|браузер/, name: 'веб-технології' },
        { pattern: /баз|дані|sql/, name: 'бази даних' },
        { pattern: /хмар|cloud/, name: 'хмарні технології' },
        { pattern: /блокчейн|крипто/, name: 'блокчейн' },
        { pattern: /vr|ar|віртуал|доповнен/, name: 'VR/AR' },
        { pattern: /iot|інтернет речей/, name: 'IoT' }
    ];
    for (const tech of technologyPatterns) {
        if (tech.pattern.test(idea))
            techs.push(tech.name);
    }
    return techs.length > 0 ? techs : ['сучасні технології'];
}
function extractPurpose(idea) {
    const purposes = [
        { pattern: /допомог|полегш|зручн/, value: 'покращення ефективності' },
        { pattern: /організ|порядок|структур/, value: 'організації процесів' },
        { pattern: /економ|збереж|оптиміз/, value: 'оптимізації ресурсів' },
        { pattern: /навч|освіт|знань/, value: 'покращення навчання' },
        { pattern: /мотив|зацікав/, value: 'підвищення мотивації' },
        { pattern: /доступ|відкрит/, value: 'забезпечення доступності' }
    ];
    for (const purpose of purposes) {
        if (purpose.pattern.test(idea))
            return purpose.value;
    }
    return 'підвищення якості';
}
function extractKeywords(idea) {
    const stopWords = ['я', 'хочу', 'створити', 'розробити', 'зробити', 'для', 'щоб', 'який', 'допоможе', 'краще', 'більш', 'дуже', 'просто'];
    const words = idea
        .replace(/[^\w\sа-яіїєґ]/gi, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.includes(word));
    return [...new Set(words)];
}
function determineProjectTypeFromComponents(components) {
    if (components.action === 'рекомендації')
        return 'recommendation';
    if (components.technologies.includes('AI'))
        return 'ai';
    if (components.action === 'дослідження')
        return 'research';
    if (components.target.includes('книг'))
        return 'literature';
    if (components.target.includes('розклад'))
        return 'scheduling';
    if (components.domain.includes('планування'))
        return 'planning';
    if (components.action === 'візуалізація')
        return 'visualization';
    if (components.technologies.includes('VR/AR'))
        return 'vr_ar';
    return 'development';
}
// Головна функція генерації унікальних тем
function generateUniqueTopic(analysis, index, usedTitles) {
    const { projectType, keywords, complexity } = analysis;
    // Log usage of variables to avoid unused warnings
    console.log(`Generating topic ${index} for ${projectType} with complexity ${complexity}`);
    if (keywords.length > 0) {
        console.log(`Keywords: ${keywords.join(', ')}`);
    }
    const topicGenerators = [
        generateTechnicalTopic,
        generateResearchTopic,
        generateUserExperienceTopic,
        generateBusinessTopic,
        generateInnovationTopic,
        generateImplementationTopic,
        generateSocialTopic,
        generateFutureTopic
    ];
    // Вибираємо генератор на основі індексу та складності
    const generatorIndex = index % Math.min(topicGenerators.length, Math.max(4, Math.floor(complexity / 2)));
    const topic = topicGenerators[generatorIndex](analysis);
    if (topic && !usedTitles.has(topic.title)) {
        return topic;
    }
    for (let i = 0; i < topicGenerators.length; i++) {
        const altTopic = topicGenerators[(generatorIndex + i) % topicGenerators.length](analysis);
        if (altTopic && !usedTitles.has(altTopic.title)) {
            return altTopic;
        }
    }
    return null;
}
// Різноманітні генератори тем
function generateTechnicalTopic(analysis) {
    const { components } = analysis;
    const tech = components.technologies[Math.floor(Math.random() * components.technologies.length)];
    const templates = [
        `Архітектура системи ${components.action} ${components.target} на основі ${tech}`,
        `Алгоритми ${components.purpose} для ${components.domain}`,
        `Технології обробки даних в системі ${components.action} ${components.target}`,
        `Оптимізація продуктивності рішення для ${components.target}`,
        `Інтеграція ${tech} в існуючу інфраструктуру ${components.domain}`
    ];
    return {
        title: templates[Math.floor(Math.random() * templates.length)],
        category: 'Технічна реалізація',
        description: `Технічні аспекти розробки та впровадження рішення для ${components.purpose}`,
        relevance: 85 + Math.floor(Math.random() * 10)
    };
}
function generateResearchTopic(analysis) {
    const { components } = analysis;
    const templates = [
        `Дослідження ефективності ${components.action} для ${components.target}`,
        `Аналіз потреб ${components.audience} в контексті ${components.domain}`,
        `Методологія оцінки якості ${components.action} ${components.target}`,
        `Порівняльний аналіз існуючих рішень для ${components.purpose}`,
        `Вплив цифровізації на ${components.domain} для ${components.audience}`
    ];
    return {
        title: templates[Math.floor(Math.random() * templates.length)],
        category: 'Наукове дослідження',
        description: `Академічне дослідження аспектів ${components.domain} та ${components.purpose}`,
        relevance: 82 + Math.floor(Math.random() * 12)
    };
}
function generateUserExperienceTopic(analysis) {
    const { components } = analysis;
    const templates = [
        `Інтерфейс користувача для системи ${components.action} ${components.target}`,
        `Юзабіліті та доступність рішення для ${components.audience}`,
        `Гейміфікація в системі ${components.action} для підвищення мотивації`,
        `Персоналізація досвіду користувача в ${components.domain}`,
        `Ергономіка взаємодії з системою ${components.action} ${components.target}`
    ];
    return {
        title: templates[Math.floor(Math.random() * templates.length)],
        category: 'Користувацький досвід',
        description: `Аспекти взаємодії користувача з системою та покращення досвіду використання`,
        relevance: 80 + Math.floor(Math.random() * 15)
    };
}
function generateBusinessTopic(analysis) {
    const { components } = analysis;
    const templates = [
        `Бізнес-модель впровадження рішення для ${components.target}`,
        `Економічна ефективність ${components.action} ${components.target}`,
        `Маркетингова стратегія просування рішення в ${components.domain}`,
        `Управління проектом ${components.action} ${components.target}`,
        `Аналіз ROI системи ${components.action} для ${components.audience}`
    ];
    return {
        title: templates[Math.floor(Math.random() * templates.length)],
        category: 'Бізнес-аспекти',
        description: `Економічні та організаційні аспекти реалізації та впровадження рішення`,
        relevance: 78 + Math.floor(Math.random() * 16)
    };
}
function generateInnovationTopic(analysis) {
    const { components } = analysis;
    const templates = [
        `Інноваційні підходи до ${components.action} ${components.target}`,
        `Використання новітніх технологій в ${components.domain}`,
        `Креативні рішення проблем ${components.purpose}`,
        `Футуристичний погляд на розвиток ${components.domain}`,
        `Експериментальні методи ${components.action} для ${components.audience}`
    ];
    return {
        title: templates[Math.floor(Math.random() * templates.length)],
        category: 'Інновації',
        description: `Передові та експериментальні підходи до вирішення проблем у ${components.domain}`,
        relevance: 88 + Math.floor(Math.random() * 8)
    };
}
function generateImplementationTopic(analysis) {
    const { components } = analysis;
    const templates = [
        `Практичне впровадження системи ${components.action} ${components.target}`,
        `Тестування та валідація рішення для ${components.audience}`,
        `Масштабування рішення ${components.action} на рівні ${components.scale}`,
        `Підтримка та обслуговування системи після впровадження`,
        `Інтеграція з існуючими системами в ${components.domain}`
    ];
    return {
        title: templates[Math.floor(Math.random() * templates.length)],
        category: 'Практична реалізація',
        description: `Аспекти практичного впровадження, тестування та підтримки рішення`,
        relevance: 83 + Math.floor(Math.random() * 12)
    };
}
function generateSocialTopic(analysis) {
    const { components } = analysis;
    const templates = [
        `Соціальний вплив ${components.action} на ${components.audience}`,
        `Етичні аспекти використання технологій в ${components.domain}`,
        `Культурний контекст впровадження рішення для ${components.target}`,
        `Освітні зміни через технологізацію ${components.domain}`,
        `Психологічні аспекти взаємодії з системою ${components.action}`
    ];
    return {
        title: templates[Math.floor(Math.random() * templates.length)],
        category: 'Соціальні аспекти',
        description: `Соціальні, культурні та етичні наслідки впровадження технологій у ${components.domain}`,
        relevance: 75 + Math.floor(Math.random() * 20)
    };
}
function generateFutureTopic(analysis) {
    const { components } = analysis;
    const templates = [
        `Майбутній розвиток технологій в ${components.domain}`,
        `Перспективи вдосконалення ${components.action} ${components.target}`,
        `Тенденції розвитку ${components.domain} в наступні 5 років`,
        `Адаптація системи до майбутніх викликів в ${components.domain}`,
        `Стратегія розвитку рішення для ${components.target}`
    ];
    return {
        title: templates[Math.floor(Math.random() * templates.length)],
        category: 'Перспективи розвитку',
        description: `Довгострокові перспективи та стратегії розвитку рішення в контексті ${components.domain}`,
        relevance: 80 + Math.floor(Math.random() * 15)
    };
}
// POST /api/teachers/match - пошук викладачів з фільтрацією за факультетом
app.post("/api/teachers/match", authenticateToken, async (req, res) => {
    try {
        const { topic, idea, facultyId } = req.body;
        console.log("=== TEACHER MATCH REQUEST ===");
        console.log("Teacher match request details:", {
            topic: topic?.substring(0, 100),
            idea: idea?.substring(0, 100),
            facultyId: facultyId,
            facultyIdType: typeof facultyId,
            user: req.user?.id
        });
        if (!topic && !idea) {
            console.log("ERROR: No topic or idea provided");
            return res.status(400).json({ message: "Topic or idea is required" });
        }
        const searchQuery = (topic || idea);
        if (searchQuery.length < 3) {
            console.log("ERROR: Query too short");
            return res.status(400).json({ message: "Query must be at least 3 characters long" });
        }
        const decodedQuery = decodeURIComponent(searchQuery);
        console.log("Search query for teacher matching:", decodedQuery);
        // Спочатку перевіримо, чи існує факультет, якщо вказано
        let facultyInfo = null;
        if (facultyId !== null && facultyId !== undefined && facultyId !== '') {
            const facultyIdNum = parseInt(facultyId);
            if (!isNaN(facultyIdNum)) {
                console.log(`Checking faculty with ID: ${facultyIdNum}`);
                const facultyCheck = await pool.query('SELECT id, name FROM faculties WHERE id = $1', [facultyIdNum]);
                if (facultyCheck.rows.length === 0) {
                    console.warn(`⚠️ Faculty with ID ${facultyIdNum} does not exist!`);
                    facultyInfo = { id: facultyIdNum, name: 'Невідомий факультет', exists: false };
                }
                else {
                    facultyInfo = { ...facultyCheck.rows[0], exists: true };
                    console.log(`✅ Faculty exists: ${facultyInfo.name} (ID: ${facultyInfo.id})`);
                }
            }
            else {
                console.log(`❌ Invalid facultyId format: ${facultyId}`);
                facultyInfo = { id: null, name: 'Некоректний ID', exists: false };
            }
        }
        // ДЕТАЛЬНА ПЕРЕВІРКА: Чому запит повертає 0 викладачів?
        console.log("🔍 DEBUG: Checking why query returns 0 teachers...");
        // Перевіримо всіх викладачів у системі
        const allTeachers = await pool.query(`
      SELECT COUNT(*) as count FROM teachers
    `);
        console.log(`📊 Total teachers in teachers table: ${allTeachers.rows[0].count}`);
        // Перевіримо викладачів з користувачами
        const teachersWithUsers = await pool.query(`
      SELECT COUNT(*) as count 
      FROM teachers t 
      JOIN users u ON t.id = u.id 
      WHERE u.role = 'teacher'
    `);
        console.log(`👥 Teachers with user accounts: ${teachersWithUsers.rows[0].count}`);
        // Перевіримо зв'язок між teachers та users
        const connectionCheck = await pool.query(`
      SELECT 
        t.id as teacher_id,
        t.full_name as teacher_name,
        u.id as user_id, 
        u.name as user_name,
        u.email,
        u.role
      FROM teachers t
      LEFT JOIN users u ON t.id = u.id
      WHERE u.role = 'teacher'
      LIMIT 10
    `);
        console.log('🔗 Teacher-User connection check:');
        connectionCheck.rows.forEach(row => {
            console.log(`  Teacher: ${row.teacher_name} (${row.teacher_id}) -> User: ${row.user_name} (${row.user_id}) - Email: ${row.email} - Role: ${row.role}`);
        });
        // Перевіримо викладачів на факультеті №5 без фільтра по ролі
        const teachersInFaculty5 = await pool.query(`
      SELECT COUNT(*) as count 
      FROM teachers t 
      JOIN departments d ON t.department_id = d.id 
      WHERE d.faculty_id = $1
    `, [5]);
        console.log(`🏛️ Teachers in faculty 5 (any role): ${teachersInFaculty5.rows[0].count}`);
        // Перевіримо викладачів на факультеті №5 з фільтром по ролі
        const teachersInFaculty5WithRole = await pool.query(`
      SELECT COUNT(*) as count 
      FROM teachers t 
      JOIN departments d ON t.department_id = d.id 
      JOIN users u ON t.id = u.id 
      WHERE d.faculty_id = $1 AND u.role = 'teacher'
    `, [5]);
        console.log(`🎯 Teachers in faculty 5 with teacher role: ${teachersInFaculty5WithRole.rows[0].count}`);
        // ПОКРАЩЕНИЙ запит для отримання викладачів
        let teachersQuery = `
      SELECT 
        t.id,
        COALESCE(t.full_name, u.name) as name,  -- Використовуємо ім'я з users як fallback
        t.skills,
        d.name as department_name,
        d.id as department_id,
        f.name as faculty_name,
        f.id as faculty_id,
        u.email,  -- Email беремо з таблиці users
        u.name as user_name,  -- Для дебагу
        tp.title,
        tp.bio,
        tp.avatar_url,
        tp.office_hours,
        tp.phone,
        tp.website
      FROM teachers t
      INNER JOIN users u ON t.id = u.id  -- INNER JOIN гарантує зв'язок
      LEFT JOIN departments d ON t.department_id = d.id
      LEFT JOIN faculties f ON d.faculty_id = f.id
      LEFT JOIN teacher_profiles tp ON t.id = tp.user_id
      WHERE u.role = 'teacher'
    `;
        const queryParams = [];
        let paramCount = 0;
        // Додаємо фільтрацію за факультетом, якщо вказано і він існує
        if (facultyInfo && facultyInfo.exists) {
            paramCount++;
            teachersQuery += ` AND f.id = $${paramCount}`;
            queryParams.push(facultyInfo.id);
            console.log(`🔍 Filtering by faculty ID: ${facultyInfo.id} (${facultyInfo.name})`);
        }
        else if (facultyId) {
            console.log(`🚨 Faculty filter requested but faculty doesn't exist, searching across all faculties`);
        }
        else {
            console.log('🌍 No faculty filter, searching across all faculties');
        }
        teachersQuery += ` ORDER BY t.full_name`;
        console.log("Final SQL query:", teachersQuery);
        console.log("Query parameters:", queryParams);
        const teachersResult = await pool.query(teachersQuery, queryParams);
        console.log(`📊 Found ${teachersResult.rows.length} teachers for faculty: ${facultyInfo?.name || 'all faculties'}`);
        // Детальне логування знайдених викладачів
        if (teachersResult.rows.length > 0) {
            console.log('👨‍🏫 First 5 teachers found:');
            teachersResult.rows.slice(0, 5).forEach((teacher, index) => {
                console.log(`  ${index + 1}. ${teacher.name} - Email: ${teacher.email} - ${teacher.department_name} - ${teacher.faculty_name}`);
                console.log(`     User name from users table: ${teacher.user_name}`);
            });
        }
        else {
            console.log('❌ No teachers found with current filters');
            // Додаткова інформація: скільки всього викладачів у системі
            const totalTeachers = await pool.query('SELECT COUNT(*) as count FROM teachers t JOIN users u ON t.id = u.id WHERE u.role = $1', ['teacher']);
            console.log(`📈 Total teachers in system: ${totalTeachers.rows[0].count}`);
            // Перевіримо, чи є взагалі викладачі у вказаному факультеті
            if (facultyInfo && facultyInfo.exists) {
                const facultyTeachersCount = await pool.query(`
          SELECT COUNT(*) as count 
          FROM teachers t 
          JOIN departments d ON t.department_id = d.id 
          JOIN faculties f ON d.faculty_id = f.id 
          JOIN users u ON t.id = u.id
          WHERE f.id = $1 AND u.role = 'teacher'
        `, [facultyInfo.id]);
                console.log(`📊 Total teachers in faculty ${facultyInfo.name}: ${facultyTeachersCount.rows[0].count}`);
            }
            // АЛЬТЕРНАТИВНИЙ ЗАПИТ: Спробуємо без фільтра по ролі
            console.log("🔄 Trying alternative query without role filter...");
            let alternativeQuery = `
        SELECT 
          t.id,
          COALESCE(t.full_name, u.name) as name,
          t.skills,
          d.name as department_name,
          d.id as department_id,
          f.name as faculty_name,
          f.id as faculty_id,
          u.email,  -- Додаємо email
          u.name as user_name,
          '' as title,
          '' as bio,
          null as avatar_url,
          '' as office_hours,
          '' as phone,
          '' as website
        FROM teachers t
        JOIN users u ON t.id = u.id  -- Додаємо JOIN з users
        JOIN departments d ON t.department_id = d.id
        JOIN faculties f ON d.faculty_id = f.id
        WHERE 1=1
      `;
            const altParams = [];
            let altParamCount = 0;
            if (facultyInfo && facultyInfo.exists) {
                altParamCount++;
                alternativeQuery += ` AND f.id = $${altParamCount}`;
                altParams.push(facultyInfo.id);
            }
            alternativeQuery += ` ORDER BY t.full_name LIMIT 10`;
            const altResult = await pool.query(alternativeQuery, altParams);
            console.log(`🔍 Alternative query found ${altResult.rows.length} teachers`);
            if (altResult.rows.length > 0) {
                console.log('👨‍🏫 Teachers from alternative query:');
                altResult.rows.forEach((teacher, index) => {
                    console.log(`  ${index + 1}. ${teacher.name} - Email: ${teacher.email} - ${teacher.department_name} - ${teacher.faculty_name}`);
                });
            }
        }
        // Якщо основним запитом не знайдено викладачів, використовуємо альтернативний
        let finalTeachersResult = teachersResult;
        if (teachersResult.rows.length === 0) {
            console.log("🔄 Using alternative query results...");
            const alternativeQuery = `
        SELECT 
          t.id,
          COALESCE(t.full_name, u.name) as name,
          t.skills,
          d.name as department_name,
          d.id as department_id,
          f.name as faculty_name,
          f.id as faculty_id,
          u.email,  -- Додаємо email
          u.name as user_name,
          '' as title,
          '' as bio,
          null as avatar_url,
          '' as office_hours,
          '' as phone,
          '' as website
        FROM teachers t
        JOIN users u ON t.id = u.id  -- Додаємо JOIN з users
        JOIN departments d ON t.department_id = d.id
        JOIN faculties f ON d.faculty_id = f.id
        WHERE f.id = $1
        ORDER BY t.full_name
        LIMIT 50
      `;
            finalTeachersResult = await pool.query(alternativeQuery, [facultyInfo?.id || facultyId]);
            console.log(`✅ Alternative query returned ${finalTeachersResult.rows.length} teachers`);
        }
        if (finalTeachersResult.rows.length === 0) {
            return res.json({
                teachers: [],
                searchQuery: decodedQuery,
                totalCount: 0,
                facultyFilter: facultyInfo || facultyId,
                summary: {
                    totalTeachers: 0,
                    matchingTeachers: 0,
                    facultyName: facultyInfo?.name || "Не знайдено",
                    facultyExists: facultyInfo?.exists || false
                },
                message: facultyInfo && !facultyInfo.exists ?
                    `Факультет з ID ${facultyId} не існує в системі` :
                    facultyId ?
                        `Не знайдено викладачів для факультету: ${facultyInfo?.name || facultyId}` :
                        "Не знайдено викладачів у системі."
            });
        }
        console.log(`🔎 Starting relevance calculation for ${finalTeachersResult.rows.length} teachers...`);
        // Для кожного викладача шукаємо відповідність у всіх джерелах даних
        const teachersWithMatches = await Promise.all(finalTeachersResult.rows.map(async (teacher) => {
            const teacherId = teacher.id;
            let skills = [];
            // Парсимо skills з JSON або масиву
            try {
                if (typeof teacher.skills === 'string') {
                    skills = JSON.parse(teacher.skills);
                }
                else if (Array.isArray(teacher.skills)) {
                    skills = teacher.skills;
                }
                else if (teacher.skills) {
                    console.warn(`Unexpected skills format for teacher ${teacher.name}:`, typeof teacher.skills);
                }
            }
            catch (err) {
                console.error('Error parsing skills for teacher', teacher.name, ':', err);
                skills = [];
            }
            console.log(`\n📋 Processing teacher: ${teacher.name}`);
            console.log(`   Email: ${teacher.email}`);
            console.log(`   User name from users: ${teacher.user_name}`);
            console.log(`   Skills:`, skills.slice(0, 5)); // Логуємо тільки перші 5 навичок
            console.log(`   Department: ${teacher.department_name}`);
            console.log(`   Faculty: ${teacher.faculty_name} (ID: ${teacher.faculty_id})`);
            // Пошук у роботах викладача
            const worksResult = await pool.query(`SELECT id, title, description, type, year
           FROM teacher_works 
           WHERE user_id = $1 
           AND (title ILIKE $2 OR description ILIKE $2 OR $2 = '')
           ORDER BY year DESC
           LIMIT 5`, [teacherId, `%${decodedQuery}%`]);
            // Пошук у напрямках досліджень
            const directionsResult = await pool.query(`SELECT id, area, description
           FROM teacher_research_directions 
           WHERE user_id = $1 
           AND (area ILIKE $2 OR description ILIKE $2 OR $2 = '')
           LIMIT 5`, [teacherId, `%${decodedQuery}%`]);
            // Пошук у майбутніх темах
            const topicsResult = await pool.query(`SELECT id, topic, description
           FROM teacher_future_topics 
           WHERE user_id = $1 
           AND (topic ILIKE $2 OR description ILIKE $2 OR $2 = '')
           LIMIT 5`, [teacherId, `%${decodedQuery}%`]);
            console.log(`   Found: ${worksResult.rows.length} works, ${directionsResult.rows.length} directions, ${topicsResult.rows.length} topics`);
            // Розраховуємо загальну релевантність з усіх джерел
            const skillsRelevance = calculateSkillsRelevance(decodedQuery, skills);
            const worksRelevance = calculateWorksRelevance(decodedQuery, worksResult.rows);
            const directionsRelevance = calculateDirectionsRelevance(decodedQuery, directionsResult.rows);
            const topicsRelevance = calculateTopicsRelevance(decodedQuery, topicsResult.rows);
            // Загальна релевантність (з вагами)
            const totalRelevance = Math.min(100, skillsRelevance * 0.4 + // Навички - 40%
                worksRelevance * 0.3 + // Роботи - 30%
                directionsRelevance * 0.2 + // Напрямки - 20%
                topicsRelevance * 0.1 // Теми - 10%
            );
            // Формуємо об'єднані результати пошуку
            const searchResults = [
                // Навички
                ...skills
                    .filter(skill => skill.toLowerCase().includes(decodedQuery.toLowerCase()))
                    .slice(0, 3)
                    .map(skill => ({
                    type: 'skill',
                    id: `skill-${skill}-${teacherId}`,
                    title: skill,
                    description: `Навичка викладача`
                })),
                // Роботи
                ...worksResult.rows.map((work) => ({
                    type: 'work',
                    id: work.id.toString(),
                    title: work.title,
                    description: work.description,
                    subtype: work.type,
                    year: work.year
                })),
                // Напрямки
                ...directionsResult.rows.map((direction) => ({
                    type: 'direction',
                    id: direction.id.toString(),
                    title: direction.area,
                    description: direction.description
                })),
                // Теми
                ...topicsResult.rows.map((topic) => ({
                    type: 'future_topic',
                    id: topic.id.toString(),
                    title: topic.topic,
                    description: topic.description
                }))
            ].slice(0, 8); // Обмежуємо загальну кількість результатів
            console.log(`   Relevance: ${Math.round(totalRelevance)}% (skills: ${Math.round(skillsRelevance)}%, works: ${Math.round(worksRelevance)}%, directions: ${Math.round(directionsRelevance)}%, topics: ${Math.round(topicsRelevance)}%)`);
            console.log(`   Matches found: ${searchResults.length}`);
            return {
                teacher: {
                    id: teacher.id.toString(),
                    name: teacher.name,
                    title: teacher.title || "Викладач",
                    department: teacher.department_name || "Кафедра не вказана",
                    faculty: teacher.faculty_name || "Факультет не вказаний",
                    facultyId: teacher.faculty_id,
                    bio: teacher.bio || "",
                    avatarUrl: teacher.avatar_url,
                    email: teacher.email, // Тепер email буде з таблиці users
                    officeHours: teacher.office_hours || "",
                    phone: teacher.phone || "",
                    website: teacher.website || "",
                    skills: skills
                },
                relevanceScore: Math.round(totalRelevance),
                matchCount: searchResults.length,
                searchResults: searchResults,
                matchBreakdown: {
                    skills: skills.filter(skill => skill.toLowerCase().includes(decodedQuery.toLowerCase())).length,
                    works: worksResult.rows.length,
                    directions: directionsResult.rows.length,
                    topics: topicsResult.rows.length
                },
                detailedRelevance: {
                    skills: Math.round(skillsRelevance),
                    works: Math.round(worksRelevance),
                    directions: Math.round(directionsRelevance),
                    topics: Math.round(topicsRelevance)
                }
            };
        }));
        // Фільтруємо викладачів з релевантністю > 0 і сортуємо за релевантністю
        const filteredTeachers = teachersWithMatches
            .filter(teacher => teacher.relevanceScore > 0)
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 15);
        console.log(`\n🎯 FINAL RESULTS:`);
        console.log(`   Total teachers processed: ${finalTeachersResult.rows.length}`);
        console.log(`   Matching teachers found: ${filteredTeachers.length}`);
        console.log(`   Faculty filter: ${facultyInfo?.name || facultyId || 'all'}`);
        console.log(`   Top match score: ${filteredTeachers[0]?.relevanceScore || 0}%`);
        if (filteredTeachers.length > 0) {
            console.log(`   Top 3 matches:`);
            filteredTeachers.slice(0, 3).forEach((teacher, index) => {
                console.log(`     ${index + 1}. ${teacher.teacher.name} - ${teacher.relevanceScore}% - ${teacher.matchCount} matches - Email: ${teacher.teacher.email}`);
            });
        }
        res.json({
            teachers: filteredTeachers,
            searchQuery: decodedQuery,
            totalCount: filteredTeachers.length,
            facultyFilter: facultyInfo || facultyId,
            summary: {
                totalTeachers: finalTeachersResult.rows.length,
                matchingTeachers: filteredTeachers.length,
                topMatch: filteredTeachers[0]?.relevanceScore || 0,
                facultyName: facultyInfo?.name || finalTeachersResult.rows[0]?.faculty_name || "Не вказано",
                facultyExists: facultyInfo?.exists ?? true
            },
            debug: {
                facultyRequested: facultyId,
                facultyUsed: facultyInfo,
                searchQueryLength: decodedQuery.length,
                originalQueryResults: teachersResult.rows.length,
                alternativeQueryUsed: teachersResult.rows.length === 0
            }
        });
    }
    catch (err) {
        console.error("❌ ERROR in teacher matching:", err);
        res.status(500).json({
            message: "Database error matching teachers",
            error: err instanceof Error ? err.message : 'Unknown error',
            teachers: [],
            searchQuery: req.body.topic || req.body.idea,
            totalCount: 0,
            facultyFilter: req.body.facultyId || 'all',
            summary: {
                totalTeachers: 0,
                matchingTeachers: 0,
                facultyName: "Помилка пошуку",
                facultyExists: false
            }
        });
    }
});
// Покращені функції для розрахунку релевантності
function calculateSkillsRelevance(searchQuery, skills) {
    if (skills.length === 0)
        return 0;
    const query = searchQuery.toLowerCase();
    let totalScore = 0;
    let matchesFound = 0;
    skills.forEach(skill => {
        const skillLower = skill.toLowerCase();
        if (skillLower === query) {
            totalScore += 100;
            matchesFound++;
            console.log(`      🎯 Exact skill match: "${skill}"`);
        }
        else if (skillLower.includes(query)) {
            totalScore += 80;
            matchesFound++;
            console.log(`      ✅ Partial skill match: "${skill}"`);
        }
        else {
            const queryWords = query.split(/\s+/).filter(word => word.length > 2);
            const skillWords = skillLower.split(/\s+/);
            let wordMatches = 0;
            queryWords.forEach(word => {
                if (skillWords.some(skillWord => skillWord.includes(word))) {
                    wordMatches++;
                    totalScore += 30;
                    matchesFound++;
                }
            });
            if (wordMatches === queryWords.length && wordMatches > 0) {
                totalScore += 20;
                console.log(`      🔍 Multi-word skill match: "${skill}"`);
            }
        }
    });
    const maxPossibleScore = skills.length * 100;
    const relevance = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    console.log(`      Skills relevance: ${Math.round(relevance)}% (${matchesFound} matches)`);
    return relevance;
}
function calculateWorksRelevance(searchQuery, works) {
    if (works.length === 0)
        return 0;
    const query = searchQuery.toLowerCase();
    let totalScore = 0;
    works.forEach(work => {
        const title = work.title?.toLowerCase() || '';
        const description = work.description?.toLowerCase() || '';
        if (title.includes(query) || description.includes(query)) {
            totalScore += 80;
            console.log(`      📚 Work match: "${work.title}"`);
        }
        else {
            const queryWords = query.split(/\s+/).filter(word => word.length > 2);
            let wordMatches = 0;
            queryWords.forEach(word => {
                if (title.includes(word) || description.includes(word)) {
                    wordMatches++;
                    totalScore += 25;
                }
            });
            if (wordMatches === queryWords.length && wordMatches > 0) {
                totalScore += 15;
                console.log(`      🔍 Multi-word work match: "${work.title}"`);
            }
        }
        // Бонус за свіжість роботи (до 10%)
        if (work.year) {
            const currentYear = new Date().getFullYear();
            const yearsDiff = currentYear - work.year;
            if (yearsDiff <= 3) {
                totalScore += 10;
            }
            else if (yearsDiff <= 5) {
                totalScore += 5;
            }
        }
    });
    const maxPossibleScore = works.length * 90;
    const relevance = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    console.log(`      Works relevance: ${Math.round(relevance)}%`);
    return relevance;
}
function calculateDirectionsRelevance(searchQuery, directions) {
    if (directions.length === 0)
        return 0;
    const query = searchQuery.toLowerCase();
    let totalScore = 0;
    directions.forEach(direction => {
        const area = direction.area?.toLowerCase() || '';
        const description = direction.description?.toLowerCase() || '';
        if (area.includes(query) || description.includes(query)) {
            totalScore += 90;
            console.log(`      🧭 Direction match: "${direction.area}"`);
        }
        else {
            const queryWords = query.split(/\s+/).filter(word => word.length > 2);
            let wordMatches = 0;
            queryWords.forEach(word => {
                if (area.includes(word) || description.includes(word)) {
                    wordMatches++;
                    totalScore += 30;
                }
            });
            if (wordMatches === queryWords.length && wordMatches > 0) {
                totalScore += 20;
                console.log(`      🔍 Multi-word direction match: "${direction.area}"`);
            }
        }
    });
    const maxPossibleScore = directions.length * 90;
    const relevance = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    console.log(`      Directions relevance: ${Math.round(relevance)}%`);
    return relevance;
}
function calculateTopicsRelevance(searchQuery, topics) {
    if (topics.length === 0)
        return 0;
    const query = searchQuery.toLowerCase();
    let totalScore = 0;
    topics.forEach(topic => {
        const topicText = topic.topic?.toLowerCase() || '';
        const description = topic.description?.toLowerCase() || '';
        if (topicText.includes(query) || description.includes(query)) {
            totalScore += 95;
            console.log(`      💡 Topic match: "${topic.topic}"`);
        }
        else {
            const queryWords = query.split(/\s+/).filter(word => word.length > 2);
            let wordMatches = 0;
            queryWords.forEach(word => {
                if (topicText.includes(word) || description.includes(word)) {
                    wordMatches++;
                    totalScore += 35;
                }
            });
            if (wordMatches === queryWords.length && wordMatches > 0) {
                totalScore += 25;
                console.log(`      🔍 Multi-word topic match: "${topic.topic}"`);
            }
        }
    });
    const maxPossibleScore = topics.length * 95;
    const relevance = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    console.log(`      Topics relevance: ${Math.round(relevance)}%`);
    return relevance;
}
app.post("/api/generate-structure", async (req, res) => {
    try {
        const { idea, topic } = req.body;
        console.log("Generate structure request:", {
            idea: idea?.substring(0, 100),
            topic: topic?.substring(0, 100)
        });
        if (!idea || typeof idea !== "string") {
            return res.status(400).json({ message: "Idea is required and should be a string." });
        }
        if (!topic || typeof topic !== "string") {
            return res.status(400).json({ message: "Topic is required and should be a string." });
        }
        // Генерація специфічної структури для теми
        const structure = generateSpecificStructure(idea, topic);
        console.log("Returning specific structure for topic:", topic.substring(0, 50));
        return res.status(200).json({ structure });
    }
    catch (error) {
        console.error("Error generating structure:", error);
        const fallbackStructure = generateSpecificStructure("освітній проект", "додаток для планування навчання");
        return res.status(200).json({ structure: fallbackStructure });
    }
});
// Покращена функція для генерації специфічної структури
function generateSpecificStructure(idea, topic) {
    const analysis = analyzeTopicAndIdea(idea, topic);
    const projectType = determineProjectTypeFromTopic(topic);
    const structure = generateStructureByType(analysis, projectType);
    // Додаємо загальні розділи в кінці
    return [
        ...structure,
        {
            id: structure.length + 1,
            key: "sources",
            progress: 0,
            status: "pending",
            content: "Список використаних джерел. Наукові публікації, документація технологій, аналітичні звіти, нормативні документи, інтернет-ресурси."
        },
        {
            id: structure.length + 2,
            key: "appendix",
            progress: 0,
            status: "pending",
            content: "Додатки. Додаткові матеріали, кодові фрагменти, схеми, таблиці, результати тестування, анкети, інструкції."
        }
    ];
}
function analyzeTopicAndIdea(idea, topic) {
    const lowercaseTopic = topic.toLowerCase();
    return {
        idea,
        topic,
        domain: extractDomainFromTopic(lowercaseTopic),
        technologies: extractTechnologiesFromTopic(lowercaseTopic),
        audience: extractAudienceFromTopic(lowercaseTopic),
        purpose: extractPurposeFromTopic(lowercaseTopic),
        complexity: calculateTopicComplexity(lowercaseTopic)
    };
}
function extractDomainFromTopic(topic) {
    const domains = [
        { pattern: /плануванн|тайм-менеджмент|розклад/, value: 'планування часу' },
        { pattern: /навчанн|освіт|учб/, value: 'освіти' },
        { pattern: /книг|літератур|читан/, value: 'літератури' },
        { pattern: /рекомендац|підбір/, value: 'рекомендаційних систем' },
        { pattern: /ai|штучн|машинн/, value: 'штучного інтелекту' },
        { pattern: /мобіл|додаток/, value: 'мобільних додатків' },
        { pattern: /баз.*дані|sql/, value: 'баз даних' },
        { pattern: /веб|сайт/, value: 'веб-розробки' },
        { pattern: /оптимізац|продуктивн/, value: 'оптимізації продуктивності' },
        { pattern: /управлінн|менеджмент/, value: 'управління проектами' },
        { pattern: /безпек|захист/, value: 'кібербезпеки' },
        { pattern: /аналіз|дослідженн/, value: 'наукових досліджень' }
    ];
    for (const domain of domains) {
        if (domain.pattern.test(topic))
            return domain.value;
    }
    return 'технологій';
}
function extractTechnologiesFromTopic(topic) {
    const techs = [];
    const techPatterns = [
        { pattern: /ai|штучн|машинн|нейрон/, name: 'AI/ML' },
        { pattern: /react|angular|vue/, name: 'Frontend фреймворки' },
        { pattern: /node|python|java|php/, name: 'Backend технології' },
        { pattern: /баз.*дані|mysql|mongodb|postgres/, name: 'Бази даних' },
        { pattern: /мобіл|android|ios|flutter/, name: 'Мобільні технології' },
        { pattern: /хмарн|cloud|aws|azure|gcp/, name: 'Хмарні технології' },
        { pattern: /блокчейн|blockchain/, name: 'Блокчейн' },
        { pattern: /docker|kubernetes|container/, name: 'Контейнеризація' },
        { pattern: /api|rest|graphql/, name: 'API технології' }
    ];
    for (const tech of techPatterns) {
        if (tech.pattern.test(topic))
            techs.push(tech.name);
    }
    return techs.length > 0 ? techs : ['сучасні технології'];
}
function extractAudienceFromTopic(topic) {
    const audiences = [
        { pattern: /студент|учн/, value: 'студентів' },
        { pattern: /викладач|вчитель|професор/, value: 'викладачів' },
        { pattern: /школяр|учнів/, value: 'школярів' },
        { pattern: /адмін|керівник|декан/, value: 'адміністрації' },
        { pattern: /користувач/, value: 'користувачів' },
        { pattern: /розробник|програміст/, value: 'розробників' },
        { pattern: /менеджер|керівник/, value: 'менеджерів' }
    ];
    for (const audience of audiences) {
        if (audience.pattern.test(topic))
            return audience.value;
    }
    return 'користувачів';
}
function extractPurposeFromTopic(topic) {
    const purposes = [
        { pattern: /покращенн|удосконаленн/, value: 'покращення якості' },
        { pattern: /оптимізац|ефективн/, value: 'оптимізації продуктивності' },
        { pattern: /автоматизац|систематизац/, value: 'автоматизації процесів' },
        { pattern: /дослідженн|аналіз/, value: 'наукового дослідження' },
        { pattern: /розробк|створенн/, value: 'розробки рішення' },
        { pattern: /впровадженн|реалізац/, value: 'впровадження системи' },
        { pattern: /оцінк|тестуванн/, value: 'оцінки ефективності' },
        { pattern: /безпек|захист/, value: 'забезпечення безпеки' }
    ];
    for (const purpose of purposes) {
        if (purpose.pattern.test(topic))
            return purpose.value;
    }
    return 'розвитку системи';
}
function calculateTopicComplexity(topic) {
    let complexity = 3;
    const words = topic.split(/\s+/).length;
    if (words > 5)
        complexity++;
    if (words > 8)
        complexity++;
    if (topic.includes('AI') || topic.includes('машинн'))
        complexity += 2;
    if (topic.includes('архітектур') || topic.includes('систем'))
        complexity++;
    if (topic.includes('аналіз') || topic.includes('дослідженн'))
        complexity++;
    if (topic.includes('оптимізац') || topic.includes('продуктивн'))
        complexity++;
    return Math.min(complexity, 10);
}
function determineProjectTypeFromTopic(topic) {
    const lowercaseTopic = topic.toLowerCase();
    if (/(мобільн|додаток|ios|android)/i.test(lowercaseTopic))
        return 'mobile';
    if (/(ai|штучн|машинн|нейрон|ml|dl|nlp)/i.test(lowercaseTopic))
        return 'ai';
    if (/(досліджен|аналіз|наук|експеримент)/i.test(lowercaseTopic))
        return 'research';
    if (/(веб|сайт|web|інтернет|браузер)/i.test(lowercaseTopic))
        return 'web';
    if (/(систем|платформ|архітектур)/i.test(lowercaseTopic))
        return 'system';
    if (/(рекомендац|підбір|персоналізац)/i.test(lowercaseTopic))
        return 'recommendation';
    if (/(плануванн|розклад|тайм-менеджмент|графік)/i.test(lowercaseTopic))
        return 'planning';
    if (/(оптимізац|продуктивн|ефективн)/i.test(lowercaseTopic))
        return 'optimization';
    return 'general';
}
// Генерація структури за типом проекту
function generateStructureByType(analysis, projectType) {
    const baseStructure = getBaseStructure(analysis);
    // Use the analysis data
    console.log(`Generating structure for ${projectType} project: ${analysis.topic}`);
    switch (projectType) {
        case 'mobile':
            return adaptForMobileApp(baseStructure, analysis);
        case 'ai':
            return adaptForAIProject(baseStructure, analysis);
        case 'research':
            return adaptForResearch(baseStructure);
        case 'web':
            return adaptForWebProject(baseStructure, analysis);
        case 'system':
            return adaptForSystem(baseStructure);
        case 'recommendation':
            return adaptForRecommendation(baseStructure, analysis);
        case 'planning':
            return adaptForPlanning(baseStructure, analysis);
        case 'optimization':
            return adaptForOptimization(baseStructure);
        default:
            return adaptForGeneral(baseStructure);
    }
}
// Базова структура
function getBaseStructure(analysis) {
    const { topic, domain, audience, purpose } = analysis;
    return [
        {
            id: 1,
            key: "intro",
            progress: 0,
            status: "pending",
            content: `Вступ. Актуальність теми "${topic}" в сучасних умовах. Мета роботи: ${purpose} у сфері ${domain}. Основні завдання: аналіз потреб ${audience}, розробка концепції, практична реалізація, оцінка ефективності. Об'єкт дослідження: ${domain}. Предмет: методи та засоби ${purpose}.`
        },
        {
            id: 2,
            key: "theory",
            progress: 0,
            status: "pending",
            content: `Теоретичні основи ${domain}. Сучасний стан розвитку технологій у галузі ${domain}. Критичний аналіз існуючих підходів та методологій. Основні поняття, термінологія та класифікації. Наукові праці вітчизняних та зарубіжних авторів з даної проблематики.`
        },
        {
            id: 3,
            key: "analysis",
            progress: 0,
            status: "pending",
            content: `Аналіз вимог та потреб. Дослідження потреб ${audience} у контексті ${purpose}. Аналіз конкурентних рішень на ринку. Визначення функціональних та нефункціональних вимог. SWOT-аналіз предметної області. Визначення критеріїв успішності рішення.`
        }
    ];
}
// Адаптації для різних типів проектів
function adaptForMobileApp(baseStructure, analysis) {
    const { technologies, audience } = analysis;
    return [
        ...baseStructure,
        {
            id: 4,
            key: "design_mobile",
            progress: 0,
            status: "pending",
            content: `Архітектура мобільного додатку. Вибір платформи (iOS/Android/Cross-platform). Проектування інтерфейсу з урахуванням мобільних паттернів. Вибір технологічного стеку: ${technologies.join(', ')}. Дизайн навігації та користувацького досвіду для ${audience}. Офлайн-функціонал та синхронізація.`
        },
        {
            id: 5,
            key: "development_mobile",
            progress: 0,
            status: "pending",
            content: `Розробка мобільного додатку. Імплементація інтерфейсу користувача (Swift/Kotlin/React Native). Розробка бізнес-логіки. Робота з анімаціями та жестами. Локальне сховище даних. Push-сповіщення. Оптимізація споживання батареї.`
        },
        {
            id: 6,
            key: "testing_mobile",
            progress: 0,
            status: "pending",
            content: `Тестування мобільного додатку. Юніт-тести компонентів. Тестування на різних пристроях та версіях ОС. Юзабіліті тестування з ${audience}. Тестування продуктивності та споживання ресурсів. Тестування в різних мережевих умовах.`
        },
        {
            id: 7,
            key: "publication",
            progress: 0,
            status: "pending",
            content: `Публікація та підтримка. Підготовка до публікації в App Store/Google Play. Створення опису, скріншотів та відео. Налаштування CI/CD. Моніторинг та аналітика використання. Збір зворотного зв'язку від користувачів.`
        }
    ];
}
function adaptForAIProject(baseStructure, analysis) {
    const { audience } = analysis;
    return [
        ...baseStructure,
        {
            id: 4,
            key: "ai_methodology",
            progress: 0,
            status: "pending",
            content: `Методологія штучного інтелекту. Аналіз завдання та вибір підходу (ML, DL, NLP). Огляд алгоритмів та архітектур. Вибір фреймворків та інструментів. Критерії оцінки якості моделей. Етичні аспекти використання AI.`
        },
        {
            id: 5,
            key: "data_preparation",
            progress: 0,
            status: "pending",
            content: `Підготовка даних для навчання. Збір та розмітка даних. Попередня обробка та очищення. Feature engineering. Розділення на тренувальну/валідаційну/тестову вибірки. Аналіз якості даних. Методи боротьби з дисбалансом.`
        },
        {
            id: 6,
            key: "model_development",
            progress: 0,
            status: "pending",
            content: `Розробка та навчання моделі. Вибір архітектури нейронної мережі. Налаштування гіперпараметрів. Процес навчання та валідації. Боротьба з перенавчанням. Оптимізація продуктивності. Інтерпретація результатів.`
        },
        {
            id: 7,
            key: "integration",
            progress: 0,
            status: "pending",
            content: `Інтеграція AI моделі в систему. Розробка API для моделі. Обробка вхідних/вихідних даних. Масштабування рішення. Моніторинг дрейфу даних. Оновлення та перетренування моделі. Система обробки помилок.`
        },
        {
            id: 8,
            key: "evaluation",
            progress: 0,
            status: "pending",
            content: `Оцінка ефективності AI рішення. Метрики якості (accuracy, precision, recall, F1). A/B тестування. Користувацьке тестування з ${audience}. Аналіз помилок та аномалій. Порівняння з baseline підходами.`
        }
    ];
}
function adaptForResearch(baseStructure) {
    return [
        ...baseStructure,
        {
            id: 4,
            key: "research_methodology",
            progress: 0,
            status: "pending",
            content: `Методологія дослідження. Вибір методів дослідження (анкетування, інтерв'ю, експеримент). Формування вибірки. Розробка інструментів збору даних. Етичні аспекти дослідження. Гіпотези дослідження.`
        },
        {
            id: 5,
            key: "data_collection",
            progress: 0,
            status: "pending",
            content: `Збір та підготовка даних. Проведення польових досліджень. Збір емпіричних даних. Попередня обробка та очищення даних. Формування наборів даних для аналізу. Контроль якості даних.`
        },
        {
            id: 6,
            key: "data_analysis",
            progress: 0,
            status: "pending",
            content: `Аналіз даних. Застосування статистичних методів. Якісний та кількісний аналіз. Інтерпретація результатів. Візуалізація даних та результатів. Перевірка статистичних гіпотез.`
        },
        {
            id: 7,
            key: "results_research",
            progress: 0,
            status: "pending",
            content: `Результати дослідження. Основні знахідки та відкриття. Аналіз отриманих результатів. Порівняння з теоретичними передбаченнями. Обговорення обмежень дослідження. Практичне значення результатів.`
        }
    ];
}
function adaptForWebProject(baseStructure, analysis) {
    const { technologies, audience } = analysis;
    return [
        ...baseStructure,
        {
            id: 4,
            key: "design_web",
            progress: 0,
            status: "pending",
            content: `Архітектура веб-додатку. Вибір технологічного стеку: ${technologies.join(', ')}. Проектування клієнт-серверної архітектури. Дизайн бази даних та API. UI/UX дизайн для ${audience}. Прототипування інтерфейсу. Вибір хостингу та інфраструктури.`
        },
        {
            id: 5,
            key: "frontend_development",
            progress: 0,
            status: "pending",
            content: `Розробка клієнтської частини. Імплементація користувацького інтерфейсу. Робота з станом додатку. Маршрутизація та навігація. Адаптивний дизайн для різних пристроїв. Оптимізація швидкодії та завантаження. Інтеграція з бекенд-сервісами.`
        },
        {
            id: 6,
            key: "backend_development",
            progress: 0,
            status: "pending",
            content: `Розробка серверної частини. Створення RESTful/graphQL API. Реалізація бізнес-логіки. Робота з базою даних. Система автентифікації та авторизації. Обробка та валідація даних. Логування та моніторинг.`
        },
        {
            id: 7,
            key: "testing_web",
            progress: 0,
            status: "pending",
            content: `Комплексне тестування веб-додатку. Юніт-тестування компонентів. Інтеграційне тестування API. End-to-end тестування критичних сценаріїв. Тестування безпеки (OWASP). Навантажувальне тестування. Юзабіліті тестування з ${audience}.`
        },
        {
            id: 8,
            key: "deployment",
            progress: 0,
            status: "pending",
            content: `Розгортання та впровадження. Налаштування production середовища. CI/CD пайплайн. Домене імена та SSL сертифікати. Моніторинг продуктивності (Google Analytics, Hotjar). Резервне копіювання та відновлення. SEO оптимізація.`
        }
    ];
}
function adaptForSystem(baseStructure) {
    return [
        ...baseStructure,
        {
            id: 4,
            key: "system_architecture",
            progress: 0,
            status: "pending",
            content: `Архітектура системи. Проектування системної архітектури. Вибір технологій та інфраструктури. Проектування модулів та їх взаємодії. Схема бази даних. Проектування API та мікросервісів. Масштабованість та надійність.`
        },
        {
            id: 5,
            key: "development_system",
            progress: 0,
            status: "pending",
            content: `Розробка системи. Імплементація основних модулів. Розробка бізнес-логіки. Інтеграція зовнішніх сервісів. Реалізація системи безпеки. Налаштування конфігурації та середовищ. Документування архітектури.`
        },
        {
            id: 6,
            key: "integration",
            progress: 0,
            status: "pending",
            content: `Інтеграція та тестування. Інтеграція модулів системи. Тестування взаємодії компонентів. Навантажувальне тестування. Тестування безпеки. Валідація роботи системи в різних сценаріях. Тестування відмовостійкості.`
        },
        {
            id: 7,
            key: "deployment_system",
            progress: 0,
            status: "pending",
            content: `Впровадження системи. Розгортання на production серверах. Міграція даних. Навчання користувачів. Технічна підтримка. Моніторинг продуктивності та помилок. План обслуговування.`
        }
    ];
}
function adaptForRecommendation(baseStructure, analysis) {
    const { audience } = analysis;
    return [
        ...baseStructure,
        {
            id: 4,
            key: "recommendation_algorithms",
            progress: 0,
            status: "pending",
            content: `Алгоритми рекомендацій. Аналіз методів рекомендаційних систем (колаборативна фільтрація, контент-базована, гібридна). Вибір та адаптація алгоритмів. Розробка моделі рекомендацій. Критерії релевантності.`
        },
        {
            id: 5,
            key: "data_processing",
            progress: 0,
            status: "pending",
            content: `Обробка даних. Збір та підготовка даних для навчання моделі. Feature engineering. Обробка відсутніх даних. Нормалізація та стандартизація. Створення наборів даних для тренування та тестування. Аналіз якості даних.`
        },
        {
            id: 6,
            key: "model_implementation",
            progress: 0,
            status: "pending",
            content: `Реалізація моделі. Імплементація алгоритмів рекомендацій. Навчання моделі на підготовлених даних. Оптимізація гіперпараметрів. Валідація якості рекомендацій. Інтеграція моделі в систему. Моніторинг якості рекомендацій.`
        },
        {
            id: 7,
            key: "evaluation_recommendation",
            progress: 0,
            status: "pending",
            content: `Оцінка ефективності. Метрики оцінки якості рекомендацій (precision, recall, F1-score). A/B тестування різних підходів. Аналіз релевантності рекомендацій для ${audience}. Користувацьке тестування. Аналіз конверсії.`
        }
    ];
}
function adaptForPlanning(baseStructure, analysis) {
    const { audience } = analysis;
    return [
        ...baseStructure,
        {
            id: 4,
            key: "system_design",
            progress: 0,
            status: "pending",
            content: `Проектування системи планування. Архітектура системи управління завданнями. Алгоритми оптимізації розкладу. Модель даних для ${audience}. Дизайн інтерфейсу планування. Інтеграція з календарними системами. Синхронізація між пристроями.`
        },
        {
            id: 5,
            key: "algorithm_development",
            progress: 0,
            status: "pending",
            content: `Розробка алгоритмів планування. Алгоритми розподілу ресурсів. Оптимізація навантаження. Прогнозування часу виконання. Персоналізація рекомендацій. Конфлікт розкладів. Адаптивне планування на основі історії.`
        },
        {
            id: 6,
            key: "implementation",
            progress: 0,
            status: "pending",
            content: `Реалізація функціоналу планування. Модуль створення та редагування завдань. Система сповіщень та нагадувань. Статистика та аналітика продуктивності. Експорт/імпорт даних. Офлайн-режим роботи. Синхронізація даних.`
        },
        {
            id: 7,
            key: "testing_optimization",
            progress: 0,
            status: "pending",
            content: `Тестування та оптимізація. Тестування алгоритмів на реальних даних. Юзабіліті тестування з ${audience}. Навантажувальне тестування. Оптимізація швидкодії. Тестування точності прогнозів. Порівняння з існуючими рішеннями.`
        }
    ];
}
function adaptForOptimization(baseStructure) {
    return [
        ...baseStructure,
        {
            id: 4,
            key: "analysis_current_state",
            progress: 0,
            status: "pending",
            content: `Аналіз поточного стану. Діагностика проблем продуктивності. Вимірювання ключових показників. Аналіз bottlenecks. Benchmarking існуючих рішень. Визначення цілей оптимізації. Критерії оцінки успішності.`
        },
        {
            id: 5,
            key: "optimization_strategy",
            progress: 0,
            status: "pending",
            content: `Стратегія оптимізації. Вибір методів та підходів. Пріоритизація напрямів оптимізації. Оцінка ресурсів та ризиків. План впровадження змін. Критерії прийняття рішень. Методика контролю якості.`
        },
        {
            id: 6,
            key: "implementation_optimization",
            progress: 0,
            status: "pending",
            content: `Реалізація оптимізаційних заходів. Технічні вдосконалення. Алгоритмічні оптимізації. Оптимізація баз даних. Кешування та мемоізація. Паралелізація обчислень. Оптимізація мережевих запитів.`
        },
        {
            id: 7,
            key: "performance_testing",
            progress: 0,
            status: "pending",
            content: `Тестування продуктивності. Load testing та stress testing. Вимірювання показників до/після оптимізації. Аналіз впливу на користувацький досвід. Виявлення нових bottlenecks. Валідація стабільності рішення.`
        }
    ];
}
// Додайте також адаптацію для загального типу проектів
function adaptForGeneral(baseStructure) {
    return [
        ...baseStructure,
        {
            id: 4,
            key: "design_general",
            progress: 0,
            status: "pending",
            content: `Проектування рішення. Розробка архітектури проекту. Вибір технологій та інструментів. Проектування інтерфейсу користувача. Планування робочих процесів. Визначення критеріїв успіху. Управління ризиками.`
        },
        {
            id: 5,
            key: "implementation_general",
            progress: 0,
            status: "pending",
            content: `Реалізація проекту. Розробка основних функціональних модулів. Інтеграція компонентів. Тестування функціональності. Оптимізація продуктивності. Документування коду та процесів. Контроль якості розробки.`
        },
        {
            id: 6,
            key: "testing_general",
            progress: 0,
            status: "pending",
            content: `Тестування та валідація. Комплексне тестування системи. Перевірка відповідності вимогам. Юзабіліті тестування. Виправлення помилок та доопрацювання. Підготовка до впровадження. Приймальні випробування.`
        },
        {
            id: 7,
            key: "deployment_general",
            progress: 0,
            status: "pending",
            content: `Впровадження рішення. Розгортання в робочому середовищі. Навчання користувачів. Технічна підтримка. Збір зворотного зв'язку. Моніторинг роботи системи. Обслуговування та оновлення.`
        }
    ];
}
app.post("/api/analyze-text", async (req, res) => {
    try {
        const { text } = req.body;
        console.log("Analyzing text:", text?.substring(0, 100));
        if (!text || typeof text !== "string") {
            return res.status(400).json({
                message: "Text is required and should be a string.",
                analysis: generateFallbackAnalysis("")
            });
        }
        let analysis;
        try {
            analysis = await analyzeWithHuggingFace(text);
            console.log("Hugging Face analysis successful");
        }
        catch (error) {
            console.error("Hugging Face analysis failed, using fallback:", error);
            analysis = generateFallbackAnalysis(text);
        }
        console.log("Returning analysis result");
        return res.status(200).json(analysis);
    }
    catch (error) {
        console.error("Error analyzing text:", error);
        const text = req.body.text || "";
        const fallbackAnalysis = generateFallbackAnalysis(text);
        return res.status(200).json(fallbackAnalysis);
    }
});
// Hugging Face analysis function
async function analyzeWithHuggingFace(text) {
    // Check if API token is available
    if (!process.env.HF_TOKEN) {
        console.warn('Hugging Face token not found, using fallback analysis');
        throw new Error('Hugging Face token not configured');
    }
    try {
        const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-mnli', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.HF_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: text,
                parameters: {
                    candidate_labels: [
                        "well structured",
                        "poorly structured",
                        "academic writing",
                        "informal writing",
                        "coherent logic",
                        "confusing logic",
                        "good vocabulary",
                        "poor vocabulary",
                        "clear arguments",
                        "unclear arguments",
                        "proper formatting",
                        "needs formatting improvement"
                    ]
                }
            })
        });
        if (!response.ok) {
            if (response.status === 401) {
                console.error('Hugging Face API: Invalid token (401)');
                throw new Error('Authentication failed - check HF_TOKEN');
            }
            else if (response.status === 503) {
                console.error('Hugging Face API: Model is loading (503)');
                throw new Error('Model is loading, please try again later');
            }
            throw new Error(`Hugging Face API error: ${response.status}`);
        }
        const data = await response.json();
        return processHuggingFaceResults(data, text);
    }
    catch (error) {
        console.error('Hugging Face analysis failed:', error);
        throw error;
    }
}
// Process Hugging Face results
function processHuggingFaceResults(data, originalText) {
    const { labels, scores } = data;
    // Calculate basic metrics
    const words = originalText.split(/\s+/).filter(word => word.length > 0).length;
    const sentences = originalText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = originalText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    // Analyze classification results
    const positiveLabels = [
        "well structured",
        "academic writing",
        "coherent logic",
        "good vocabulary",
        "clear arguments",
        "proper formatting"
    ];
    const negativeLabels = [
        "poorly structured",
        "informal writing",
        "confusing logic",
        "poor vocabulary",
        "unclear arguments",
        "needs formatting improvement"
    ];
    let positiveScore = 0;
    let negativeScore = 0;
    const strengths = [];
    const issues = [];
    const suggestions = [];
    // Analyze each label and its score
    labels.forEach((label, index) => {
        const score = scores[index];
        if (positiveLabels.includes(label) && score > 0.3) {
            positiveScore += score;
            const strength = mapLabelToStrength(label);
            if (strength && !strengths.includes(strength)) {
                strengths.push(strength);
            }
        }
        if (negativeLabels.includes(label) && score > 0.3) {
            negativeScore += score;
            const issue = mapLabelToIssue(label);
            const suggestion = mapLabelToSuggestion(label);
            if (issue && !issues.includes(issue)) {
                issues.push(issue);
            }
            if (suggestion && !suggestions.includes(suggestion)) {
                suggestions.push(suggestion);
            }
        }
    });
    // Calculate overall score
    const totalScore = positiveScore + negativeScore;
    const overallScore = totalScore > 0
        ? Math.round((positiveScore / totalScore) * 100)
        : 50;
    // Fallback content if no strengths/issues detected
    if (strengths.length === 0) {
        strengths.push('Текст має потенціал для розвитку');
    }
    if (issues.length === 0 && words < 10) {
        issues.push('Текст занадто короткий для глибокого аналізу');
        suggestions.push('Додайте більше деталей та пояснень');
    }
    return {
        metrics: {
            wordCount: words,
            sentenceCount: sentences,
            paragraphCount: paragraphs,
            characterCount: originalText.length,
            averageSentenceLength: sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0,
            averageWordLength: words > 0 ? Math.round((originalText.replace(/\s/g, '').length / words) * 10) / 10 : 0,
            readabilityScore: Math.max(30, Math.min(95, overallScore)),
            coherenceScore: Math.max(30, Math.min(95, overallScore - 10))
        },
        strengths: strengths.slice(0, 3),
        issues: issues.slice(0, 3),
        suggestions: suggestions.slice(0, 4),
        overallScore: Math.max(20, Math.min(95, overallScore))
    };
}
// Label mapping functions
function mapLabelToStrength(label) {
    const mapping = {
        "well structured": "Гарна структура тексту",
        "academic writing": "Академічний стиль викладу",
        "coherent logic": "Логічна послідовність думок",
        "good vocabulary": "Багатий словниковий запас",
        "clear arguments": "Чіткі та переконливі аргументи",
        "proper formatting": "Правильне форматування"
    };
    return mapping[label] || "";
}
function mapLabelToIssue(label) {
    const mapping = {
        "poorly structured": "Погана структура тексту",
        "informal writing": "Неформальний стиль викладу",
        "confusing logic": "Нелогічна послідовність думок",
        "poor vocabulary": "Обмежений словниковий запас",
        "unclear arguments": "Нечіткі аргументи",
        "needs formatting improvement": "Потребує покращення форматування"
    };
    return mapping[label] || "";
}
function mapLabelToSuggestion(label) {
    const mapping = {
        "poorly structured": "Покращте структуру тексту - додайте вступ, основну частину та висновки",
        "informal writing": "Використовуйте більш академічний стиль викладу",
        "confusing logic": "Переконайтесь у логічній послідовності ваших думок",
        "poor vocabulary": "Використовуйте більш різноманітну лексику",
        "unclear arguments": "Уточніть та розкрийте ваші аргументи",
        "needs formatting improvement": "Зверніть увагу на форматування тексту"
    };
    return mapping[label] || "Працюйте над покращенням якості тексту";
}
// Fallback analysis function (when Hugging Face is unavailable)
function generateFallbackAnalysis(text) {
    if (!text || typeof text !== 'string') {
        text = '';
    }
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const characters = text.length;
    const charactersWithoutSpaces = text.replace(/\s/g, '').length;
    const avgSentenceLength = sentences > 0 ? words / sentences : 0;
    const avgWordLength = words > 0 ? charactersWithoutSpaces / words : 0;
    let qualityScore = 50;
    const suggestions = [];
    let strengths = [];
    const issues = [];
    // Character repetition analysis
    const repeatedChars = text.match(/(.)\1{3,}/g);
    if (repeatedChars && repeatedChars.length > 0) {
        qualityScore -= 20;
        issues.push('Виявлено надмірне повторення символів');
        suggestions.push('Уникніть повторення однакових символів підряд');
    }
    // Text length analysis
    if (words < 10) {
        qualityScore -= 15;
        issues.push('Текст занадто короткий для аналізу');
        suggestions.push('Додайте більше змістовного тексту для кращого аналізу');
    }
    else if (words < 50) {
        qualityScore -= 5;
        issues.push('Текст може бути недостатньо детальним');
        suggestions.push('Розкрийте тему більш детально');
    }
    else if (words > 200) {
        qualityScore += 10;
        strengths.push('Достатній обсяг тексту для розкриття теми');
    }
    // Sentence structure analysis
    if (sentences === 0 && words > 0) {
        qualityScore -= 10;
        issues.push('Відсутні розділові знаки');
        suggestions.push('Використовуйте крапки, знаки оклику чи питання для розділення речень');
    }
    if (avgSentenceLength > 25 && sentences > 0) {
        qualityScore -= 8;
        issues.push('Речення занадто довгі');
        suggestions.push('Розбийте довгі речення на коротші для кращої читабельності');
    }
    if (avgSentenceLength < 5 && sentences > 2) {
        qualityScore -= 5;
        issues.push('Речення занадто короткі');
        suggestions.push('Об\'єднайте надто короткі речення для покращення плавності тексту');
    }
    // Paragraph analysis
    if (paragraphs < 2 && words > 100) {
        qualityScore -= 5;
        issues.push('Текст потребує розділення на абзаци');
        suggestions.push('Розділіть текст на абзаци для кращої структуризації');
    }
    else if (paragraphs >= 3) {
        qualityScore += 5;
        strengths.push('Гарна структура з чіткими абзацами');
    }
    // Vocabulary diversity analysis
    const uniqueWords = new Set(text.toLowerCase().split(/\s+/).filter(word => word.length > 2));
    const diversityRatio = uniqueWords.size / Math.max(1, words);
    if (diversityRatio < 0.3 && words > 20) {
        qualityScore -= 10;
        issues.push('Низька лексична різноманітність');
        suggestions.push('Використовуйте більш різноманітну лексику');
    }
    else if (diversityRatio > 0.6) {
        qualityScore += 10;
        strengths.push('Висока лексична різноманітність');
    }
    // Key elements check for longer texts
    if (words > 50) {
        const hasIntroduction = /вступ|актуальність|мета|завдання/i.test(text);
        const hasConclusion = /висновок|результат|підсумок|висновки/i.test(text);
        const hasExamples = /наприклад|приклад|як приклад/i.test(text);
        if (hasIntroduction) {
            qualityScore += 5;
            strengths.push('Наявний вступ або постановка задачі');
        }
        else {
            suggestions.push('Розгляньте можливість додати вступну частину');
        }
        if (hasConclusion) {
            qualityScore += 5;
            strengths.push('Чіткі висновки або підсумки');
        }
        else {
            suggestions.push('Додайте висновки або підсумки');
        }
        if (hasExamples) {
            qualityScore += 5;
            strengths.push('Використання прикладів для ілюстрації');
        }
        else if (words > 100) {
            suggestions.push('Використовуйте приклади для ілюстрації ваших думок');
        }
    }
    // Determine strengths based on quality score
    if (qualityScore > 70) {
        if (diversityRatio > 0.6) {
            strengths.push('Висока лексична різноманітність');
        }
        if (avgSentenceLength >= 8 && avgSentenceLength <= 20) {
            strengths.push('Оптимальна довжина речень');
        }
    }
    else if (qualityScore > 50) {
        strengths.push('Текст має потенціал для покращення');
        strengths.push('Базова структура присутня');
    }
    else {
        strengths.push('Текст потребує серйозної роботи над структурою та змістом');
    }
    // Additional checks for very short texts
    if (words <= 3) {
        issues.push('Недостатньо інформації для аналізу');
        suggestions.push('Напишіть більш розгорнутий текст для отримання корисних рекомендацій');
        strengths = ['Початок роботи над текстом'];
    }
    // Meaningful words check
    const meaningfulWords = text.split(/\s+/).filter(word => word.length > 2 &&
        !/^[0-9\W_]+$/.test(word) &&
        !/(.)\1{2,}/.test(word)).length;
    if (meaningfulWords < words * 0.7 && words > 10) {
        qualityScore -= 10;
        issues.push('Багато незмістовних слів або символів');
        suggestions.push('Зосередьтеся на змістовному викладі думок');
    }
    // Normalize score
    qualityScore = Math.max(10, Math.min(95, qualityScore));
    // Ensure we have content in each array
    if (strengths.length === 0) {
        strengths.push('Текст успішно проаналізовано');
    }
    if (issues.length === 0 && qualityScore < 80) {
        issues.push('Можливі незначні проблеми з форматуванням');
    }
    if (suggestions.length === 0) {
        suggestions.push('Продовжуйте роботу над вдосконаленням тексту');
    }
    return {
        metrics: {
            wordCount: words,
            sentenceCount: sentences,
            paragraphCount: paragraphs,
            characterCount: characters,
            averageSentenceLength: Math.round(avgSentenceLength * 10) / 10,
            averageWordLength: Math.round(avgWordLength * 10) / 10,
            readabilityScore: Math.max(10, Math.min(95, qualityScore)),
            coherenceScore: Math.max(20, Math.min(90, qualityScore - 10))
        },
        suggestions: suggestions.slice(0, 5),
        strengths: strengths,
        issues: issues.length > 0 ? issues : ['Основних проблем не виявлено'],
        overallScore: qualityScore
    };
}
// GET /api/teacher/profile/:id - отримати профіль викладача за ID
app.get("/api/teacher/profile/:id", async (req, res) => {
    try {
        const teacherId = req.params.id;
        // Валідація ID
        if (!teacherId || isNaN(Number(teacherId))) {
            return res.status(400).json({ message: "Invalid teacher ID" });
        }
        const result = await pool.query(`SELECT 
        u.id,
        u.name,
        u.email,
        u.faculty_id,
        u.department_id,
        d.name as department_name,
        f.name as faculty_name,
        tp.title,
        tp.bio,
        tp.avatar_url,
        tp.office_hours,
        tp.phone,
        tp.website,
        tp.created_at,
        tp.updated_at
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN faculties f ON u.faculty_id = f.id
       LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
       WHERE u.id = $1 AND u.role = 'teacher'`, [teacherId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        const teacherData = result.rows[0];
        // Розділяємо ім'я на частини
        const nameParts = teacherData.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        res.json({
            id: teacherData.id,
            name: teacherData.name,
            firstName,
            lastName,
            title: teacherData.title || "",
            department: teacherData.department_name || "Кафедра не вказана",
            departmentId: teacherData.department_id,
            faculty: teacherData.faculty_name || "Факультет не вказаний",
            facultyId: teacherData.faculty_id,
            email: teacherData.email,
            bio: teacherData.bio || "",
            avatarUrl: teacherData.avatar_url,
            officeHours: teacherData.office_hours || "",
            phone: teacherData.phone || "",
            website: teacherData.website || "",
            createdAt: teacherData.created_at,
            updatedAt: teacherData.updated_at
        });
    }
    catch (err) {
        console.error("Error fetching teacher profile:", err);
        res.status(500).json({ message: "Database error fetching teacher profile" });
    }
});
// GET /api/faculties/:id - отримати факультет за ID
app.get("/api/faculties/:id", async (req, res) => {
    try {
        const facultyId = req.params.id;
        if (!facultyId || isNaN(Number(facultyId))) {
            return res.status(400).json({ message: "Invalid faculty ID" });
        }
        const result = await pool.query("SELECT id, name FROM faculties WHERE id = $1", [facultyId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Faculty not found" });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error("Error fetching faculty:", err);
        res.status(500).json({ message: "Database error fetching faculty" });
    }
});
// GET всіх ресурсів
app.get("/api/resources", async (req, res) => {
    try {
        const result = await pool.query("SELECT r.*, u.name as created_by_name FROM resources r LEFT JOIN users u ON r.created_by = u.id ORDER BY r.created_at DESC");
        res.json(result.rows);
    }
    catch (err) {
        console.error("Error fetching resources:", err);
        res.status(500).json({ message: "Database error fetching resources" });
    }
});
// GET ресурсу за ID
app.get("/api/resources/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT r.*, u.name as created_by_name FROM resources r LEFT JOIN users u ON r.created_by = u.id WHERE r.id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Ресурс не знайдено" });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error("Error fetching resource:", err);
        res.status(500).json({ message: "Database error fetching resource" });
    }
});
// POST новий ресурс
app.post("/api/resources", authenticateToken, async (req, res) => {
    try {
        const { title, description, link, category } = req.body;
        // Type guard for req.user
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        // Перевірка, що користувач - викладач
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: "Доступ заборонено" });
        }
        // Валідація даних
        if (!title || !link) {
            return res.status(400).json({ message: "Назва та посилання обов'язкові" });
        }
        // Додаткова перевірка userId
        if (!req.user.userId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }
        const result = await pool.query(`INSERT INTO resources (title, description, link, category, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [title, description, link, category || 'other', req.user.userId]);
        // Отримуємо повну інформацію про ресурс з іменем користувача
        const fullResource = await pool.query("SELECT r.*, u.name as created_by_name FROM resources r LEFT JOIN users u ON r.created_by = u.id WHERE r.id = $1", [result.rows[0].id]);
        res.status(201).json({
            message: "Ресурс додано успішно",
            resource: fullResource.rows[0] // Повертаємо ресурс з created_by_name
        });
    }
    catch (err) {
        console.error("Error adding resource:", err);
        res.status(500).json({ message: "Помилка бази даних" });
    }
});
// PUT оновлення ресурсу
app.put("/api/resources/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, link, category } = req.body;
        console.log(`Updating resource ${id} with:`, { title, description, link, category });
        // Type guard for req.user
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        // Перевірка прав власності - вибираємо тільки created_by
        const resourceCheck = await pool.query("SELECT created_by FROM resources WHERE id = $1", [id]);
        if (resourceCheck.rows.length === 0) {
            return res.status(404).json({ message: "Ресурс не знайдено" });
        }
        if (resourceCheck.rows[0].created_by !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Доступ заборонено" });
        }
        // Валідація даних
        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Назва обов'язкова" });
        }
        if (!link || !link.trim()) {
            return res.status(400).json({ message: "Посилання обов'язкове" });
        }
        // Форматування посилання
        let formattedLink = link.trim();
        if (!formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
            formattedLink = 'https://' + formattedLink;
        }
        const result = await pool.query(`UPDATE resources
       SET title = $1, description = $2, link = $3, category = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`, [title.trim(), description?.trim() || '', formattedLink, category || 'other', id]);
        console.log('Resource updated successfully:', result.rows[0]);
        // Отримуємо повну інформацію про ресурс з іменем користувача
        const fullResource = await pool.query("SELECT r.*, u.name as created_by_name FROM resources r LEFT JOIN users u ON r.created_by = u.id WHERE r.id = $1", [id]);
        res.json({
            message: "Ресурс оновлено успішно",
            resource: fullResource.rows[0] // Повертаємо ресурс з created_by_name
        });
    }
    catch (err) {
        console.error("Error updating resource:", err);
        res.status(500).json({ message: "Помилка бази даних при оновленні ресурсу" });
    }
});
// DELETE видалення ресурсу
app.delete("/api/resources/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        // Type guard for req.user
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        // Перевірка прав власності
        const resourceCheck = await pool.query("SELECT created_by FROM resources WHERE id = $1", [id]);
        if (resourceCheck.rows.length === 0) {
            return res.status(404).json({ message: "Ресурс не знайдено" });
        }
        if (resourceCheck.rows[0].created_by !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Доступ заборонено" });
        }
        await pool.query("DELETE FROM resources WHERE id = $1", [id]);
        res.json({ message: "Ресурс видалено успішно" });
    }
    catch (err) {
        console.error("Error deleting resource:", err);
        res.status(500).json({ message: "Помилка мережі" });
    }
});
// ============ CHAT ENDPOINTS ============
// GET /api/chat - отримати список чатів користувача
app.get("/api/chat", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const result = await pool.query(`SELECT 
        c.id,
        c.name,
        c.type,
        c.avatar_url,
        c.description,
        c.last_message,
        c.last_message_at,
        c.created_at,
        cm.unread_count,
        u.is_online,
        u.last_seen
       FROM chat_members cm
       JOIN chats c ON cm.chat_id = c.id
       LEFT JOIN users u ON c.type != 'group' AND c.id = (
         SELECT CASE 
           WHEN cm1.user_id = $1 THEN cm2.user_id 
           ELSE cm1.user_id 
         END
         FROM chat_members cm1
         JOIN chat_members cm2 ON cm1.chat_id = cm2.chat_id
         WHERE cm1.chat_id = c.id AND cm1.user_id != cm2.user_id
         LIMIT 1
       )
       WHERE cm.user_id = $1
       ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC`, [userId]);
        const chats = await Promise.all(result.rows.map(async (row) => {
            // Для групових чатів отримуємо список учасників
            if (row.type === 'group') {
                const membersResult = await pool.query(`SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.is_online
           FROM chat_members cm
           JOIN users u ON cm.user_id = u.id
           WHERE cm.chat_id = $1`, [row.id]);
                const members = membersResult.rows.map((member) => ({
                    id: member.id.toString(),
                    name: member.name,
                    avatar: member.name.split(' ').map((n) => n[0]).join('').toUpperCase(),
                    avatarUrl: member.avatar_url ?? undefined,
                    email: member.email,
                    type: member.role === 'teacher' ? 'supervisor' : 'student',
                    isOnline: member.is_online
                }));
                return {
                    id: row.id.toString(),
                    name: row.name,
                    avatar: row.name.split(' ').map((n) => n[0]).join('').toUpperCase(),
                    avatarUrl: row.avatar_url ?? undefined,
                    type: row.type,
                    isOnline: row.is_online || false,
                    lastSeen: row.last_seen ? new Date(row.last_seen).toLocaleString('uk-UA') : undefined,
                    unreadCount: row.unread_count || 0,
                    lastMessage: row.last_message,
                    members: members, // Використовуємо отриманих учасників для групових чатів
                    createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
                    description: row.description
                };
            }
            // Для особистих чатів повертаємо без списку учасників
            return {
                id: row.id.toString(),
                name: row.name,
                avatar: row.name.split(' ').map((n) => n[0]).join('').toUpperCase(),
                avatarUrl: row.avatar_url ?? undefined,
                type: row.type,
                isOnline: row.is_online || false,
                lastSeen: row.last_seen ? new Date(row.last_seen).toLocaleString('uk-UA') : undefined,
                unreadCount: row.unread_count || 0,
                lastMessage: row.last_message,
                members: undefined, // Для не групових чатів members = undefined
                createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
                description: row.description
            };
        }));
        res.json(chats);
    }
    catch (err) {
        console.error("Error fetching chats:", err);
        res.status(500).json({ message: "Database error fetching chats" });
    }
});
// GET /api/chat/:chatId/messages - отримати повідомлення чату
app.get("/api/chat/:chatId/messages", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { chatId } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Перевірка доступу до чату
        const accessCheck = await pool.query('SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2', [chatId, userId]);
        if (accessCheck.rows.length === 0) {
            return res.status(403).json({ message: "No access to this chat" });
        }
        const result = await pool.query(`SELECT 
        m.id,
        m.chat_id as "chatId",
        m.sender_id as "sender",
        u.name,
        m.content,
        m.message_type as "type",
        m.reply_to as "replyTo",
        m.attachment_data as "attachment",
        m.created_at as "timestamp",
        false as "isPinned",
        false as "isEdited",
        'sent' as "status"
       FROM chat_messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.chat_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`, [chatId, parseInt(limit), parseInt(offset)]);
        const messages = result.rows.map((row) => ({
            ...row,
            id: row.id.toString(),
            sender: row.sender.toString(),
            timestamp: new Date(row.timestamp).toLocaleTimeString('uk-UA', {
                hour: '2-digit', minute: '2-digit'
            })
        }));
        // Оновлюємо лічильник непрочитаних
        await pool.query(`UPDATE chat_members 
       SET unread_count = 0 
       WHERE chat_id = $1 AND user_id = $2`, [chatId, userId]);
        res.json(messages.reverse()); // Повертаємо в хронологічному порядку
    }
    catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ message: "Database error fetching messages" });
    }
});
// POST /api/chat/create - створити приватний чат
app.post("/api/chat/create", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { participantId } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!participantId) {
            return res.status(400).json({ message: "Participant ID is required" });
        }
        // Перевіряємо чи існує вже приватний чат
        const existingChat = await pool.query(`SELECT c.id FROM chats c
       JOIN chat_members cm1 ON c.id = cm1.chat_id
       JOIN chat_members cm2 ON c.id = cm2.chat_id
       WHERE c.type = 'private' 
       AND cm1.user_id = $1 AND cm2.user_id = $2`, [userId, participantId]);
        if (existingChat.rows.length > 0) {
            return res.json({
                chatId: existingChat.rows[0].id.toString(),
                message: "Chat already exists"
            });
        }
        // Отримуємо ім'я учасника для назви чату
        const participantResult = await pool.query('SELECT name FROM users WHERE id = $1', [participantId]);
        if (participantResult.rows.length === 0) {
            return res.status(404).json({ message: "Participant not found" });
        }
        const participantName = participantResult.rows[0].name;
        // Створюємо новий чат з назвою тільки учасника
        const chatResult = await pool.query(`INSERT INTO chats (name, type, created_by, created_at)
       VALUES ($1, 'private', $2, NOW())
       RETURNING id`, [participantName, userId] // Тільки ім'я учасника
        );
        const chatId = chatResult.rows[0].id.toString();
        // Додаємо учасників
        await pool.query('INSERT INTO chat_members (chat_id, user_id, joined_at) VALUES ($1, $2, NOW())', [chatId, userId]);
        await pool.query('INSERT INTO chat_members (chat_id, user_id, joined_at) VALUES ($1, $2, NOW())', [chatId, participantId]);
        res.status(201).json({
            chatId,
            message: "Chat created successfully"
        });
    }
    catch (err) {
        console.error("Error creating chat:", err);
        res.status(500).json({ message: "Database error creating chat" });
    }
});
// POST /api/chat/create-group - створити груповий чат
app.post("/api/chat/create-group", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { name, memberIds, description, settings } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!name || !memberIds || !Array.isArray(memberIds)) {
            return res.status(400).json({ message: "Name and memberIds are required" });
        }
        // Створюємо груповий чат
        const chatResult = await pool.query(`INSERT INTO chats (name, type, description, settings, created_by, created_at)
       VALUES ($1, 'group', $2, $3, $4, NOW())
       RETURNING id`, [name, description || '', JSON.stringify(settings || {}), userId]);
        const chatId = chatResult.rows[0].id.toString();
        // Додаємо всіх учасників (включаючи творця)
        const allMembers = [userId, ...memberIds];
        for (const memberId of allMembers) {
            await pool.query('INSERT INTO chat_members (chat_id, user_id, joined_at) VALUES ($1, $2, NOW())', [chatId, memberId]);
        }
        res.status(201).json({
            chatId,
            message: "Group chat created successfully"
        });
    }
    catch (err) {
        console.error("Error creating group chat:", err);
        res.status(500).json({ message: "Database error creating group chat" });
    }
});
// POST /api/chat/:chatId/messages - надіслати повідомлення (альтернатива WebSocket)
app.post("/api/chat/:chatId/messages", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { chatId } = req.params;
        const { content, type = 'text', replyTo, attachment } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!content && !attachment) {
            return res.status(400).json({ message: "Content or attachment is required" });
        }
        // Перевірка доступу до чату
        const accessCheck = await pool.query('SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2', [chatId, userId]);
        if (accessCheck.rows.length === 0) {
            return res.status(403).json({ message: "No access to this chat" });
        }
        // Зберігаємо повідомлення
        const messageResult = await pool.query(`INSERT INTO chat_messages 
       (chat_id, sender_id, content, message_type, reply_to, attachment_data, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, created_at`, [
            chatId,
            userId,
            content,
            type,
            replyTo ? JSON.stringify(replyTo) : null,
            attachment ? JSON.stringify(attachment) : null
        ]);
        const dbMessage = messageResult.rows[0];
        // Оновлюємо останнє повідомлення в чаті
        await pool.query(`UPDATE chats SET last_message = $1, last_message_at = NOW() WHERE id = $2`, [content || '📎 Вкладення', chatId]);
        // Отримуємо інформацію про відправника
        const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
        const message = {
            id: dbMessage.id.toString(),
            sender: userId.toString(),
            name: userResult.rows[0].name,
            content,
            timestamp: new Date(dbMessage.created_at).toLocaleTimeString('uk-UA', {
                hour: '2-digit', minute: '2-digit'
            }),
            type: type || 'text',
            chatId,
            status: 'sent',
            replyTo,
            attachment
        };
        res.status(201).json({
            message: "Message sent successfully",
            messages: message
        });
    }
    catch (err) {
        console.error("Error sending message:", err);
        res.status(500).json({ message: "Database error sending message" });
    }
});
// PUT /api/messages/:messageId - редагувати повідомлення
app.put("/api/messages/:messageId", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { messageId } = req.params;
        const { content } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }
        // Перевіряємо чи користувач є автором повідомлення
        const messageCheck = await pool.query('SELECT sender_id FROM chat_messages WHERE id = $1', [messageId]);
        if (messageCheck.rows.length === 0) {
            return res.status(404).json({ message: "Message not found" });
        }
        if (messageCheck.rows[0].sender_id !== userId) {
            return res.status(403).json({ message: "Can only edit your own messages" });
        }
        // Оновлюємо повідомлення
        await pool.query(`UPDATE chat_messages 
       SET content = $1, is_edited = true, updated_at = NOW()
       WHERE id = $2`, [content, messageId]);
        res.json({ message: "Message updated successfully" });
    }
    catch (err) {
        console.error("Error updating message:", err);
        res.status(500).json({ message: "Database error updating message" });
    }
});
// DELETE /api/messages/:messageId - видалити повідомлення
app.delete("/api/messages/:messageId", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { messageId } = req.params;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Перевіряємо чи користувач є автором повідомлення
        const messageCheck = await pool.query('SELECT sender_id, chat_id FROM chat_messages WHERE id = $1', [messageId]);
        if (messageCheck.rows.length === 0) {
            return res.status(404).json({ message: "Message not found" });
        }
        if (messageCheck.rows[0].sender_id !== userId) {
            return res.status(403).json({ message: "Can only delete your own messages" });
        }
        // Видаляємо повідомлення
        await pool.query('DELETE FROM chat_messages WHERE id = $1', [messageId]);
        res.json({ message: "Message deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting message:", err);
        res.status(500).json({ message: "Database error deleting message" });
    }
});
// POST /api/messages/:messageId/read - позначити повідомлення як прочитане
app.post("/api/messages/:messageId/read", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { messageId } = req.params;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Додаємо запис про прочитання
        await pool.query(`INSERT INTO message_read_receipts (message_id, user_id, read_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (message_id, user_id)
       DO UPDATE SET read_at = NOW()`, [messageId, userId]);
        res.json({ message: "Message marked as read" });
    }
    catch (err) {
        console.error("Error marking message as read:", err);
        res.status(500).json({ message: "Database error" });
    }
});
// GET /api/chat/:chatId/media - отримати медіафайли чату
app.get("/api/chat/:chatId/media", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { chatId } = req.params;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Перевірка доступу до чату
        const accessCheck = await pool.query('SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2', [chatId, userId]);
        if (accessCheck.rows.length === 0) {
            return res.status(403).json({ message: "No access to this chat" });
        }
        const result = await pool.query(`SELECT 
        m.id as message_id,
        m.attachment_data as attachment,
        m.message_type as type,
        m.created_at as timestamp
       FROM chat_messages m
       WHERE m.chat_id = $1 
       AND (m.attachment_data IS NOT NULL OR m.message_type IN ('image', 'video', 'file', 'voice'))
       ORDER BY m.created_at DESC`, [chatId]);
        const media = result.rows
            .filter((row) => row.attachment || row.type !== 'text')
            .map((row) => {
            const attachment = row.attachment ? JSON.parse(row.attachment) : null;
            let mediaType = 'file';
            if (row.type === 'voice') {
                mediaType = 'voice';
            }
            else if (attachment?.type?.startsWith('image/')) {
                mediaType = 'image';
            }
            else if (attachment?.type?.startsWith('video/')) {
                mediaType = 'video';
            }
            return {
                type: mediaType,
                url: attachment?.url || '',
                name: attachment?.name || 'Файл',
                timestamp: new Date(row.timestamp).toLocaleTimeString('uk-UA', {
                    hour: '2-digit', minute: '2-digit'
                }),
                messageId: row.message_id.toString(),
                thumbnail: attachment?.previewUrl
            };
        });
        res.json(media);
    }
    catch (err) {
        console.error("Error fetching media:", err);
        res.status(500).json({ message: "Database error fetching media" });
    }
});
// GET /api/chat/:chatId/search - пошук повідомлень
app.get("/api/chat/:chatId/search", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { chatId } = req.params;
        const { q, type, sender, date } = req.query;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!q) {
            return res.status(400).json({ message: "Search query is required" });
        }
        // Перевірка доступу до чату
        const accessCheck = await pool.query('SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2', [chatId, userId]);
        if (accessCheck.rows.length === 0) {
            return res.status(403).json({ message: "No access to this chat" });
        }
        let query = `
      SELECT 
        m.id,
        m.chat_id as "chatId",
        m.sender_id as "sender",
        u.name,
        m.content,
        m.message_type as "type",
        m.attachment_data as "attachment",
        m.created_at as "timestamp"
      FROM chat_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = $1 AND m.content ILIKE $2
    `;
        const params = [chatId, `%${q}%`];
        let paramIndex = 3;
        if (type && type !== 'all') {
            query += ` AND m.message_type = $${paramIndex}`;
            params.push(type);
            paramIndex++;
        }
        if (sender) {
            query += ` AND m.sender_id = $${paramIndex}`;
            params.push(sender);
            paramIndex++;
        }
        if (date) {
            query += ` AND DATE(m.created_at) = $${paramIndex}`;
            params.push(date);
            paramIndex++;
        }
        query += ` ORDER BY m.created_at DESC`;
        const result = await pool.query(query, params);
        const messages = result.rows.map((row) => ({
            ...row,
            id: row.id.toString(),
            sender: row.sender.toString(),
            timestamp: new Date(row.timestamp).toLocaleTimeString('uk-UA', {
                hour: '2-digit', minute: '2-digit'
            })
        }));
        res.json(messages);
    }
    catch (err) {
        console.error("Error searching messages:", err);
        res.status(500).json({ message: "Database error searching messages" });
    }
});
// POST /api/upload/chat - завантажити файл для чату
app.post("/api/upload/chat", authenticateToken, async (req, res) => {
    try {
        // Тут має бути логіка завантаження файлів
        // Для демонстрації повертаємо фейкові дані
        res.json({
            url: `/uploads/chat-${Date.now()}.file`,
            name: req.body.name || 'file',
            type: req.body.type || 'application/octet-stream',
            size: req.body.size || 0
        });
    }
    catch (err) {
        console.error("Error uploading file:", err);
        res.status(500).json({ message: "Error uploading file" });
    }
});
// PUT /api/chat/:chatId/mute - заглушити/відключити сповіщення чату
app.put("/api/chat/:chatId/mute", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { chatId } = req.params;
        const { muted } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        await pool.query(`UPDATE chat_members 
       SET is_muted = $1 
       WHERE chat_id = $2 AND user_id = $3`, [muted, chatId, userId]);
        res.json({
            message: muted ? "Chat muted" : "Chat unmuted",
            muted
        });
    }
    catch (err) {
        console.error("Error muting chat:", err);
        res.status(500).json({ message: "Database error" });
    }
});
// DELETE /api/chat/:chatId/leave - покинути груповий чат
app.delete("/api/chat/:chatId/leave", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { chatId } = req.params;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Перевіряємо чи це груповий чат
        const chatCheck = await pool.query('SELECT type FROM chats WHERE id = $1', [chatId]);
        if (chatCheck.rows.length === 0) {
            return res.status(404).json({ message: "Chat not found" });
        }
        if (chatCheck.rows[0].type !== 'group') {
            return res.status(400).json({ message: "Can only leave group chats" });
        }
        // Видаляємо користувача з учасників
        await pool.query('DELETE FROM chat_members WHERE chat_id = $1 AND user_id = $2', [chatId, userId]);
        res.json({ message: "Left group chat successfully" });
    }
    catch (err) {
        console.error("Error leaving chat:", err);
        res.status(500).json({ message: "Database error" });
    }
});
// ============ TEACHER PROFILE ENDPOINTS ============
// GET /api/teacher/profile - отримати профіль викладача
app.get("/api/teacher/profile", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Перевіряємо чи користувач є викладачем
        const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        if (userResult.rows[0].role !== 'teacher') {
            return res.status(403).json({ message: "Access denied. Teacher role required" });
        }
        // Отримуємо основну інформацію про викладача
        const teacherResult = await pool.query(`SELECT 
        u.id,
        u.name,
        u.email,
        u.faculty_id,
        u.department_id,
        d.name as department_name,
        f.name as faculty_name,
        tp.title,
        tp.bio,
        tp.avatar_url,
        tp.office_hours,
        tp.phone,
        tp.website,
        tp.created_at,
        tp.updated_at
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN faculties f ON u.faculty_id = f.id
       LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
       WHERE u.id = $1`, [userId]);
        if (teacherResult.rows.length === 0) {
            // Якщо профіль ще не створений, повертаємо базову інформацію
            const userInfo = await pool.query(`SELECT 
          u.id,
          u.name,
          u.email,
          u.faculty_id,
          u.department_id,
          d.name as department_name,
          f.name as faculty_name
         FROM users u
         LEFT JOIN departments d ON u.department_id = d.id
         LEFT JOIN faculties f ON u.faculty_id = f.id
         WHERE u.id = $1`, [userId]);
            if (userInfo.rows.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }
            const userData = userInfo.rows[0];
            // Розділяємо ім'я на частини
            const nameParts = userData.name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            res.json({
                id: userData.id,
                name: userData.name,
                firstName,
                lastName,
                title: "",
                department: userData.department_name || "Кафедра не вказана",
                departmentId: userData.department_id,
                faculty: userData.faculty_name || "Факультет не вказаний",
                facultyId: userData.faculty_id,
                email: userData.email,
                bio: "",
                avatarUrl: null,
                officeHours: "",
                phone: "",
                website: "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
        else {
            const teacherData = teacherResult.rows[0];
            // Розділяємо ім'я на частини
            const nameParts = teacherData.name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            res.json({
                id: teacherData.id,
                name: teacherData.name,
                firstName,
                lastName,
                title: teacherData.title || "",
                department: teacherData.department_name || "Кафедра не вказана",
                departmentId: teacherData.department_id,
                faculty: teacherData.faculty_name || "Факультет не вказаний",
                facultyId: teacherData.faculty_id,
                email: teacherData.email,
                bio: teacherData.bio || "",
                avatarUrl: teacherData.avatar_url,
                officeHours: teacherData.office_hours || "",
                phone: teacherData.phone || "",
                website: teacherData.website || "",
                createdAt: teacherData.created_at,
                updatedAt: teacherData.updated_at
            });
        }
    }
    catch (err) {
        console.error("Error fetching teacher profile:", err);
        res.status(500).json({ message: "Database error fetching teacher profile" });
    }
});
// PUT /api/teacher/profile - оновити профіль викладача
app.put("/api/teacher/profile", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { title, bio, avatarUrl, officeHours, phone, website } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Перевіряємо чи користувач є викладачем
        const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        if (userResult.rows[0].role !== 'teacher') {
            return res.status(403).json({ message: "Access denied. Teacher role required" });
        }
        // Перевіряємо чи профіль вже існує
        const existingProfile = await pool.query('SELECT user_id FROM teacher_profiles WHERE user_id = $1', [userId]);
        if (existingProfile.rows.length > 0) {
            // Оновлюємо існуючий профіль
            await pool.query(`UPDATE teacher_profiles 
         SET title = $1, bio = $2, avatar_url = $3, office_hours = $4, phone = $5, website = $6, updated_at = NOW()
         WHERE user_id = $7`, [title, bio, avatarUrl, officeHours, phone, website, userId]);
        }
        else {
            // Створюємо новий профіль
            await pool.query(`INSERT INTO teacher_profiles 
         (user_id, title, bio, avatar_url, office_hours, phone, website, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`, [userId, title, bio, avatarUrl, officeHours, phone, website]);
        }
        // Отримуємо оновлені дані з повною інформацією
        const updatedProfile = await pool.query(`SELECT 
        u.name,
        u.email,
        d.name as department_name,
        f.name as faculty_name,
        tp.title,
        tp.bio,
        tp.avatar_url,
        tp.office_hours,
        tp.phone,
        tp.website,
        tp.created_at,
        tp.updated_at
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN faculties f ON u.faculty_id = f.id
       LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
       WHERE u.id = $1`, [userId]);
        res.json({
            message: "Teacher profile updated successfully",
            profile: updatedProfile.rows[0]
        });
    }
    catch (err) {
        console.error("Error updating teacher profile:", err);
        res.status(500).json({ message: "Database error updating teacher profile" });
    }
});
// GET /api/teacher/works - отримати роботи викладача
app.get("/api/teacher/works", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Перевіряємо чи користувач є викладачем
        const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'teacher') {
            return res.status(403).json({ message: "Access denied. Teacher role required" });
        }
        // ДОДАНО ФІЛЬТРАЦІЮ ПО user_id
        const result = await pool.query(`SELECT 
        id,
        title,
        type,
        year,
        description,
        file_url,
        publication_url,
        created_at
       FROM teacher_works 
       WHERE user_id = $1 
       ORDER BY year DESC, created_at DESC`, [userId] // Використовуємо userId для фільтрації
        );
        const works = result.rows.map((row) => ({
            id: row.id.toString(),
            title: row.title,
            type: row.type,
            year: row.year,
            description: row.description,
            fileUrl: row.file_url,
            publicationUrl: row.publication_url,
            createdAt: row.created_at
        }));
        res.json(works);
    }
    catch (err) {
        console.error("Error fetching teacher works:", err);
        res.status(500).json({ message: "Database error fetching teacher works" });
    }
});
// POST /api/teacher/works - додати роботу викладача
app.post("/api/teacher/works", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { title, type, year, description, fileUrl, publicationUrl } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Перевіряємо чи користувач є викладачем
        const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'teacher') {
            return res.status(403).json({ message: "Access denied. Teacher role required" });
        }
        if (!title || !type || !year) {
            return res.status(400).json({ message: "Title, type and year are required" });
        }
        const result = await pool.query(`INSERT INTO teacher_works 
       (user_id, title, type, year, description, file_url, publication_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`, [userId, title, type, year, description || '', fileUrl, publicationUrl]);
        const newWork = {
            id: result.rows[0].id.toString(),
            title: result.rows[0].title,
            type: result.rows[0].type,
            year: result.rows[0].year,
            description: result.rows[0].description,
            fileUrl: result.rows[0].file_url,
            publicationUrl: result.rows[0].publication_url,
            createdAt: result.rows[0].created_at
        };
        res.status(201).json({
            message: "Work added successfully",
            work: newWork
        });
    }
    catch (err) {
        console.error("Error adding teacher work:", err);
        res.status(500).json({ message: "Database error adding teacher work" });
    }
});
// PUT /api/teacher/works/:workId - оновити роботу викладача
app.put("/api/teacher/works/:workId", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { workId } = req.params;
        const { title, type, year, description, fileUrl, publicationUrl } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!title || !type || !year) {
            return res.status(400).json({ message: "Title, type and year are required" });
        }
        // Перевіряємо чи робота належить користувачу
        const workCheck = await pool.query('SELECT id FROM teacher_works WHERE id = $1 AND user_id = $2', [workId, userId]);
        if (workCheck.rows.length === 0) {
            return res.status(404).json({ message: "Work not found or access denied" });
        }
        const result = await pool.query(`UPDATE teacher_works 
       SET title = $1, type = $2, year = $3, description = $4, file_url = $5, publication_url = $6, updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING *`, [title, type, year, description || '', fileUrl, publicationUrl, workId, userId]);
        const updatedWork = {
            id: result.rows[0].id.toString(),
            title: result.rows[0].title,
            type: result.rows[0].type,
            year: result.rows[0].year,
            description: result.rows[0].description,
            fileUrl: result.rows[0].file_url,
            publicationUrl: result.rows[0].publication_url,
            createdAt: result.rows[0].created_at
        };
        res.json({
            message: "Work updated successfully",
            work: updatedWork
        });
    }
    catch (err) {
        console.error("Error updating teacher work:", err);
        res.status(500).json({ message: "Database error updating teacher work" });
    }
});
// DELETE /api/teacher/works/:workId - видалити роботу викладача
app.delete("/api/teacher/works/:workId", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { workId } = req.params;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Перевіряємо чи робота належить користувачу
        const workCheck = await pool.query('SELECT id FROM teacher_works WHERE id = $1 AND user_id = $2', [workId, userId]);
        if (workCheck.rows.length === 0) {
            return res.status(404).json({ message: "Work not found or access denied" });
        }
        await pool.query('DELETE FROM teacher_works WHERE id = $1 AND user_id = $2', [workId, userId]);
        res.json({ message: "Work deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting teacher work:", err);
        res.status(500).json({ message: "Database error deleting teacher work" });
    }
});
// GET /api/teacher/directions - отримати напрямки досліджень
app.get("/api/teacher/directions", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Перевіряємо чи користувач є викладачем
        const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'teacher') {
            return res.status(403).json({ message: "Access denied. Teacher role required" });
        }
        // ДОДАНО ФІЛЬТРАЦІЮ ПО user_id
        const result = await pool.query(`SELECT 
        id,
        area,
        description,
        created_at
       FROM teacher_research_directions 
       WHERE user_id = $1 
       ORDER BY created_at DESC`, [userId] // Використовуємо userId для фільтрації
        );
        const directions = result.rows.map((row) => ({
            id: row.id.toString(),
            area: row.area,
            description: row.description,
            createdAt: row.created_at
        }));
        res.json(directions);
    }
    catch (err) {
        console.error("Error fetching teacher directions:", err);
        res.status(500).json({ message: "Database error fetching teacher directions" });
    }
});
// POST /api/teacher/directions - додати напрямок досліджень
app.post("/api/teacher/directions", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { area, description } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Перевіряємо чи користувач є викладачем
        const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'teacher') {
            return res.status(403).json({ message: "Access denied. Teacher role required" });
        }
        if (!area || !description) {
            return res.status(400).json({ message: "Area and description are required" });
        }
        const result = await pool.query(`INSERT INTO teacher_research_directions 
       (user_id, area, description, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`, [userId, area, description]);
        const newDirection = {
            id: result.rows[0].id.toString(),
            area: result.rows[0].area,
            description: result.rows[0].description,
            createdAt: result.rows[0].created_at
        };
        res.status(201).json({
            message: "Research direction added successfully",
            direction: newDirection
        });
    }
    catch (err) {
        console.error("Error adding teacher direction:", err);
        res.status(500).json({ message: "Database error adding teacher direction" });
    }
});
// PUT /api/teacher/directions/:directionId - оновити напрямок досліджень
app.put("/api/teacher/directions/:directionId", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { directionId } = req.params;
        const { area, description } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!area || !description) {
            return res.status(400).json({ message: "Area and description are required" });
        }
        // Перевіряємо чи напрямок належить користувачу
        const directionCheck = await pool.query('SELECT id FROM teacher_research_directions WHERE id = $1 AND user_id = $2', [directionId, userId]);
        if (directionCheck.rows.length === 0) {
            return res.status(404).json({ message: "Direction not found or access denied" });
        }
        const result = await pool.query(`UPDATE teacher_research_directions 
       SET area = $1, description = $2, updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING *`, [area, description, directionId, userId]);
        const updatedDirection = {
            id: result.rows[0].id.toString(),
            area: result.rows[0].area,
            description: result.rows[0].description,
            createdAt: result.rows[0].created_at
        };
        res.json({
            message: "Research direction updated successfully",
            direction: updatedDirection
        });
    }
    catch (err) {
        console.error("Error updating teacher direction:", err);
        res.status(500).json({ message: "Database error updating teacher direction" });
    }
});
// DELETE /api/teacher/directions/:directionId - видалити напрямок досліджень
app.delete("/api/teacher/directions/:directionId", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { directionId } = req.params;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Перевіряємо чи напрямок належить користувачу
        const directionCheck = await pool.query('SELECT id FROM teacher_research_directions WHERE id = $1 AND user_id = $2', [directionId, userId]);
        if (directionCheck.rows.length === 0) {
            return res.status(404).json({ message: "Direction not found or access denied" });
        }
        await pool.query('DELETE FROM teacher_research_directions WHERE id = $1 AND user_id = $2', [directionId, userId]);
        res.json({ message: "Research direction deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting teacher direction:", err);
        res.status(500).json({ message: "Database error deleting teacher direction" });
    }
});
// GET /api/teacher/topics - отримати майбутні теми досліджень
app.get("/api/teacher/topics", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Перевіряємо чи користувач є викладачем
        const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'teacher') {
            return res.status(403).json({ message: "Access denied. Teacher role required" });
        }
        // ДОДАНО ФІЛЬТРАЦІЮ ПО user_id
        const result = await pool.query(`SELECT 
        id,
        topic,
        description,
        created_at
       FROM teacher_future_topics 
       WHERE user_id = $1 
       ORDER BY created_at DESC`, [userId] // Використовуємо userId для фільтрації
        );
        const topics = result.rows.map((row) => ({
            id: row.id.toString(),
            topic: row.topic,
            description: row.description,
            createdAt: row.created_at
        }));
        res.json(topics);
    }
    catch (err) {
        console.error("Error fetching teacher topics:", err);
        res.status(500).json({ message: "Database error fetching teacher topics" });
    }
});
// POST /api/teacher/topics - додати майбутню тему досліджень
app.post("/api/teacher/topics", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { topic, description } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Перевіряємо чи користувач є викладачем
        const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'teacher') {
            return res.status(403).json({ message: "Access denied. Teacher role required" });
        }
        if (!topic || !description) {
            return res.status(400).json({ message: "Topic and description are required" });
        }
        const result = await pool.query(`INSERT INTO teacher_future_topics 
       (user_id, topic, description, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`, [userId, topic, description]);
        const newTopic = {
            id: result.rows[0].id.toString(),
            topic: result.rows[0].topic,
            description: result.rows[0].description,
            createdAt: result.rows[0].created_at
        };
        res.status(201).json({
            message: "Future topic added successfully",
            topic: newTopic
        });
    }
    catch (err) {
        console.error("Error adding teacher topic:", err);
        res.status(500).json({ message: "Database error adding teacher topic" });
    }
});
// PUT /api/teacher/topics/:topicId - оновити майбутню тему досліджень
app.put("/api/teacher/topics/:topicId", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { topicId } = req.params;
        const { topic, description } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!topic || !description) {
            return res.status(400).json({ message: "Topic and description are required" });
        }
        // Перевіряємо чи тема належить користувачу
        const topicCheck = await pool.query('SELECT id FROM teacher_future_topics WHERE id = $1 AND user_id = $2', [topicId, userId]);
        if (topicCheck.rows.length === 0) {
            return res.status(404).json({ message: "Topic not found or access denied" });
        }
        const result = await pool.query(`UPDATE teacher_future_topics 
       SET topic = $1, description = $2, updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING *`, [topic, description, topicId, userId]);
        const updatedTopic = {
            id: result.rows[0].id.toString(),
            topic: result.rows[0].topic,
            description: result.rows[0].description,
            createdAt: result.rows[0].created_at
        };
        res.json({
            message: "Future topic updated successfully",
            topic: updatedTopic
        });
    }
    catch (err) {
        console.error("Error updating teacher topic:", err);
        res.status(500).json({ message: "Database error updating teacher topic" });
    }
});
// DELETE /api/teacher/topics/:topicId - видалити майбутню тему досліджень
app.delete("/api/teacher/topics/:topicId", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { topicId } = req.params;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Перевіряємо чи тема належить користувачу
        const topicCheck = await pool.query('SELECT id FROM teacher_future_topics WHERE id = $1 AND user_id = $2', [topicId, userId]);
        if (topicCheck.rows.length === 0) {
            return res.status(404).json({ message: "Topic not found or access denied" });
        }
        await pool.query('DELETE FROM teacher_future_topics WHERE id = $1 AND user_id = $2', [topicId, userId]);
        res.json({ message: "Future topic deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting teacher topic:", err);
        res.status(500).json({ message: "Database error deleting teacher topic" });
    }
});
// ============ STUDENT PROFILE ENDPOINTS ============
// GET /api/student/profile
app.get("/api/student/profile", authenticateToken, async (req, res) => {
    try {
        console.log("GET /api/student/profile - userId:", req.user?.userId);
        const userId = req.user?.userId;
        if (!userId) {
            console.log("No user ID found");
            return res.status(401).json({ message: "Unauthorized" });
        }
        const result = await pool.query(`SELECT 
        u.name,
        u.email,
        u.faculty_id,
        u.department_id,
        f.name as faculty_name,
        d.name as department_name, 
        sp.bio,
        sp.student_group as "group",
        sp.course,
        sp.avatar_url,
        sp.phone,
        sp.linkedin_url,
        sp.github_url
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       LEFT JOIN faculties f ON u.faculty_id = f.id 
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = $1`, [userId]);
        console.log("Query result:", result.rows);
        if (result.rows.length === 0) {
            console.log("User not found in database");
            return res.status(404).json({ message: "User not found" });
        }
        const profileData = result.rows[0];
        // Формуємо відповідь з правильними назвами полів
        const response = {
            name: profileData.name,
            email: profileData.email,
            faculty: profileData.faculty_name, // використовуємо назву факультету
            faculty_id: profileData.faculty_id, // або ID, якщо потрібно
            department: profileData.department_name, // використовуємо назву кафедри
            department_id: profileData.department_id, // або ID, якщо потрібно
            bio: profileData.bio,
            group: profileData.group,
            course: profileData.course,
            avatar_url: profileData.avatar_url,
            phone: profileData.phone,
            linkedin_url: profileData.linkedin_url,
            github_url: profileData.github_url
        };
        console.log("Sending profile data:", response);
        res.json(response);
    }
    catch (err) {
        console.error("Error fetching student profile:", err);
        res.status(500).json({ message: "Database error fetching student profile" });
    }
});
// PUT /api/student/profile - оновити профіль студента
app.put("/api/student/profile", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { name, bio, group, course, faculty, // отримуємо назву факультету
        email, phone, linkedin_url, github_url } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        console.log("Updating profile for user:", userId, "Data:", req.body);
        // Спочатку отримуємо faculty_id за назвою факультету
        let faculty_id = null;
        if (faculty) {
            const facultyResult = await pool.query('SELECT id FROM faculties WHERE name = $1', [faculty]);
            if (facultyResult.rows.length > 0) {
                faculty_id = facultyResult.rows[0].id;
            }
        }
        // Оновлюємо основну інформацію в users
        await pool.query(`UPDATE users 
       SET name = $1, email = $2 ${faculty_id ? ', faculty_id = $3' : ''}
       WHERE id = ${faculty_id ? '$4' : '$3'}`, faculty_id
            ? [name, email, faculty_id, userId]
            : [name, email, userId]);
        // Перевіряємо чи профіль вже існує
        const existingProfile = await pool.query('SELECT user_id FROM student_profiles WHERE user_id = $1', [userId]);
        if (existingProfile.rows.length > 0) {
            // Оновлюємо існуючий профіль
            await pool.query(`UPDATE student_profiles 
         SET bio = $1, student_group = $2, course = $3, 
             phone = $4, linkedin_url = $5, github_url = $6
         WHERE user_id = $7`, [bio, group, course, phone, linkedin_url, github_url, userId]);
        }
        else {
            // Створюємо новий профіль
            await pool.query(`INSERT INTO student_profiles 
         (user_id, bio, student_group, course, phone, linkedin_url, github_url, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`, [userId, bio, group, course, phone, linkedin_url, github_url]);
        }
        // Повертаємо оновлені дані
        const updatedResult = await pool.query(`SELECT 
        u.name,
        u.email,
        u.faculty_id,
        f.name as faculty_name,
        sp.bio,
        sp.student_group as "group",
        sp.course,
        sp.phone,
        sp.linkedin_url,
        sp.github_url
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       LEFT JOIN faculties f ON u.faculty_id = f.id
       WHERE u.id = $1`, [userId]);
        res.json({
            message: "Student profile updated successfully",
            profile: updatedResult.rows[0]
        });
    }
    catch (err) {
        console.error("Error updating student profile:", err);
        res.status(500).json({ message: "Database error updating student profile" });
    }
});
// GET /api/student/projects - отримати проєкти студента
app.get("/api/student/projects", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const result = await pool.query(`SELECT 
        id,
        title,
        type,
        status,
        description,
        technologies,
        project_url,
        github_url,
        start_date,
        end_date,
        created_at
       FROM student_projects 
       WHERE user_id = $1 
       ORDER BY created_at DESC`, [userId]);
        const projects = result.rows.map((row) => ({
            id: row.id.toString(),
            title: row.title,
            type: row.type,
            status: row.status,
            description: row.description,
            technologies: row.technologies ? row.technologies.split(',') : [],
            projectUrl: row.project_url,
            githubUrl: row.github_url,
            startDate: row.start_date,
            endDate: row.end_date,
            createdAt: row.created_at
        }));
        res.json(projects);
    }
    catch (err) {
        console.error("Error fetching student projects:", err);
        res.status(500).json({ message: "Database error fetching student projects" });
    }
});
// POST /api/student/projects - додати проєкт студента
app.post("/api/student/projects", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { title, type, status, description, technologies, projectUrl, githubUrl, startDate, endDate } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!title || !type || !status) {
            return res.status(400).json({ message: "Title, type and status are required" });
        }
        const result = await pool.query(`INSERT INTO student_projects 
       (user_id, title, type, status, description, technologies, project_url, github_url, start_date, end_date, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING id`, [userId, title, type, status, description || '',
            technologies ? technologies.join(',') : null, projectUrl, githubUrl, startDate, endDate]);
        const newProject = {
            id: result.rows[0].id.toString(),
            title,
            type,
            status,
            description: description || '',
            technologies: technologies || [],
            projectUrl,
            githubUrl,
            startDate,
            endDate,
            createdAt: new Date().toISOString()
        };
        res.status(201).json({
            message: "Project added successfully",
            project: newProject
        });
    }
    catch (err) {
        console.error("Error adding student project:", err);
        res.status(500).json({ message: "Database error adding student project" });
    }
});
// PUT /api/student/projects/:projectId - оновити проєкт студента
app.put("/api/student/projects/:projectId", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { projectId } = req.params;
        const { title, type, status, description, technologies, projectUrl, githubUrl, startDate, endDate } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!title || !type || !status) {
            return res.status(400).json({ message: "Title, type and status are required" });
        }
        // Перевіряємо чи проєкт належить користувачу
        const projectCheck = await pool.query('SELECT id FROM student_projects WHERE id = $1 AND user_id = $2', [projectId, userId]);
        if (projectCheck.rows.length === 0) {
            return res.status(404).json({ message: "Project not found or access denied" });
        }
        await pool.query(`UPDATE student_projects 
       SET title = $1, type = $2, status = $3, description = $4, technologies = $5, 
           project_url = $6, github_url = $7, start_date = $8, end_date = $9, updated_at = NOW()
       WHERE id = $10`, [title, type, status, description || '',
            technologies ? technologies.join(',') : null, projectUrl, githubUrl, startDate, endDate, projectId]);
        res.json({ message: "Project updated successfully" });
    }
    catch (err) {
        console.error("Error updating student project:", err);
        res.status(500).json({ message: "Database error updating student project" });
    }
});
// DELETE /api/student/projects/:projectId - видалити проєкт студента
app.delete("/api/student/projects/:projectId", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { projectId } = req.params;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Перевіряємо чи проєкт належить користувачу
        const projectCheck = await pool.query('SELECT id FROM student_projects WHERE id = $1 AND user_id = $2', [projectId, userId]);
        if (projectCheck.rows.length === 0) {
            return res.status(404).json({ message: "Project not found or access denied" });
        }
        await pool.query('DELETE FROM student_projects WHERE id = $1', [projectId]);
        res.json({ message: "Project deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting student project:", err);
        res.status(500).json({ message: "Database error deleting student project" });
    }
});
// GET /api/student/achievements - отримати досягнення студента
app.get("/api/student/achievements", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const result = await pool.query(`SELECT 
        id,
        title,
        description,
        date,
        type,
        organization,
        certificate_url,
        created_at
       FROM student_achievements 
       WHERE user_id = $1 
       ORDER BY date DESC, created_at DESC`, [userId]);
        const achievements = result.rows.map((row) => ({
            id: row.id.toString(),
            title: row.title,
            description: row.description,
            date: row.date,
            type: row.type,
            organization: row.organization,
            certificateUrl: row.certificate_url,
            createdAt: row.created_at
        }));
        res.json(achievements);
    }
    catch (err) {
        console.error("Error fetching student achievements:", err);
        res.status(500).json({ message: "Database error fetching student achievements" });
    }
});
// POST /api/student/achievements - додати досягнення студента
app.post("/api/student/achievements", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { title, description, date, type, organization, certificateUrl } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!title || !date) {
            return res.status(400).json({ message: "Title and date are required" });
        }
        const result = await pool.query(`INSERT INTO student_achievements 
       (user_id, title, description, date, type, organization, certificate_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id`, [userId, title, description || '', date, type, organization, certificateUrl]);
        const newAchievement = {
            id: result.rows[0].id.toString(),
            title,
            description: description || '',
            date,
            type,
            organization,
            certificateUrl,
            createdAt: new Date().toISOString()
        };
        res.status(201).json({
            message: "Achievement added successfully",
            achievement: newAchievement
        });
    }
    catch (err) {
        console.error("Error adding student achievement:", err);
        res.status(500).json({ message: "Database error adding student achievement" });
    }
});
// PUT /api/student/achievements/:achievementId - оновити досягнення студента
app.put("/api/student/achievements/:achievementId", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { achievementId } = req.params;
        const { title, description, date, type, organization, certificateUrl } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!title || !date) {
            return res.status(400).json({ message: "Title and date are required" });
        }
        // Перевіряємо чи досягнення належить користувачу
        const achievementCheck = await pool.query('SELECT id FROM student_achievements WHERE id = $1 AND user_id = $2', [achievementId, userId]);
        if (achievementCheck.rows.length === 0) {
            return res.status(404).json({ message: "Achievement not found or access denied" });
        }
        await pool.query(`UPDATE student_achievements 
       SET title = $1, description = $2, date = $3, type = $4, organization = $5, certificate_url = $6, updated_at = NOW()
       WHERE id = $7`, [title, description || '', date, type, organization, certificateUrl, achievementId]);
        res.json({ message: "Achievement updated successfully" });
    }
    catch (err) {
        console.error("Error updating student achievement:", err);
        res.status(500).json({ message: "Database error updating student achievement" });
    }
});
// DELETE /api/student/achievements/:achievementId - видалити досягнення студента
app.delete("/api/student/achievements/:achievementId", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { achievementId } = req.params;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Перевіряємо чи досягнення належить користувачу
        const achievementCheck = await pool.query('SELECT id FROM student_achievements WHERE id = $1 AND user_id = $2', [achievementId, userId]);
        if (achievementCheck.rows.length === 0) {
            return res.status(404).json({ message: "Achievement not found or access denied" });
        }
        await pool.query('DELETE FROM student_achievements WHERE id = $1', [achievementId]);
        res.json({ message: "Achievement deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting student achievement:", err);
        res.status(500).json({ message: "Database error deleting student achievement" });
    }
});
// GET /api/student/goals - отримати цілі студента
app.get("/api/student/goals", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const result = await pool.query(`SELECT 
        id,
        goal,
        description,
        deadline,
        status,
        priority,
        progress,
        created_at
       FROM student_goals 
       WHERE user_id = $1 
       ORDER BY 
         CASE priority
           WHEN 'high' THEN 1
           WHEN 'medium' THEN 2
           WHEN 'low' THEN 3
           ELSE 4
         END,
         deadline ASC`, [userId]);
        const goals = result.rows.map((row) => ({
            id: row.id.toString(),
            goal: row.goal,
            description: row.description,
            deadline: row.deadline,
            status: row.status,
            priority: row.priority,
            progress: row.progress,
            createdAt: row.created_at
        }));
        res.json(goals);
    }
    catch (err) {
        console.error("Error fetching student goals:", err);
        res.status(500).json({ message: "Database error fetching student goals" });
    }
});
// POST /api/student/goals - додати ціль студента
app.post("/api/student/goals", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { goal, description, deadline, status = 'active', priority = 'medium', progress = 0 } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!goal || !deadline) {
            return res.status(400).json({ message: "Goal and deadline are required" });
        }
        const result = await pool.query(`INSERT INTO student_goals 
       (user_id, goal, description, deadline, status, priority, progress, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id`, [userId, goal, description || '', deadline, status, priority, progress]);
        const newGoal = {
            id: result.rows[0].id.toString(),
            goal,
            description: description || '',
            deadline,
            status,
            priority,
            progress,
            createdAt: new Date().toISOString()
        };
        res.status(201).json({
            message: "Goal added successfully",
            goal: newGoal
        });
    }
    catch (err) {
        console.error("Error adding student goal:", err);
        res.status(500).json({ message: "Database error adding student goal" });
    }
});
// PUT /api/student/goals/:goalId - оновити ціль студента
app.put("/api/student/goals/:goalId", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { goalId } = req.params;
        const { goal, description, deadline, status, priority, progress } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!goal || !deadline) {
            return res.status(400).json({ message: "Goal and deadline are required" });
        }
        // Перевіряємо чи ціль належить користувачу
        const goalCheck = await pool.query('SELECT id FROM student_goals WHERE id = $1 AND user_id = $2', [goalId, userId]);
        if (goalCheck.rows.length === 0) {
            return res.status(404).json({ message: "Goal not found or access denied" });
        }
        await pool.query(`UPDATE student_goals 
       SET goal = $1, description = $2, deadline = $3, status = $4, priority = $5, progress = $6, updated_at = NOW()
       WHERE id = $7`, [goal, description || '', deadline, status, priority, progress, goalId]);
        res.json({ message: "Goal updated successfully" });
    }
    catch (err) {
        console.error("Error updating student goal:", err);
        res.status(500).json({ message: "Database error updating student goal" });
    }
});
// DELETE /api/student/goals/:goalId - видалити ціль студента
app.delete("/api/student/goals/:goalId", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { goalId } = req.params;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Перевіряємо чи ціль належить користувачу
        const goalCheck = await pool.query('SELECT id FROM student_goals WHERE id = $1 AND user_id = $2', [goalId, userId]);
        if (goalCheck.rows.length === 0) {
            return res.status(404).json({ message: "Goal not found or access denied" });
        }
        await pool.query('DELETE FROM student_goals WHERE id = $1', [goalId]);
        res.json({ message: "Goal deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting student goal:", err);
        res.status(500).json({ message: "Database error deleting student goal" });
    }
});
// GET /api/student/applications - отримати заявки студента
app.get("/api/student/applications", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const result = await pool.query(`SELECT 
        id,
        topic,
        description,
        goals,
        requirements,
        teacher_id,
        deadline,
        status,
        student_name,
        student_email,
        student_phone,
        student_program,
        student_year,
        application_date,
        rejection_reason,
        created_at,
        updated_at
       FROM student_applications 
       WHERE student_id = $1 
       ORDER BY created_at DESC`, [userId]);
        const applications = result.rows.map((row) => ({
            id: row.id.toString(),
            topic: row.topic,
            description: row.description,
            goals: row.goals,
            requirements: row.requirements,
            teacherId: row.teacher_id ? row.teacher_id.toString() : null,
            deadline: row.deadline,
            status: row.status || 'pending',
            studentName: row.student_name,
            studentEmail: row.student_email,
            studentPhone: row.student_phone,
            studentProgram: row.student_program,
            studentYear: row.student_year,
            applicationDate: row.application_date,
            rejectionReason: row.rejection_reason,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
        res.json(applications);
    }
    catch (err) {
        console.error("Error fetching student applications:", err);
        res.status(500).json({ message: "Database error fetching student applications" });
    }
});
// POST /api/student/applications - створити нову заявку
app.post("/api/student/applications", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        console.log('📥 Received application data:', {
            userId,
            body: req.body,
            headers: req.headers
        });
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { topic, description, goals, requirements, teacherId, deadline, student_name, student_email, student_phone, student_program, student_year } = req.body;
        console.log('🔍 Parsed fields:', {
            topic: !!topic,
            description: !!description,
            goals: !!goals,
            requirements: !!requirements,
            teacherId: !!teacherId,
            deadline: !!deadline,
            student_name: !!student_name,
            student_email: !!student_email,
            student_phone: !!student_phone,
            student_program: !!student_program,
            student_year: !!student_year
        });
        // Валідація обов'язкових полів
        if (!topic || !description || !goals || !requirements || !deadline || !student_name || !student_email) {
            console.log('❌ Missing fields:', {
                topic: !topic,
                description: !description,
                goals: !goals,
                requirements: !requirements,
                deadline: !deadline,
                student_name: !student_name,
                student_email: !student_email
            });
            return res.status(400).json({
                message: "Missing required fields",
                details: {
                    topic: !topic,
                    description: !description,
                    goals: !goals,
                    requirements: !requirements,
                    deadline: !deadline,
                    student_name: !student_name,
                    student_email: !student_email
                }
            });
        }
        // Перевірка формату дати
        if (isNaN(Date.parse(deadline))) {
            console.log('❌ Invalid deadline format:', deadline);
            return res.status(400).json({ message: "Invalid deadline format" });
        }
        // Перевірка, чи існує викладач (якщо вказано)
        if (teacherId) {
            const teacherCheck = await pool.query("SELECT id FROM users WHERE id = $1 AND (role = 'teacher' OR role = 'admin')", [teacherId]);
            if (teacherCheck.rows.length === 0) {
                console.log('❌ Teacher not found:', teacherId);
                return res.status(404).json({ message: "Teacher not found" });
            }
        }
        console.log('✅ All validation passed, inserting into database...');
        const result = await pool.query(`INSERT INTO student_applications (
        topic, 
        description, 
        goals, 
        requirements, 
        teacher_id,
        deadline,
        student_id,
        student_name,
        student_email,
        student_phone,
        student_program,
        student_year,
        status,
        application_date,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`, [
            topic.trim(),
            description.trim(),
            goals.trim(),
            requirements.trim(),
            teacherId || null,
            new Date(deadline).toISOString().split('T')[0],
            userId,
            student_name.trim(),
            student_email.trim(),
            student_phone?.trim() || null,
            student_program?.trim() || null,
            student_year?.trim() || null,
            'pending',
            new Date().toISOString().split('T')[0]
        ]);
        const newApplication = result.rows[0];
        console.log('✅ Application created successfully:', newApplication.id);
        // Сповіщення викладача (якщо вказано)
        if (teacherId) {
            try {
                await notifyTeacherAboutApplication(teacherId, newApplication);
                console.log('📧 Notification sent to teacher:', teacherId);
            }
            catch (notificationError) {
                console.error('❌ Failed to send notification to teacher:', notificationError);
                // Не зупиняємо процес, якщо сповіщення не вдалося
            }
        }
        const applicationResponse = {
            id: newApplication.id.toString(),
            topic: newApplication.topic,
            description: newApplication.description,
            goals: newApplication.goals,
            requirements: newApplication.requirements,
            teacherId: newApplication.teacher_id ? newApplication.teacher_id.toString() : null,
            deadline: newApplication.deadline,
            status: newApplication.status,
            studentName: newApplication.student_name,
            studentEmail: newApplication.student_email,
            studentPhone: newApplication.student_phone,
            studentProgram: newApplication.student_program,
            studentYear: newApplication.student_year,
            applicationDate: newApplication.application_date,
            createdAt: newApplication.created_at,
            updatedAt: newApplication.updated_at
        };
        res.status(201).json(applicationResponse);
    }
    catch (err) {
        console.error("❌ Error creating student application:", err);
        res.status(500).json({ message: "Database error creating student application" });
    }
});
// GET /api/student/applications/:id - отримати конкретну заявку
app.get("/api/student/applications/:id", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const applicationId = req.params.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const result = await pool.query(`SELECT 
        id,
        topic,
        description,
        goals,
        requirements,
        teacher_id,
        deadline,
        status,
        student_name,
        student_email,
        student_phone,
        student_program,
        student_year,
        created_at,
        updated_at
       FROM student_applications 
       WHERE id = $1 AND student_id = $2`, [applicationId, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Application not found" });
        }
        const application = result.rows[0];
        const applicationResponse = {
            id: application.id.toString(),
            topic: application.topic,
            description: application.description,
            goals: application.goals,
            requirements: application.requirements,
            teacherId: application.teacher_id ? application.teacher_id.toString() : null,
            deadline: application.deadline,
            status: application.status,
            studentName: application.student_name,
            studentEmail: application.student_email,
            studentPhone: application.student_phone,
            studentProgram: application.student_program,
            studentYear: application.student_year,
            createdAt: application.created_at,
            updatedAt: application.updated_at
        };
        res.json(applicationResponse);
    }
    catch (err) {
        console.error("Error fetching student application:", err);
        res.status(500).json({ message: "Database error fetching student application" });
    }
});
// Middleware для перевірки, чи є користувач викладачем
const requireTeacher = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const result = await pool.query("SELECT role FROM users WHERE id = $1", [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        const userRole = result.rows[0].role;
        if (userRole !== 'teacher' && userRole !== 'admin') {
            return res.status(403).json({
                message: "Access denied. Teacher role required.",
                userRole: userRole
            });
        }
        next();
    }
    catch (err) {
        console.error("Error checking user role:", err);
        res.status(500).json({ message: "Server error" });
    }
};
// GET /api/teacher/applications - отримати заявки для викладача
app.get("/api/teacher/applications", authenticateToken, requireTeacher, async (req, res) => {
    try {
        const teacherId = req.user?.userId;
        if (!teacherId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        console.log('🔍 Fetching applications for teacher:', teacherId);
        const result = await pool.query(`SELECT 
        sa.id,
        sa.topic,
        sa.description,
        sa.goals,
        sa.requirements,
        sa.teacher_id,
        sa.deadline,
        sa.status,
        sa.student_name,
        sa.student_email,
        sa.student_phone,
        sa.student_program,
        sa.student_year,
        sa.created_at,
        sa.updated_at,
        sa.application_date,
        sa.rejection_reason,
        u.name as teacher_name,
        u.email as teacher_email
       FROM student_applications sa
       LEFT JOIN users u ON sa.teacher_id = u.id
       WHERE sa.teacher_id = $1 
       ORDER BY sa.created_at DESC`, [teacherId]);
        console.log('✅ Found applications:', result.rows.length);
        // Функція для генерації ініціалів
        const getInitials = (name) => {
            if (!name)
                return '??';
            return name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
        };
        const applications = result.rows.map((row) => ({
            id: row.id,
            studentName: row.student_name || 'Студент',
            studentAvatar: "", // Пустий avatar
            studentInitials: getInitials(row.student_name),
            program: row.student_program || 'Не вказано',
            year: row.student_year || 'Не вказано',
            topic: row.topic || 'Без назви',
            type: (row.requirements?.toLowerCase().includes('диплом') ||
                row.topic?.toLowerCase().includes('диплом') ||
                row.requirements?.toLowerCase().includes('diploma') ||
                row.topic?.toLowerCase().includes('diploma')) ? 'diploma' : 'course',
            status: row.status || 'pending',
            date: new Date(row.application_date || row.created_at).toLocaleDateString('uk-UA'),
            email: row.student_email || 'Не вказано',
            phone: row.student_phone || 'Не вказано',
            description: row.description || 'Опис відсутній',
            goals: row.goals || 'Не вказано',
            requirements: row.requirements || 'Не вказано',
            deadline: row.deadline,
            rejectionReason: row.rejection_reason,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            teacherInfo: row.teacher_name ? {
                name: row.teacher_name,
                email: row.teacher_email
            } : null
        }));
        res.json(applications);
    }
    catch (err) {
        console.error("❌ Error fetching teacher applications:", err);
        res.status(500).json({
            message: "Database error fetching teacher applications",
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
});
// PATCH /api/teacher/applications/:id/status - оновити статус заявки
app.patch("/api/teacher/applications/:id/status", authenticateToken, requireTeacher, async (req, res) => {
    try {
        const teacherId = req.user?.userId;
        const applicationId = req.params.id;
        const { status, rejectionReason } = req.body;
        console.log('🔄 Updating application status:', {
            teacherId,
            applicationId,
            status,
            rejectionReason
        });
        if (!teacherId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!['pending', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        // Спочатку перевіримо, чи належить заявка цьому викладачу
        const checkResult = await pool.query('SELECT id FROM student_applications WHERE id = $1 AND teacher_id = $2', [applicationId, teacherId]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                message: "Application not found or access denied"
            });
        }
        // Підготовка даних для оновлення
        let query = `
      UPDATE student_applications 
      SET status = $1, 
          updated_at = CURRENT_TIMESTAMP,
          processed_at = CURRENT_TIMESTAMP,
          processed_by = $2
    `;
        const queryParams = [status, teacherId, applicationId];
        let paramCount = 3;
        // Додаємо причину відхилення, якщо статус 'rejected'
        if (status === 'rejected' && rejectionReason) {
            query += `, rejection_reason = $${paramCount + 1} WHERE id = $3 AND teacher_id = $2`;
            queryParams.push(rejectionReason);
        }
        else if (status === 'accepted') {
            // Якщо заявку приймаємо, очищаємо причину відхилення
            query += `, rejection_reason = NULL WHERE id = $3 AND teacher_id = $2`;
        }
        else {
            query += ` WHERE id = $3 AND teacher_id = $2`;
        }
        query += ` RETURNING *`;
        console.log('📝 Executing query:', query);
        console.log('📋 Query params:', queryParams);
        const result = await pool.query(query, queryParams);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Application not found" });
        }
        const updatedApplication = result.rows[0];
        console.log('✅ Application updated successfully:', updatedApplication.id);
        res.json({
            success: true,
            application: updatedApplication
        });
    }
    catch (err) {
        console.error("❌ Error updating application status:", err);
        res.status(500).json({
            message: "Database error updating application status",
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
});
// ===== Serve frontend =====
const frontendPath = path.join(__dirname, "../dist");
if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    app.get("*", (req, res) => {
        res.sendFile(path.join(frontendPath, "index.html"));
    });
}
// ===== Start server =====
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});
// Ініціалізація WebSocket сервера
new ChatWebSocketServer(server);
