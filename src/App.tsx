import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Dashboard from './pages/Index';
import Chat from './pages/Chat';
import ThesisTracker from './pages/ThesisTracker';
import AIAssistant from './pages/AIAssistant';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/Register';
import MainPage from './pages/MainPage';
import LoginPage from './pages/Login';
import ForgotPasswordPage from './pages/ForgotPass';
import CalendarPage from './pages/Calendar';
import Analytics from './pages/Analytics';
import Resources from './pages/Resources';

import { ThemeProvider } from './context/ThemeContext';
import { VoiceAssistantProvider } from './context/VoiceAssistantContext';
import { VoiceIndicator } from './components/VoiceAssistant/VoiceIndicator';
import { VoiceAssistant } from './components/VoiceAssistant/VoiceAssistant';

function App() {
  return (
    <ThemeProvider>
      <VoiceAssistantProvider>
        <Router>
          {/* Глобальний індикатор голосового помічника */}
          <VoiceIndicator />
          
          {/* Головний компонент голосового помічника */}
          <VoiceAssistant />
          
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/tracker" element={<ThesisTracker />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/resources" element={<Resources />} />
          </Routes>
        </Router>
      </VoiceAssistantProvider>
    </ThemeProvider>
  );
}

export default App;