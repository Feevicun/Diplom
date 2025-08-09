import express from "express";
import type { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import pool from './db.js'; 
import { fileURLToPath } from "url";
import jwt from 'jsonwebtoken';


// __dirname для ES-модулів
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

const dataFilePath = path.join(__dirname, "user.json");
const messagesFilePath = path.join(__dirname, "messages.json");

// JWT секрет (поки що тут, пізніше краще винести в env)
const JWT_SECRET = "super_secret_key_change_this";

// Middleware
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// ============ API ROUTES ============

// Middleware для аутентифікації через JWT
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // формат: "Bearer TOKEN"

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// Отримати всіх користувачів
app.get("/api/users", (req: Request, res: Response) => {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return res.json([]);
    }
    const data = JSON.parse(fs.readFileSync(dataFilePath, "utf-8"));
    res.json(data);
  } catch {
    res.status(500).json({ message: "Error reading data" });
  }
});


// POST /api/register
app.post("/api/register", async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const name = `${firstName.trim()} ${lastName.trim()}`;

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, registeredAt) 
       VALUES ($1, $2, $3, $4, NOW()) RETURNING id, name, email, role, registeredAt`,
      [name, email, password, role]
    );

    res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
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
    } catch (e) {
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

    // ✅ Парсимо JSON
    const parsedStructure = JSON.parse(message);
    return res.status(200).json(parsedStructure);
  } catch (error) {
    console.error("Error generating structure:", error);
    return res.status(500).json({ message: "Failed to generate structure." });
  }
});

// GET /api/messages
app.get("/api/messages", (req, res) => {
  try {
    const { userEmail } = req.query;

    if (!userEmail) {
      return res.status(400).json({ message: "userEmail is required" });
    }

    if (!fs.existsSync(messagesFilePath)) {
      return res.json([]);
    }

    const messages = JSON.parse(fs.readFileSync(messagesFilePath, "utf-8"));
    const userMessages = messages.filter((msg: any) => msg.studentEmail === userEmail);

    res.json(userMessages);
  } catch (err) {
    console.error("Error reading messages:", err);
    res.status(500).json({ message: "Error reading messages." });
  }
});


// POST /api/messages
app.post("/api/messages", async (req, res) => {
  try {
    const { studentEmail, sender, content } = req.body;

    const result = await pool.query(
      `INSERT INTO messages (studentEmail, sender, content) 
       VALUES ($1, $2, $3) RETURNING *`,
      [studentEmail, sender, content]
    );

    res.status(201).json({ message: "Message sent successfully", data: result.rows[0] });
  } catch (err) {
    console.error(err);
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
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
