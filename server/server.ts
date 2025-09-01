import express from "express";
import type { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import pool from './db.js'; 
import { fileURLToPath } from "url";
import jwt from 'jsonwebtoken';
import type { JwtUserPayload } from './types';



// __dirname для ES-модулів
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;



// JWT секрет (поки що тут, пізніше краще винести в env)
const JWT_SECRET = "super_secret_key_change_this";

// Middleware
app.use(cors({
  origin: "*"
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
  await pool.query(
    'DELETE FROM user_chapters WHERE user_id = $1 AND project_type = $2',
    [userId, projectType]
  );

  // Створюємо нові записи для всіх глав
  for (const chapter of structure) {
    await pool.query(
      `INSERT INTO user_chapters 
       (user_id, project_type, chapter_key, progress, status, student_note, created_at, updated_at)
       VALUES ($1, $2, $3, 0, 'pending', '', NOW(), NOW())
       ON CONFLICT (user_id, project_type, chapter_key) 
       DO NOTHING`,
      [userId, projectType, chapter.key]
    );
  }
}



// ============ API ROUTES ============

// Middleware для аутентифікації через JWT
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    // Here we assert that decoded is JwtUserPayload
    req.user = decoded as JwtUserPayload;
    next();
  });
}

// Отримати всіх користувачів
app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, faculty_id, department_id FROM users ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Database error fetching users" });
  }
});


// POST /api/register
app.post("/api/register", async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role, facultyId, departmentId } = req.body;
    const name = `${firstName.trim()} ${lastName.trim()}`;

    if (!facultyId || !departmentId) {
      return res.status(400).json({ message: "Faculty and department must be selected" });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, faculty_id, department_id, registeredAt) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING id, name, email, role, faculty_id, department_id, registeredAt`,
      [name, email, password, role, facultyId, departmentId]
    );

    res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});




// GET /api/faculties
app.get("/api/faculties", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM faculties ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// GET /api/faculties/:facultyId/departments
app.get("/api/faculties/:facultyId/departments", async (req: Request, res: Response) => {
  try {
    const facultyId = Number(req.params.facultyId);

    if (isNaN(facultyId)) {
      return res.status(400).json({ message: "Invalid faculty ID" });
    }

    const result = await pool.query(
      "SELECT id, name FROM departments WHERE faculty_id = $1 ORDER BY id",
      [facultyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Departments not found" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});



// POST /api/login
app.post("/api/login", async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    const result = await pool.query(
      `SELECT id, name, email, role FROM users 
       WHERE email = $1 AND password = $2 AND role = $3`,
      [email.trim(), password.trim(), role]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email, password or role" });
    }

    const user = result.rows[0];

    // Генеруємо JWT токен
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    await pool.query("UPDATE users SET lastLoginAt = NOW() WHERE email = $1", [email.trim()]);

    res.json({ message: "Login successful", user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});



// GET /api/current-user 
app.get('/api/current-user', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      'SELECT name, email, role FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [firstName, ...lastNameParts] = result.rows[0].name.split(' ');
    const lastName = lastNameParts.join(' ');
    res.json({
      user: {
        firstName,
        lastName,
        email: result.rows[0].email,
        role: result.rows[0].role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});




// POST /api/logout
app.post("/api/logout", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const result = await pool.query(
      "UPDATE users SET lastLogoutAt = NOW() WHERE email = $1 RETURNING email, lastLogoutAt",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Logout successful", ...result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});


// PUT /api/update-profile
app.put("/api/update-profile", async (req: Request, res: Response) => {
  try {
    const { id, name, email, avatarUrl } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User id is required" });
    }

    // Оновлення користувача
    const result = await pool.query(
      `UPDATE users
       SET name = $1, email = $2, avatar_url = $3
       WHERE id = $4
       RETURNING id, name, email, role, avatar_url`,
      [name, email, avatarUrl, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});


// API для перевірки користувача при забутому паролі
app.post("/api/forgot-password/verify", async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required" });
    }

    // Перевіряємо чи існує користувач з такою поштою та роллю
    const result = await pool.query(
      "SELECT id, email, role FROM users WHERE email = $1 AND role = $2",
      [email, role]
    );

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// API для зміни паролю
app.post("/api/forgot-password/reset", async (req: Request, res: Response) => {
  try {
    const { email, role, newPassword } = req.body;

    if (!email || !role || !newPassword) {
      return res.status(400).json({ message: "Email, role and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Знаходимо користувача
    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND role = $2",
      [email, role]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = userResult.rows[0].id;

    // Оновлюємо пароль в БД
    await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [newPassword, userId]
    );

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});



app.post("/api/events", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { title, date, type } = req.body;
    const userEmail = req.user?.email;

    if (!userEmail || !title || !date || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO events ("userEmail", title, date, type) VALUES ($1, $2, $3, $4) RETURNING *`,
      [userEmail, title, date, type]
    );

    res.status(201).json({ message: "Event created successfully", event: result.rows[0] });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Database error creating event" });
  }
});

app.get("/api/events", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) return res.status(401).json({ message: "Unauthorized" });

    const result = await pool.query(
      `SELECT id, title, date, type FROM events WHERE "userEmail" = $1 ORDER BY date`,
      [userEmail]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Database error fetching events" });
  }
});





// GET /api/user-project - отримати активний тип проекту користувача
app.get("/api/user-project", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      'SELECT active_project_type FROM user_projects WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ projectType: null });
    }

    res.json({ projectType: result.rows[0].active_project_type });
  } catch (err) {
    console.error('Error getting project type:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// POST /api/user-project - встановити активний тип проекту
app.post("/api/user-project", authenticateToken, async (req: Request, res: Response) => {
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
    await pool.query(
      `INSERT INTO user_projects (user_id, active_project_type, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET active_project_type = $2, updated_at = NOW()`,
      [userId, projectType]
    );

    // Ініціалізуємо структуру проекту
    await initializeProjectStructure(userId, projectType);

    res.json({ 
      message: "Project type set successfully", 
      projectType 
    });
  } catch (err) {
    console.error('Error setting project type:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// GET /api/user-chapters - отримати глави користувача для активного проекту
app.get("/api/user-chapters", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { projectType } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!projectType) {
      return res.status(400).json({ message: "Project type is required" });
    }

    const result = await pool.query(
      `SELECT 
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
         END`,
      [userId, projectType]
    );

    // Форматуємо дані для фронтенду
    const chapters = result.rows.map(row => ({
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
      teacherComments: [] // Поки що порожній масив, можна розширити пізніше
    }));

    res.json(chapters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

// PUT /api/user-chapters/:chapterKey - оновити главу
app.put("/api/user-chapters/:chapterKey", authenticateToken, async (req: Request, res: Response) => {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

// DELETE /api/user-chapters/:chapterKey/file - видалити файл глави
app.delete("/api/user-chapters/:chapterKey/file", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { chapterKey } = req.params;
    const { projectType } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await pool.query(
      `UPDATE user_chapters 
       SET uploaded_file_name = NULL, uploaded_file_date = NULL, uploaded_file_size = NULL, 
           progress = 0, status = 'pending', updated_at = NOW()
       WHERE user_id = $1 AND project_type = $2 AND chapter_key = $3`,
      [userId, projectType, chapterKey]
    );

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});



app.post("/api/generate-topics", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea || typeof idea !== "string") {
      return res.status(400).json({ message: "Idea is required and should be a string." });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ message: "AI API key not configured." });
    }

    const prompt = `
You are an assistant that generates short, clear thesis or course project titles based on a student's idea.
Given the idea below, generate 3 concise titles, each 3 to 8 words long, reflecting the main topic clearly.

Student idea:
"${idea}"

Output only JSON array of objects with one key "title", example:
[
  {"title": "Analysis of Machine Learning Methods"},
  {"title": "Evaluating Educational Techniques with AI"},
  {"title": "Machine Learning in Teaching Effectiveness"}
]
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ message: "AI API error", error: errorData });
    }

    const data = await response.json();

    let topics;
    try {
      topics = JSON.parse(data.choices[0].message.content);
    } catch {
      // Якщо не JSON — просто повернути текст
      topics = data.choices[0].message.content;
    }

    res.json({ topics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/generate-structure", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea || typeof idea !== "string") {
      return res.status(400).json({ message: "Idea is required and should be a string." });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ message: "AI API key not configured." });
    }

    const prompt = `
You are an assistant that generates a thesis structure based on a student's idea.
Return a JSON array of 10 objects with the following format:

[
  {
    "id": 1,
    "key": "intro",
    "progress": 0,
    "status": "pending",
    "content": "..."
  },
  {
    "id": 2,
    "key": "theory",
    "progress": 0,
    "status": "pending",
    "content": "..."
  },
  ...
]

Keys to use (in order): "intro", "theory", "design", "implementation", "conclusion", "appendix", "sources", "abstract", "cover", "content".

Base the "content" field on the following idea:
"${idea}"

Only output valid JSON array as described above. Do not include any explanation or comments.
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content;

    if (!message) {
      return res.status(500).json({ message: "No response from AI." });
    }

    // Парсимо JSON
    const parsedStructure = JSON.parse(message);
    return res.status(200).json(parsedStructure);
  } catch (error) {
    console.error("Error generating structure:", error);
    return res.status(500).json({ message: "Failed to generate structure." });
  }
});



// GET всіх ресурсів
app.get("/api/resources", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT r.*, u.name as created_by_name FROM resources r LEFT JOIN users u ON r.created_by = u.id ORDER BY r.created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching resources:", err);
    res.status(500).json({ message: "Database error fetching resources" });
  }
});

// POST новий ресурс
app.post("/api/resources", authenticateToken, async (req: Request, res: Response) => {
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

    const result = await pool.query(
      `INSERT INTO resources (title, description, link, category, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, link, category || 'other', req.user.userId]
    );

    res.status(201).json({
      message: "Ресурс додано успішно",
      resource: result.rows[0]
    });
  } catch (err) {
    console.error("Error adding resource:", err);
    res.status(500).json({ message: "Помилка бази даних" });
  }
});

// PUT оновлення ресурсу
app.put("/api/resources/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, link, category } = req.body;
    
    // Type guard for req.user
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    // Перевірка прав власності
    const resourceCheck = await pool.query(
      "SELECT created_by FROM resources WHERE id = $1",
      [id]
    );
    
    if (resourceCheck.rows.length === 0) {
      return res.status(404).json({ message: "Ресурс не знайдено" });
    }
    
    if (resourceCheck.rows[0].created_by !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Доступ заборонено" });
    }

    const result = await pool.query(
      `UPDATE resources
       SET title = $1, description = $2, link = $3, category = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [title, description, link, category, id]
    );

    res.json({
      message: "Ресурс оновлено успішно",
      resource: result.rows[0]
    });
  } catch (err) {
    console.error("Error updating resource:", err);
    res.status(500).json({ message: "Помилка бази даних" });
  }
});

// DELETE видалення ресурсу
app.delete("/api/resources/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Type guard for req.user
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    // Перевірка прав власності
    const resourceCheck = await pool.query(
      "SELECT created_by FROM resources WHERE id = $1",
      [id]
    );
    
    if (resourceCheck.rows.length === 0) {
      return res.status(404).json({ message: "Ресурс не знайдено" });
    }
    
    if (resourceCheck.rows[0].created_by !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Доступ заборонено" });
    }

    await pool.query("DELETE FROM resources WHERE id = $1", [id]);
    res.json({ message: "Ресурс видалено успішно" });
  } catch (err) {
    console.error("Error deleting resource:", err);
    res.status(500).json({ message: "Помилка мережі" });
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
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});