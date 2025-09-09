import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { GlassButton } from "@/components/GlassButton";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [userFound, setUserFound] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleReset = async () => {
    if (!email || !role) {
      return alert("Введіть пошту та оберіть роль!");
    }

    try {
      const response = await fetch("/api/forgot-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      if (response.ok) {
        setUserFound(true);
        setError("");
      } else {
        setError("Користувача з такою поштою не знайдено.");
        setUserFound(false);
      }
    } catch {
      setError("Помилка при завантаженні даних.");
    }
  };

  const handleSaveNewPassword = async () => {
    if (newPassword.length < 6) {
      alert("Пароль має містити щонайменше 6 символів.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Паролі не співпадають.");
      return;
    }

    try {
      const response = await fetch("/api/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Пароль для ${email} успішно змінено!`);
        setEmail("");
        setNewPassword("");
        setConfirmPassword("");
        setUserFound(false);
        setError("");
        navigate("/");
      } else {
        alert(data.message || "Помилка при зміні паролю.");
      }
    } catch {
      alert("Помилка з'єднання з сервером.");
    }
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
                {/* Новий пароль */}
                <div>
                  <Label className="text-white/80 mb-1 block">Новий пароль</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Введіть новий пароль"
                      className="w-full bg-white/10 border border-white/10 text-white/90 placeholder:text-white/50 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
                      aria-label={showNewPassword ? "Сховати пароль" : "Показати пароль"}
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} className="text-white/70" />
                      ) : (
                        <Eye size={18} className="text-white/70" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Підтвердження паролю */}
                <div>
                  <Label className="text-white/80 mb-1 block">Підтвердження паролю</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Повторіть новий пароль"
                      className="w-full bg-white/10 border border-white/10 text-white/90 placeholder:text-white/50 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
                      aria-label={showConfirmPassword ? "Сховати пароль" : "Показати пароль"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} className="text-white/70" />
                      ) : (
                        <Eye size={18} className="text-white/70" />
                      )}
                    </button>
                  </div>
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
