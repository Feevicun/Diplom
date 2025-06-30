

import express from 'express';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, 'users.json');
const HISTORY_FILE = path.join(__dirname, 'history.json');

// Завантаження користувачів
let user = [];
if (fs.existsSync(USERS_FILE)) {
  const fileContent = fs.readFileSync(USERS_FILE, 'utf-8').trim();
  if (fileContent) {
    user = JSON.parse(fileContent);
  }
}

// Завантаження історії
let history = [];
if (fs.existsSync(HISTORY_FILE)) {
  const fileContent = fs.readFileSync(HISTORY_FILE, 'utf-8').trim();
  if (fileContent) {
    history = JSON.parse(fileContent);
  }
}

function saveUsersToFile() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(user, null, 2), 'utf-8');
}

function saveHistoryToFile() {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
}

const distPath = path.join(__dirname, '..', 'dist');

const app = express();
app.use(express.json());

function logEvent({ userEmail = "unknown", type, description, meta = {} }) {
  const event = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    userEmail,
    type,
    description,
    meta,
  };
  history.push(event);
  saveHistoryToFile();
}

// --- API: Реєстрація ---
app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const existing = user.find((u) => u.email === email);
  if (existing) return res.status(400).json({ message: 'Email already used.' });

  const verificationToken = uuidv4();
  const newUser = { name, email, password, role, verified: false, token: verificationToken };
  user.push(newUser);
  saveUsersToFile();

  logEvent({
    userEmail: email,
    type: "register",
    description: "User registered",
    meta: { role }
  });

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'osobaviktoria29@gmail.com',
        pass: 'ggka hebm xvxl shez',
      },
    });

    const verificationLink = `http://localhost:${PORT}/verify/${verificationToken}`;

    await transporter.sendMail({
      from: '"CourseApp 👩‍🏫" <noreply@courseapp.com>',
      to: email,
      subject: 'Verify your email',
      html: `
        <h2>Email Verification</h2>
        <p>Click the button below to verify your email:</p>
        <a 
          href="${verificationLink}" 
          style="
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #ff6600; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px;
            font-weight: bold;
          "
        >
          Verify Email
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: #555;">
          Or copy and paste this link into your browser:<br />
          <small>${verificationLink}</small>
        </p>
      `,
    });

    res.status(200).json({ message: 'Verification email sent.' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ message: 'Failed to send verification email.' });
  }
});

// --- API: Логін ---
app.post('/api/login', (req, res) => {
  const { email, password, role } = req.body;
  const foundUser = user.find(u => u.email === email && u.role === role);

  if (!foundUser) {
    return res.status(400).json({ message: 'Account does not exist.' });
  }
  if (!foundUser.verified) {
    return res.status(403).json({ message: 'Email not verified.' });
  }
  if (foundUser.password !== password) {
    return res.status(401).json({ message: 'Invalid password.' });
  }

  logEvent({
    userEmail: email,
    type: "login",
    description: "User logged in",
  });

  res.status(200).json({ 
    message: 'Login successful.', 
    name: foundUser.name,
    email: foundUser.email 
  });
});

app.post('/api/register-student-info', (req, res) => {
  const { surname, firstName, course, group, faculty, department, email } = req.body;

  if (!surname || !firstName || !course || !group || !faculty || !department || !email) {
    return res.status(400).json({ message: 'Заповніть усі обов’язкові поля.' });
  }

  // Тут можна додати додаткову логіку (збереження в БД тощо)

  // Логування події
  logEvent({
    userEmail: email,
    type: 'register',
    description: 'User registered student info',
    meta: { surname, firstName, course, group, faculty, department },
  });

  res.status(200).json({ message: 'Інформація успішно збережена' });
});

// --- API: Додати запис до історії подій ---
app.post('/api/history', (req, res) => {
  const { userEmail, type, description, meta = {} } = req.body;

  if (!userEmail || !type || !description) {
    return res.status(400).json({ message: 'Обовʼязкові поля: userEmail, type, description' });
  }

  const event = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    userEmail,
    type,
    description,
    meta,
  };

  history.push(event);
  saveHistoryToFile();

  res.status(201).json({ message: 'Подію успішно записано в історію', event });
});


// --- API: Підтвердження email ---
app.get('/verify/:token', (req, res) => {
  const token = req.params.token;
  const foundUser = user.find(u => u.token === token);
  if (!foundUser) return res.status(400).send('Invalid token');

  foundUser.verified = true;
  delete foundUser.token;
  saveUsersToFile();

  logEvent({
    userEmail: foundUser.email,
    type: "email_verification",
    description: "Email verified",
  });

  res.redirect('/register');
});

// --- API: Зміна паролю ---
app.post('/api/change-password', (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  const foundUser = user.find(u => u.email === email);
  if (!foundUser) return res.status(404).json({ message: 'Користувача не знайдено.' });
  if (foundUser.password !== oldPassword) return res.status(400).json({ message: 'Старий пароль неправильний.' });

  foundUser.password = newPassword;
  saveUsersToFile();

  logEvent({
    userEmail: email,
    type: "password_change",
    description: "Password changed",
  });

  res.status(200).json({ message: 'Пароль успішно змінено.' });
});


// --- API: Видалення акаунта ---
app.post('/api/delete-account', (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ message: 'Email і роль обов’язкові.' });
  }

  const initialLength = user.length;
  user = user.filter(u => !(u.email === email && u.role.toLowerCase() === role.toLowerCase()));

  if (user.length === initialLength) {
    return res.status(404).json({ message: 'Користувача з таким email і роллю не знайдено.' });
  }

  saveUsersToFile();

  logEvent({
    userEmail: email,
    type: 'account_deletion',
    description: `Account with role ${role} deleted.`,
  });

  return res.status(200).json({ message: 'Акаунт успішно видалено.' });
});



// --- API: Генерація теми + викладачів через Hugging Face ---
app.post('/api/generate-topic', async (req, res) => {
  const { idea } = req.body;

  if (!idea || idea.trim().length < 5) {
    return res.status(400).json({ message: "Ідея занадто коротка." });
  }

  const teachers = [
    { id: 1, name: "Іван Петренко", description: "Штучний інтелект, Java, алгоритми" },
    { id: 2, name: "Олена Коваленко", description: "Бази даних, SQL, хмарні технології" },
    { id: 3, name: "Наталія Бондаренко", description: "Веброзробка, JavaScript, React" },
    { id: 4, name: "Сергій Дяченко", description: "Операційні системи, Linux, C++" },
    { id: 5, name: "Марія Левченко", description: "Машинне навчання, Python, Matplotlib" },
  ];

  const teacherList = teachers.map(t => `${t.id}. ${t.name} — ${t.description}`).join("\n");

  const prompt = `
Ти асистент університету. Завдання:
1. Згенеруй академічну тему курсової роботи на основі ідеї студента.
2. Вибери викладачів із списку, які підходять для керівництва цією темою.

Поверни відповідь у форматі:
{
  "topic": "...",
  "recommendedTeachers": [id1, id2]
}

Ідея студента: ${idea}

Викладачі:
${teacherList}
  `.trim();

  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
        },
        timeout: 60000
      }
    );

    const raw = response.data?.[0]?.generated_text?.trim();
    console.log("🔵 HuggingFace RAW:\n", raw);

    const jsonMatch = raw.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      return res.status(500).json({
        message: "Не вдалося знайти валідний JSON у відповіді",
        raw,
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    logEvent({
      userEmail: "unknown", // якщо є контекст - можна передавати email
      type: "generate_topic",
      description: "Generated course topic and recommended teachers",
      meta: { idea, topic: parsed.topic, recommendedTeachers: parsed.recommendedTeachers }
    });

    res.json(parsed);

  } catch (error) {
    console.error("❌ Hugging Face error:", error.response?.data || error.message);
    res.status(500).json({ message: "Помилка генерації теми або викладачів." });
  }
});

// --- API: Отримати історію подій ---
app.get('/api/history', (req, res) => {
  const { userEmail } = req.query;

  let filteredHistory = history;
  if (userEmail) {
    filteredHistory = history.filter(e => e.userEmail === userEmail);
  }

  // Сортуємо за датою, останні зверху
  filteredHistory = filteredHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json(filteredHistory);
});



const MATERIALS_FILE = path.join(__dirname, 'materials.json');
let materials = [];
if (fs.existsSync(MATERIALS_FILE)) {
  const fileContent = fs.readFileSync(MATERIALS_FILE, 'utf-8').trim();
  if (fileContent) {
    materials = JSON.parse(fileContent);
  }
}

function saveMaterialsToFile() {
  fs.writeFileSync(MATERIALS_FILE, JSON.stringify(materials, null, 2), 'utf-8');
}

// API отримати всі матеріали
app.get('/api/materials', (req, res) => {
  res.json(materials);
});

// API додати матеріал
app.post('/api/materials', (req, res) => {
  const {
    title,
    description,
    author,
    authorAvatar,
    category,
    type,
    uploadDate,
    downloads = 0,
    rating = 0,
    size,
    tags = [],
    fileUrl
  } = req.body;

  if (!title || !description || !author || !category || !type || !uploadDate || !fileUrl) {
    return res.status(400).json({ message: 'Необхідні поля не заповнені.' });
  }

  const newMaterial = {
    id: uuidv4(),
    title,
    description,
    author,
    authorAvatar: authorAvatar || '',
    category,
    type,
    uploadDate,
    downloads,
    rating,
    size,
    tags,
    fileUrl,
  };

  materials.push(newMaterial);
  saveMaterialsToFile();

  logEvent({
    userEmail: "unknown",
    type: "add_material",
    description: `Додано новий матеріал: ${title}`,
  });

  res.status(201).json({ message: 'Матеріал додано', material: newMaterial });
});

// Опційно: видалення
app.delete('/api/materials/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = materials.length;
  materials = materials.filter(m => m.id !== id);
  if (materials.length === initialLength) {
    return res.status(404).json({ message: 'Матеріал не знайдено.' });
  }
  saveMaterialsToFile();

  logEvent({
    userEmail: "unknown",
    type: "delete_material",
    description: `Видалено матеріал з id ${id}`,
  });

  res.json({ message: 'Матеріал видалено' });
});

// Опційно: оновлення
app.put('/api/materials/:id', (req, res) => {
  const { id } = req.params;
  const idx = materials.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Матеріал не знайдено.' });

  const updatedFields = req.body;
  materials[idx] = { ...materials[idx], ...updatedFields };
  saveMaterialsToFile();

  logEvent({
    userEmail: "unknown",
    type: "update_material",
    description: `Оновлено матеріал з id ${id}`,
  });

  res.json({ message: 'Матеріал оновлено', material: materials[idx] });
});


// --- Статика ---
app.use(express.static(distPath));
app.get('/*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});



