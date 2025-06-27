import express from 'express';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();

// Для ES-модуля
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Шлях до users.json
const USERS_FILE = path.join(__dirname, 'users.json');

// Завантаження користувачів із файлу
let user = [];
if (fs.existsSync(USERS_FILE)) {
  const fileContent = fs.readFileSync(USERS_FILE, 'utf-8').trim();
  if (fileContent) {
    user = JSON.parse(fileContent);
  }
}

function saveUsersToFile() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(user, null, 2), 'utf-8');
}

// React build path
const distPath = path.join(__dirname, '..', 'dist');

const app = express();
app.use(express.json());


// 👉 Реєстрація користувача
app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const existing = user.find((u) => u.email === email);
  if (existing) return res.status(400).json({ message: 'Email already used.' });

  const verificationToken = uuidv4();
  const newUser = { name, email, password, role, verified: false, token: verificationToken };
  user.push(newUser);
  saveUsersToFile();

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


// 👉 Логін користувача
app.post('/api/login', (req, res) => {
  const { email, password, role } = req.body;
  const foundUser = user.find(u => u.email === email && u.role === role);

  if (!foundUser) return res.status(400).json({ message: 'Account does not exist.' });
  if (!foundUser.verified) return res.status(403).json({ message: 'Email not verified.' });
  if (foundUser.password !== password) return res.status(401).json({ message: 'Invalid password.' });

  res.status(200).json({ 
    message: 'Login successful.', 
    name: foundUser.name,
    email: foundUser.email 
  });
});

// 👉 Підтвердження email
app.get('/verify/:token', (req, res) => {
  const token = req.params.token;
  const foundUser = user.find(u => u.token === token);
  if (!foundUser) return res.status(400).send('Invalid token');

  foundUser.verified = true;
  delete foundUser.token;
  saveUsersToFile();

  res.redirect('/register');
});

// 👉 Зміна паролю
app.post('/api/change-password', (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  const foundUser = user.find(u => u.email === email);
  if (!foundUser) return res.status(404).json({ message: 'Користувача не знайдено.' });
  if (foundUser.password !== oldPassword) return res.status(400).json({ message: 'Старий пароль неправильний.' });

  foundUser.password = newPassword;
  saveUsersToFile();

  res.status(200).json({ message: 'Пароль успішно змінено.' });
});


// 👉 Генерація теми + викладачів
// 👉 Генерація теми + викладачів через Hugging Face
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
    res.json(parsed);

  } catch (error) {
    console.error("❌ Hugging Face error:", error.response?.data || error.message);
    res.status(500).json({ message: "Помилка генерації теми або викладачів." });
  }
});


// 👉 Статика з React
app.use(express.static(distPath));

// 👉 Всі інші шляхи — на React
app.get('/*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
