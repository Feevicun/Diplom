import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

// __dirname для ES-модулів
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

const dataFilePath = path.join(__dirname, "user.json");

// Middleware
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// ============ API ROUTES ============

// Отримати всіх користувачів
app.get("/api/users", (req, res) => {
  try {
    if (!fs.existsSync(dataFilePath)) {
      // Пустий масив, якщо файл не існує 
      return res.json([]);
    }
    const data = JSON.parse(fs.readFileSync(dataFilePath, "utf-8"));
    res.json(data);
  } catch {
    res.status(500).json({ message: "Error reading data" });
  }
});

// POST /api/register
app.post("/api/register", (req, res) => {
  try {
    const newUser = req.body;

    // Завантаження існуючих користувачів
    let data: any[] = [];
    if (fs.existsSync(dataFilePath)) {
      data = JSON.parse(fs.readFileSync(dataFilePath, "utf-8"));
    }

    // Перевірка дубліката email
    if (data.find(u => u.email === newUser.email)) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    data.push(newUser); // Додаємо користувача
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");

    // Повертаємо дані користувача 
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch {
    res.status(500).json({ message: "Error writing data" });
  }
});


// POST /api/login
app.post("/api/login", (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Missing login data" });
    }

    if (!fs.existsSync(dataFilePath)) {
      return res.status(400).json({ message: "No users registered" });
    }

    const data = JSON.parse(fs.readFileSync(dataFilePath, "utf-8"));

    const user = data.find(
      (u: any) => u.email === email && u.password === password && u.role === role
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid email, password or role" });
    }

    // Якщо все добре — повертаємо користувача без паролю
    const { password: _, ...userWithoutPassword } = user;

    res.json({ message: "Login successful", user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
