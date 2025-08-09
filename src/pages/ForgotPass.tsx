import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { GlassButton } from "@/components/GlassButton";
import { KeyRound } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User } from "../types/types"; 

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [userFound, setUserFound] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleReset = async () => {
    if (!email || !role) {
      return alert("Введіть пошту та оберіть роль!");
    }

    try {
      const res = await fetch("../server/user.json");
      const users: User[] = await res.json();

      const matchedUser = users.find(
        (user) => user.email === email && user.role === role
      );

      if (!matchedUser) {
        setError("Користувача з такою поштою не знайдено.");
        setUserFound(false);
        return;
      }

      setUserFound(true);
      setError("");
    } catch {
      setError("Помилка при завантаженні даних.");
    }
  };

  const handleSaveNewPassword = () => {
    if (newPassword.length < 6) {
      alert("Пароль має містити щонайменше 6 символів.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Паролі не співпадають.");
      return;
    }

    alert(`Пароль для ${email} успішно змінено! (тільки у пам'яті браузера)`);

    setEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setUserFound(false);
  };

  return (
    <div className="min-h-screen bg-[#0e0f11] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-120px] right-[-80px] w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] z-0" />
      <div className="absolute bottom-[-100px] left-[-80px] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] z-0" />

      <div className="w-full max-w-md z-10">
        <Card className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-4">
              <KeyRound className="w-7 h-7 text-white/80" />
            </div>
            <CardTitle className="text-xl font-semibold text-white">
              {userFound ? "Новий пароль" : "Забули пароль?"}
            </CardTitle>
          </CardHeader>

          <CardContent className="mt-4 space-y-4">
            {!userFound ? (
              <>
                <div>
                  <Label className="text-white/80 mb-1 block">Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@lnu.edu.ua"
                    className="w-full bg-white/10 border border-white/10 text-white/90 placeholder:text-white/50"
                  />
                </div>

                <div>
                  <Label className="text-white/80 mb-1 block">Роль</Label>
                  <Select value={role} onValueChange={(val) => setRole(val)}>
                    <SelectTrigger className="w-full bg-white/10 border border-white/10 text-white/90">
                      <SelectValue placeholder="Оберіть роль" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Студент</SelectItem>
                      <SelectItem value="teacher">Викладач</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {error && (
                  <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
                )}

                <GlassButton
                  className="w-full mt-6 text-sm py-2"
                  variant="primary"
                  onClick={handleReset}
                >
                  Перевірити пошту
                </GlassButton>
              </>
            ) : (
              <>
                <div>
                  <Label className="text-white/80 mb-1 block">Новий пароль</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Введіть новий пароль"
                    className="w-full bg-white/10 border border-white/10 text-white/90"
                  />
                </div>

                <div>
                  <Label className="text-white/80 mb-1 block">Підтвердження паролю</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Повторіть новий пароль"
                    className="w-full bg-white/10 border border-white/10 text-white/90"
                  />
                </div>

                <GlassButton
                  className="w-full mt-6 text-sm py-2"
                  variant="primary"
                  onClick={handleSaveNewPassword}
                >
                  Зберегти новий пароль
                </GlassButton>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
