# 🎓 Система підбору викладача для курсової роботи

> Інтелектуальна платформа, яка допомагає студентам знайти ідеального викладача для написання курсової роботи без зайвої бюрократії.  
> Створено з турботою про студентів, викладачів та сучасний UI ✨

---

## 🎯 Ціль проєкту

Допомогти студентам **швидко** і **зручно**:
- знайти викладача для курсової
- переглянути доступні теми
- побачити профіль викладача
- подати заявку напряму через інтерфейс  

Усе це без потреби шукати email, телефон або фізично йти на кафедру.

---

## 🧠 Основні можливості

- 🧾 **Формування теми** за допомогою ШІ — на основі твоєї ідеї
- 🧑‍🏫 **Каталог викладачів** з технологіями, тематиками, та кількістю доступних місць
- 💬 **Вбудований чат** — спілкуйся напряму, без пошти чи телефонів
- 📬 **Система сповіщень** — з трьома режимами:
  - Слайдер ↔️
  - Прокрутка 📜
  - Автопрокрутка 🎞
- 🔐 **Ролі**: студент / викладач
- 🧑‍💼 **Профіль користувача** — редагування, перегляд історії, персоналізація
- ✨ **Сучасний мінімалістичний інтерфейс** з плавними анімаціями та стильними темами

---

## 🧑‍🎓 Для студентів

- Введи свою ідею — ШІ допоможе сформулювати тему
- Переглянь викладачів, які підходять під тему
- Обери викладача та подай заявку
- Спілкуйся з ним у чаті
- Слідкуй за оновленнями в сповіщеннях

---

## 🧑‍🏫 Для викладачів

- Приймай або відхиляй заявки
- Переглядай теми студентів
- Керуй профілем, темами, доступними місцями
- Взаємодій через чат або сповіщення

---

## 🌓 Теми інтерфейсу

- `light` ☀️ — мінімалістичне світло
- `dark` 🌙 — зручно для нічного кодингу
- `purple` 💜 — естетика VSCode & Discord
- `beige` 🧸 — для поціновувачів теплих тонів

---

## 🛠 Технології

- ⚛️ **React + Vite** — сучасний стек розробки
- 🧠 **AI-assisted topic generator** — автоматичне формулювання тем
- 🌍 **i18n** — підтримка української та англійської мов
- 📦 **Context API** — глобальний контроль теми
- 🔔 **Notification Drawer** — з анімаціями та різними режимами
- 🎨 **Стилі** — мінімалізм + кастомний CSS
- 🧼 **ESLint** — охайний код

---

## 📁 Структура проекту

```
/diplom
├── server/                       # Серверна частина (Node.js + JSON)
│   ├── .env                     # Змінні середовища
│   ├── server.js                # Основний серверний файл
│   ├── users.json               # Тимчасова база даних користувачів
│   ├── package.json             # Залежності серверної частини
│   └── package-lock.json
│
├── src/                         # Основна папка клієнтської частини
│   ├── components/              # Повторно використовувані компоненти UI
│   │   ├── EmailVerification.jsx
│   │   ├── LanguageSwitcher.jsx
│   │   └── ThemeSwitcher.jsx
│   │
│   ├── context/                 # Глобальні контексти React
│   │   └── ThemeContext.jsx
│   │
│   ├── i18n/                    # Інтернаціоналізація (i18n)
│   │   ├── index.js
│   │   └── locales/
│   │       ├── en.json          # Англійська локалізація
│   │       └── ua.json          # Українська локалізація
│   │
│   ├── pages/                   # Сторінки додатку
│   │   ├── Authorization.jsx
│   │   ├── DeleteAccount.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── RegistrationForm.jsx
│   │   ├── StudentMainPage.jsx
│   │   ├── StudentProfile.jsx
│   │   ├── TeacherMainPage.jsx
│   │   └── TeacherProfile.jsx
│   │
│   ├── styles/                  # CSS-стилі для сторінок і компонентів
│   │   ├── authorization.css
│   │   ├── DeleteAccount.css
│   │   ├── loadingscreen.css
│   │   ├── RegistrationForm.css
│   │   ├── StudentMainPage.css
│   │   ├── profile.css
│   │   ├── TeacherMainPage.css
│   │   └── ThemeSwitcher.css
│
├── App.jsx                      # Головний компонент додатку
├── App.css                      # Стилі для App.jsx
├── index.css                    # Загальні стилі
├── main.jsx                     # Точка входу React
│
├── .gitignore                   # Файли та папки, що ігноруються Git
├── eslint.config.js             # Налаштування ESLint
├── index.html                   # HTML-шаблон для Vite
├── package.json                 # Залежності клієнтської частини
├── package-lock.json
├── README.md                    # Документація проєкту
└── vite.config.js               # Налаштування Vite
```

---

## 🚀 Запуск проєкту

### Встановлення залежностей
```bash
npm install
```

### Запуск в режимі розробки
```bash
npm run dev
```

### Запуск серверної частини
```bash
cd server
npm install
npm start
```

---

## 🌍 English Version

# 🎓 Supervisor Matching System for Coursework

> An intelligent web platform that helps students find the ideal supervisor for their coursework without bureaucracy.  
> Designed with love for students, teachers, and modern UI ✨

### 🎯 Project Goal

Help students **quickly** and **easily**:
- find a supervisor for coursework
- explore available topics and teacher profiles
- submit a request directly through the interface

No need to search for emails, phone numbers, or visit departments physically.

### 🧠 Key Features

- 🧾 **AI-powered topic generation** — based on your idea
- 🧑‍🏫 **Teacher directory** — with expertise, topics, and available slots
- 💬 **Built-in chat** — communicate directly without searching for contacts
- 📬 **Notification system** — with three viewing modes:
  - Slider ↔️  
  - Scroll 📜  
  - Auto-scroll 🎞  
- 🔐 **User roles**: Student / Teacher
- 👤 **User profile management** — edit profile, view history, personalized experience
- ✨ **Modern minimalist interface** with smooth animations and theme switching

### 🧑‍🎓 For Students

- Describe your idea — AI will help generate a coursework topic
- View matching teachers
- Choose a supervisor and submit your request
- Chat directly in-app
- Stay updated through notifications

### 🧑‍🏫 For Teachers

- Accept or reject student requests
- Review submitted ideas and topics
- Manage your profile, topics, and available supervision slots
- Communicate easily via built-in messaging and notifications

### 📁 Project Structure

```
/diplom
├── server/                       # Server-side (Node.js + JSON)
│   ├── .env                     # Environment variables
│   ├── server.js                # Main server file
│   ├── users.json               # Temporary user database
│   ├── package.json             # Server-side dependencies
│   └── package-lock.json
│
├── src/                         # Main client-side folder
│   ├── components/              # Reusable UI components
│   │   ├── EmailVerification.jsx
│   │   ├── LanguageSwitcher.jsx
│   │   └── ThemeSwitcher.jsx
│   │
│   ├── context/                 # Global React contexts
│   │   └── ThemeContext.jsx
│   │
│   ├── i18n/                    # Internationalization (i18n)
│   │   ├── index.js
│   │   └── locales/
│   │       ├── en.json          # English localization
│   │       └── ua.json          # Ukrainian localization
│   │
│   ├── pages/                   # Application pages
│   │   ├── Authorization.jsx
│   │   ├── DeleteAccount.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── RegistrationForm.jsx
│   │   ├── StudentMainPage.jsx
│   │   ├── StudentProfile.jsx
│   │   ├── TeacherMainPage.jsx
│   │   └── TeacherProfile.jsx
│   │
│   ├── styles/                  # CSS styles for pages and components
│   │   ├── authorization.css
│   │   ├── DeleteAccount.css
│   │   ├── loadingscreen.css
│   │   ├── RegistrationForm.css
│   │   ├── StudentMainPage.css
│   │   ├── profile.css
│   │   ├── TeacherMainPage.css
│   │   └── ThemeSwitcher.css
│
├── App.jsx                      # Main application component
├── App.css                      # Styles for App.jsx
├── index.css                    # Global styles
├── main.jsx                     # React entry point
│
├── .gitignore                   # Files and folders ignored by Git
├── eslint.config.js             # ESLint configuration
├── index.html                   # HTML template for Vite
├── package.json                 # Client-side dependencies
├── package-lock.json
├── README.md                    # Project documentation
└── vite.config.js               # Vite configuration
```

---

## 📄 Ліцензія

Цей проєкт створено для навчальних цілей.

## 🤝 Внесок

Вітаються пропозиції та покращення! Відкривайте issues або створюйте pull requests.

---

<div align="center">
  <p>Зроблено з ❤️ для студентів та викладачів</p>
</div>