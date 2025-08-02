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
import { Lock } from "lucide-react";
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

        alert(`Успішний вхід як ${role === "student" ? "студент" : "викладач"}`);

        // Переадресація залежно від ролі
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

                        {/* Переміщене поле "Роль" */}
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

                        {/* Password */}
                        <div>
                            <Label className="text-white/80 mb-1 block">Пароль</Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Введіть пароль"
                                className="w-full bg-white/10 border border-white/10 text-white/90 placeholder:text-white/50"
                            />
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