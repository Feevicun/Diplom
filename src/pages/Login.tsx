import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { GlassButton } from "@/components/GlassButton";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:4000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, role }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(`Помилка: ${data.message}`);
                return;
            }

            console.log("User from server:", data.user);
            console.log("Token:", data.token);

            localStorage.setItem("token", data.token);
            localStorage.setItem("currentUser", JSON.stringify(data.user));

            if (role === "student") {
                window.location.href = "/dashboard";
            } else {
                window.location.href = "/analytics";
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("Помилка мережі. Спробуйте пізніше.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0e0f11] flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Blur background effects */}
            <div className="absolute top-[-120px] right-[-80px] w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] z-0" />
            <div className="absolute bottom-[-120px] left-[-80px] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] z-0" />

            <div className="w-full max-w-md z-10">
                <Card className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-md hover:shadow-purple-500/20 hover:scale-[1.01] transition-all duration-300">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-4">
                            <Lock className="w-7 h-7 text-white/80" />
                        </div>
                        <CardTitle className="text-xl font-semibold text-white">
                            Вхід у кабінет
                        </CardTitle>

                        {/* Роль */}
                        <div className="mt-6 w-full mx-auto text-left">
                            <Label className="text-white/80 mb-1 block">Роль</Label>
                            <Select value={role} onValueChange={(val) => setRole(val)}>
                                <SelectTrigger className="w-full bg-white/10 border border-white/10 text-white/90">
                                    <SelectValue placeholder="Оберіть роль" />
                                </SelectTrigger>
                                <SelectContent className="bg-white text-black">
                                    <SelectItem value="student">Студент</SelectItem>
                                    <SelectItem value="teacher">Викладач</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>

                    <CardContent className="mt-4 space-y-4">
                        {/* Email */}
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

                        {/* Password with eye toggle */}
                        <Label className="text-white/80 mb-1 block">Пароль</Label>
                        <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Введіть пароль"
                              className="w-full bg-white/10 border border-white/10 text-white/90 placeholder:text-white/50 pr-12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
                            >
                        {/* Якщо пароль показаний — показуємо Eye (очі відкриті), інакше EyeOff */}
                        {showPassword ? (
                          <Eye size={18} className="text-white/70" />
                        ) : (
                          <EyeOff size={18} className="text-white/70" />
                        )}
                            </button>
                        </div>

                        {/* Button */}
                        <GlassButton
                            className="w-full mt-6 text-sm py-2"
                            variant="primary"
                            onClick={handleLogin}
                        >
                            Увійти
                        </GlassButton>

                        <p className="text-sm text-white/60 text-center mt-4">
                            <Link to="/forgot-password" className="underline text-white/80 hover:text-white">
                                Забули пароль?
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
