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
