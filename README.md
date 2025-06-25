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

- ⚛️ React + Vite — сучасний стек розробки
- 🧠 AI-assisted topic generator — автоматичне формулювання тем
- 🌍 i18n — підтримка української та англійської мов
- 📦 Context API — глобальний контроль теми
- 🔔 Notification Drawer — з анімаціями та різними режимами
- 🎨 Стилі — мінімалізм + кастомний CSS
- 🧼 ESLint — охайний код

---

## Структура проекту 
/diplom
│
├── server/
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   └── users.json
│
├── src/
│   ├── components/
│   │   ├── EmailVerification.jsx
│   │   ├── LanguageSwitcher.jsx
│   │   └── ThemeSwitcher.jsx
│   │
│   ├── context/
│   │   └── ThemeContext.jsx
│   │
│   ├── i18n/
│   │   ├── index.js
│   │   └── locales/
│   │       ├── en.json
│   │       └── ua.json
│   │
│   ├── pages/
│   │   ├── Authorization.jsx
│   │   ├── DeleteAccount.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── RegistrationForm.jsx
│   │   ├── StudentMainPage.jsx
│   │   ├── StudentProfile.jsx
│   │   ├── TeacherMainPage.jsx
│   │   └── TeacherProfile.jsx
│   │
│   ├── styles/
│   │   ├── authorization.css
│   │   ├── DeleteAccount.css
│   │   ├── loadingscreen.css
│   │   ├── RegistrationForm.css
│   │   ├── StudentMainPage.css
│   │   ├── profile.css
│   │   ├── TeacherMainPage.css
│   │   └── ThemeSwitcher.css
│
├── App.jsx
├── App.css
├── index.css
├── main.jsx
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js

## 🚀 Запуск

```bash
npm install
npm run dev





# 🎓 Supervisor Matching System for Coursework

> An intelligent web platform that helps students find the ideal supervisor for their coursework without bureaucracy.  
> Designed with love for students, teachers, and modern UI ✨

---

## 🎯 Project Goal

Help students **quickly** and **easily**:
- find a supervisor for coursework
- explore available topics and teacher profiles
- submit a request directly through the interface  
No need to search for emails, phone numbers, or visit departments physically.

---

## 🧠 Key Features

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

---

## 🧑‍🎓 For Students

- Describe your idea — AI will help generate a coursework topic
- View matching teachers
- Choose a supervisor and submit your request
- Chat directly in-app
- Stay updated through notifications

---

## 🧑‍🏫 For Teachers

- Accept or reject student requests
- Review submitted ideas and topics
- Manage your profile, topics, and available supervision slots
- Communicate easily via built-in messaging and notifications

---

## 🌈 Interface Themes

- `light` ☀️ — clean and minimalist
- `dark` 🌙 — perfect for night coding
- `purple` 💜 — VSCode & Discord aesthetics
- `beige` 🧸 — for fans of cozy, warm tones

---

## 🛠 Tech Stack

- ⚛️ React + Vite — modern frontend tools
- 🧠 AI topic suggestion — smart assistance
- 🌍 i18n — multilingual support (Ukrainian & English)
- 📦 Context API — global state for theming
- 🔔 Notification drawer — with animation and view modes
- 🎨 Custom CSS — elegant minimalist design
- 🧼 ESLint — clean, consistent code style

---

Project Structure
/diplom
│
├── server/
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   └── users.json
│
├── src/
│   ├── components/
│   │   ├── EmailVerification.jsx
│   │   ├── LanguageSwitcher.jsx
│   │   └── ThemeSwitcher.jsx
│   │
│   ├── context/
│   │   └── ThemeContext.jsx
│   │
│   ├── i18n/
│   │   ├── index.js
│   │   └── locales/
│   │       ├── en.json
│   │       └── ua.json
│   │
│   ├── pages/
│   │   ├── Authorization.jsx
│   │   ├── DeleteAccount.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── RegistrationForm.jsx
│   │   ├── StudentMainPage.jsx
│   │   ├── StudentProfile.jsx
│   │   ├── TeacherMainPage.jsx
│   │   └── TeacherProfile.jsx
│   │
│   ├── styles/
│   │   ├── authorization.css
│   │   ├── DeleteAccount.css
│   │   ├── loadingscreen.css
│   │   ├── RegistrationForm.css
│   │   ├── StudentMainPage.css
│   │   ├── profile.css
│   │   ├── TeacherMainPage.css
│   │   └── ThemeSwitcher.css
│
├── App.jsx
├── App.css
├── index.css
├── main.jsx
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js


---

## 🚀 Getting Started

```bash
npm install
npm run dev
