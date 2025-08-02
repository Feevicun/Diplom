import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GlassButton } from "@/components/GlassButton";
import { UserPlus, LogIn, GraduationCap, Users, BookOpen } from "lucide-react";

const MainPage = () => {
  return (
    <div className="min-h-screen bg-[#0e0f11] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Blur decorations */}
      <div className="absolute top-[-120px] right-[-80px] w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] z-0" />
      <div className="absolute bottom-[-100px] left-[-80px] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] z-0" />

      <div className="w-full max-w-5xl z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="mx-auto w-16 h-16 bg-white/10 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/10 shadow-lg mb-4">
            <GraduationCap className="w-8 h-8 text-white/90" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Студентський портал
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Навчання, етапи роботи та комунікація в одному місці
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-stretch">
          {/* Student Card */}
          <Card className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-md hover:shadow-blue-500/20 hover:scale-[1.01] transition-all duration-300 max-w-[420px] w-full mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-10 h-10 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 text-blue-300 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-4 h-4" />
              </div>
              <CardTitle className="text-lg font-semibold text-white">
                Для студентів
              </CardTitle>
              <CardDescription className="text-white/50 text-sm mt-1">
                Авторизуйтесь, щоб увійти до системи
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-4 flex flex-col gap-2">
              <Link to="/login">
                <GlassButton variant="primary" className="w-full text-sm py-2">
                  <LogIn className="w-4 h-4 mr-2" />
                  Увійти
                </GlassButton>
              </Link>
              <Link to="/register">
                <GlassButton variant="secondary" className="w-full text-sm py-2">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Зареєструватися
                </GlassButton>
              </Link>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-md hover:shadow-purple-500/20 hover:scale-[1.01] transition-all duration-300 max-w-[420px] w-full mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-10 h-10 bg-gradient-to-br from-purple-400/20 to-pink-400/20 text-purple-300 rounded-lg flex items-center justify-center mb-3">
                <BookOpen className="w-4 h-4" />
              </div>
              <CardTitle className="text-lg font-semibold text-white">
                Можливості
              </CardTitle>
              <CardDescription className="text-white/50 text-sm mt-1">
                Доступ до всіх навчальних сервісів
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-4">
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3" />
                  Особистий кабінет
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3" />
                 Підтримка AI 
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3" />
                  Сповіщення про дедлайни
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-3" />
                  Дедлайни та перевірка етапів виконання
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3" />
                  Комунікація з викладачами
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-36">
          <p className="text-xs text-white/40">
            © 2025 Львівський національний університет ім. Івана Франка
          </p>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
