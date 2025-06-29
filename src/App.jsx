import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import RegistrationForm from './pages/RegistrationForm.jsx';
import Authorization from './pages/Authorization.jsx';
import DeleteAccount from './pages/DeleteAccount.jsx';
import LoadingScreen from './pages/LoadingScreen.jsx';
import MainPage from './pages/StudentMainPage.jsx';
import StudentProfile from './pages/StudentProfile.jsx';
import StudentDashboard from './pages/StudentMainPage.jsx';
import TeacherDashboard from './pages/TeacherMainPage.jsx';
import TeacherProfile from './pages/TeacherProfile.jsx';
import MethodicalMaterials from './pages/MethodicalMaterials.jsx';
import CourseworkLibrary from './pages/CourseworkLibrary.jsx';
import History from './pages/History.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

import EmailVerification from './components/EmailVerification.jsx';
import { AuthProvider } from "./context/AuthContext.jsx";

import { ThemeProvider } from './context/ThemeContext.jsx';
import ThemeSwitcher from './components/ThemeSwitcher.jsx';

import LanguageSwitcher from './components/LanguageSwitcher';

function App() {
  return (
    <ThemeProvider>
       <AuthProvider>
      <Router>
        <div className="container">
          <ThemeSwitcher />
          <Routes>
            <Route path="/" element={<LoadingScreen />} />
            <Route path="/authorization" element={<Authorization />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/delete" element={<DeleteAccount />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/home" element={<StudentDashboard />} />
            <Route path="/sthome" element={<TeacherDashboard />} />
            <Route path="/profile" element={<StudentProfile />} />
            <Route path="/stprofile" element={<TeacherProfile />} />
            <Route path="/materials" element={<MethodicalMaterials />} /> 
            <Route path="/library" element={<CourseworkLibrary />} /> 
            <Route path="/history" element={<History />} /> 
            <Route path="/admin" element={<AdminDashboard />} /> 
            <Route path="/verify/:token" element={<EmailVerification />} />
          </Routes>
        </div>
      </Router>

      <LanguageSwitcher />
       </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
