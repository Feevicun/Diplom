import express from "express";
import type { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import pool from './db.js'; 
import { fileURLToPath } from "url";
import jwt from 'jsonwebtoken';
import type { JwtUserPayload } from './types';
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

// Тип ключів структури
type ProjectType = keyof typeof PROJECT_STRUCTURES; // "diploma" | "coursework" | "practice"

// Функція для ініціалізації структури проекту
async function initializeProjectStructure(userId: number, projectType: ProjectType) {
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
    const chapters = result.rows.map((row: any) => ({
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



// ============ CHAT ENDPOINTS ============

// GET /api/chat - отримати список чатів користувача
app.get("/api/chat", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT 
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
       ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC`,
      [userId]
    );

    const chats = await Promise.all(result.rows.map(async (row: any) => {
      let members = [];
      if (row.type === 'group') {
        const membersResult = await pool.query(
          `SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.is_online
           FROM chat_members cm
           JOIN users u ON cm.user_id = u.id
           WHERE cm.chat_id = $1`,
          [row.id]
        );

        members = membersResult.rows.map((member: any) => ({
          id: member.id.toString(),
          name: member.name,
          avatar: member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
          avatarUrl: member.avatar_url ?? undefined,
          email: member.email,
          type: member.role === 'teacher' ? 'supervisor' : 'student',
          isOnline: member.is_online
        }));
      }

      return {
        id: row.id.toString(),
        name: row.name,
        avatar: row.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        avatarUrl: row.avatar_url ?? undefined,
        type: row.type,
        isOnline: row.is_online || false,
        lastSeen: row.last_seen ? new Date(row.last_seen).toLocaleString('uk-UA') : undefined,
        unreadCount: row.unread_count || 0,
        lastMessage: row.last_message,
        members: row.type === 'group' ? members : undefined,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
        description: row.description
      };
    }));

    res.json(chats);
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ message: "Database error fetching chats" });
  }
});

// GET /api/chat/:chatId/messages - отримати повідомлення чату
app.get("/api/chat/:chatId/messages", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { chatId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевірка доступу до чату
    const accessCheck = await pool.query(
      'SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ message: "No access to this chat" });
    }

    const result = await pool.query(
      `SELECT 
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
       LIMIT $2 OFFSET $3`,
      [chatId, parseInt(limit as string), parseInt(offset as string)]
    );

    const messages = result.rows.map((row: any) => ({
      ...row,
      id: row.id.toString(),
      sender: row.sender.toString(),
      timestamp: new Date(row.timestamp).toLocaleTimeString('uk-UA', {
        hour: '2-digit', minute: '2-digit'
      })
    }));

    // Оновлюємо лічильник непрочитаних
    await pool.query(
      `UPDATE chat_members 
       SET unread_count = 0 
       WHERE chat_id = $1 AND user_id = $2`,
      [chatId, userId]
    );

    res.json(messages.reverse()); // Повертаємо в хронологічному порядку
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Database error fetching messages" });
  }
});

// POST /api/chat/create - створити приватний чат
app.post("/api/chat/create", authenticateToken, async (req: Request, res: Response) => {
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
    const existingChat = await pool.query(
      `SELECT c.id FROM chats c
       JOIN chat_members cm1 ON c.id = cm1.chat_id
       JOIN chat_members cm2 ON c.id = cm2.chat_id
       WHERE c.type = 'private' 
       AND cm1.user_id = $1 AND cm2.user_id = $2`,
      [userId, participantId]
    );

    if (existingChat.rows.length > 0) {
      return res.json({ 
        chatId: existingChat.rows[0].id.toString(),
        message: "Chat already exists" 
      });
    }

    // Отримуємо ім'я учасника для назви чату
    const participantResult = await pool.query(
      'SELECT name FROM users WHERE id = $1',
      [participantId]
    );

    if (participantResult.rows.length === 0) {
      return res.status(404).json({ message: "Participant not found" });
    }

    const participantName = participantResult.rows[0].name;

    // Створюємо новий чат з назвою тільки учасника
    const chatResult = await pool.query(
      `INSERT INTO chats (name, type, created_by, created_at)
       VALUES ($1, 'private', $2, NOW())
       RETURNING id`,
      [participantName, userId] // Тільки ім'я учасника
    );

    const chatId = chatResult.rows[0].id.toString();

    // Додаємо учасників
    await pool.query(
      'INSERT INTO chat_members (chat_id, user_id, joined_at) VALUES ($1, $2, NOW())',
      [chatId, userId]
    );
    await pool.query(
      'INSERT INTO chat_members (chat_id, user_id, joined_at) VALUES ($1, $2, NOW())',
      [chatId, participantId]
    );

    res.status(201).json({ 
      chatId,
      message: "Chat created successfully" 
    });
  } catch (err) {
    console.error("Error creating chat:", err);
    res.status(500).json({ message: "Database error creating chat" });
  }
});

// POST /api/chat/create-group - створити груповий чат
app.post("/api/chat/create-group", authenticateToken, async (req: Request, res: Response) => {
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
    const chatResult = await pool.query(
      `INSERT INTO chats (name, type, description, settings, created_by, created_at)
       VALUES ($1, 'group', $2, $3, $4, NOW())
       RETURNING id`,
      [name, description || '', JSON.stringify(settings || {}), userId]
    );

    const chatId = chatResult.rows[0].id.toString();

    // Додаємо всіх учасників (включаючи творця)
    const allMembers = [userId, ...memberIds];
    
    for (const memberId of allMembers) {
      await pool.query(
        'INSERT INTO chat_members (chat_id, user_id, joined_at) VALUES ($1, $2, NOW())',
        [chatId, memberId]
      );
    }

    res.status(201).json({ 
      chatId,
      message: "Group chat created successfully" 
    });
  } catch (err) {
    console.error("Error creating group chat:", err);
    res.status(500).json({ message: "Database error creating group chat" });
  }
});

// POST /api/chat/:chatId/messages - надіслати повідомлення (альтернатива WebSocket)
app.post("/api/chat/:chatId/messages", authenticateToken, async (req: Request, res: Response) => {
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
    const accessCheck = await pool.query(
      'SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ message: "No access to this chat" });
    }

    // Зберігаємо повідомлення
    const messageResult = await pool.query(
      `INSERT INTO chat_messages 
       (chat_id, sender_id, content, message_type, reply_to, attachment_data, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, created_at`,
      [
        chatId, 
        userId, 
        content, 
        type, 
        replyTo ? JSON.stringify(replyTo) : null,
        attachment ? JSON.stringify(attachment) : null
      ]
    );

    const dbMessage = messageResult.rows[0];

    // Оновлюємо останнє повідомлення в чаті
    await pool.query(
      `UPDATE chats SET last_message = $1, last_message_at = NOW() WHERE id = $2`,
      [content || '📎 Вкладення', chatId]
    );

    // Отримуємо інформацію про відправника
    const userResult = await pool.query(
      'SELECT name FROM users WHERE id = $1',
      [userId]
    );

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
      message: message
    });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ message: "Database error sending message" });
  }
});

// PUT /api/messages/:messageId - редагувати повідомлення
app.put("/api/messages/:messageId", authenticateToken, async (req: Request, res: Response) => {
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
    const messageCheck = await pool.query(
      'SELECT sender_id FROM chat_messages WHERE id = $1',
      [messageId]
    );

    if (messageCheck.rows.length === 0) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (messageCheck.rows[0].sender_id !== userId) {
      return res.status(403).json({ message: "Can only edit your own messages" });
    }

    // Оновлюємо повідомлення
    await pool.query(
      `UPDATE chat_messages 
       SET content = $1, is_edited = true, updated_at = NOW()
       WHERE id = $2`,
      [content, messageId]
    );

    res.json({ message: "Message updated successfully" });
  } catch (err) {
    console.error("Error updating message:", err);
    res.status(500).json({ message: "Database error updating message" });
  }
});

// DELETE /api/messages/:messageId - видалити повідомлення
app.delete("/api/messages/:messageId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { messageId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевіряємо чи користувач є автором повідомлення
    const messageCheck = await pool.query(
      'SELECT sender_id, chat_id FROM chat_messages WHERE id = $1',
      [messageId]
    );

    if (messageCheck.rows.length === 0) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (messageCheck.rows[0].sender_id !== userId) {
      return res.status(403).json({ message: "Can only delete your own messages" });
    }

    // Видаляємо повідомлення
    await pool.query('DELETE FROM chat_messages WHERE id = $1', [messageId]);

    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ message: "Database error deleting message" });
  }
});

// POST /api/messages/:messageId/read - позначити повідомлення як прочитане
app.post("/api/messages/:messageId/read", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { messageId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Додаємо запис про прочитання
    await pool.query(
      `INSERT INTO message_read_receipts (message_id, user_id, read_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (message_id, user_id)
       DO UPDATE SET read_at = NOW()`,
      [messageId, userId]
    );

    res.json({ message: "Message marked as read" });
  } catch (err) {
    console.error("Error marking message as read:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// GET /api/chat/:chatId/media - отримати медіафайли чату
app.get("/api/chat/:chatId/media", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { chatId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевірка доступу до чату
    const accessCheck = await pool.query(
      'SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ message: "No access to this chat" });
    }

    const result = await pool.query(
      `SELECT 
        m.id as message_id,
        m.attachment_data as attachment,
        m.message_type as type,
        m.created_at as timestamp
       FROM chat_messages m
       WHERE m.chat_id = $1 
       AND (m.attachment_data IS NOT NULL OR m.message_type IN ('image', 'video', 'file', 'voice'))
       ORDER BY m.created_at DESC`,
      [chatId]
    );

    const media = result.rows
      .filter((row: any) => row.attachment || row.type !== 'text')
      .map((row: any) => {
        const attachment = row.attachment ? JSON.parse(row.attachment) : null;
        
        let mediaType: 'image' | 'video' | 'file' | 'voice' = 'file';
        if (row.type === 'voice') {
          mediaType = 'voice';
        } else if (attachment?.type?.startsWith('image/')) {
          mediaType = 'image';
        } else if (attachment?.type?.startsWith('video/')) {
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
  } catch (err) {
    console.error("Error fetching media:", err);
    res.status(500).json({ message: "Database error fetching media" });
  }
});

// GET /api/chat/:chatId/search - пошук повідомлень
app.get("/api/chat/:chatId/search", authenticateToken, async (req: Request, res: Response) => {
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
    const accessCheck = await pool.query(
      'SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );

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
    
    const params: any[] = [chatId, `%${q}%`];
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

    const messages = result.rows.map((row: any) => ({
      ...row,
      id: row.id.toString(),
      sender: row.sender.toString(),
      timestamp: new Date(row.timestamp).toLocaleTimeString('uk-UA', {
        hour: '2-digit', minute: '2-digit'
      })
    }));

    res.json(messages);
  } catch (err) {
    console.error("Error searching messages:", err);
    res.status(500).json({ message: "Database error searching messages" });
  }
});

// POST /api/upload/chat - завантажити файл для чату
app.post("/api/upload/chat", authenticateToken, async (req: Request, res: Response) => {
  try {
    // Тут має бути логіка завантаження файлів
    // Для демонстрації повертаємо фейкові дані
    res.json({
      url: `/uploads/chat-${Date.now()}.file`,
      name: req.body.name || 'file',
      type: req.body.type || 'application/octet-stream',
      size: req.body.size || 0
    });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ message: "Error uploading file" });
  }
});

// PUT /api/chat/:chatId/mute - заглушити/відключити сповіщення чату
app.put("/api/chat/:chatId/mute", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { chatId } = req.params;
    const { muted } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await pool.query(
      `UPDATE chat_members 
       SET is_muted = $1 
       WHERE chat_id = $2 AND user_id = $3`,
      [muted, chatId, userId]
    );

    res.json({ 
      message: muted ? "Chat muted" : "Chat unmuted",
      muted 
    });
  } catch (err) {
    console.error("Error muting chat:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// DELETE /api/chat/:chatId/leave - покинути груповий чат
app.delete("/api/chat/:chatId/leave", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { chatId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Перевіряємо чи це груповий чат
    const chatCheck = await pool.query(
      'SELECT type FROM chats WHERE id = $1',
      [chatId]
    );

    if (chatCheck.rows.length === 0) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chatCheck.rows[0].type !== 'group') {
      return res.status(400).json({ message: "Can only leave group chats" });
    }

    // Видаляємо користувача з учасників
    await pool.query(
      'DELETE FROM chat_members WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );

    res.json({ message: "Left group chat successfully" });
  } catch (err) {
    console.error("Error leaving chat:", err);
    res.status(500).json({ message: "Database error" });
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