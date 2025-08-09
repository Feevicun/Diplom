import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlassButton } from "@/components/GlassButton";
import { GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const [faculties, setFaculties] = useState<{ id: number; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);

  const [selectedFaculty, setSelectedFaculty] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);

  const navigate = useNavigate();

  // Load faculties on component mount
  useEffect(() => {
    async function fetchFaculties() {
      try {
        const res = await fetch("http://localhost:4000/api/faculties");
        if (!res.ok) throw new Error("Failed to load faculties");
        const data = await res.json();
        setFaculties(data);
      } catch (error) {
        console.error(error);
        alert("Не вдалося завантажити факультети");
      }
    }
    fetchFaculties();
  }, []);

  // Load departments when faculty changes
  useEffect(() => {
    if (selectedFaculty === null) {
      setDepartments([]);
      setSelectedDepartment(null);
      return;
    }

    async function fetchDepartments() {
      try {
        const res = await fetch(`http://localhost:4000/api/faculties/${selectedFaculty}/departments`);
        if (!res.ok) throw new Error("Failed to load departments");
        const data = await res.json();
        setDepartments(data);
      } catch (error) {
        console.error(error);
        alert("Не вдалося завантажити кафедри");
      }
    }
    fetchDepartments();
  }, [selectedFaculty]);

  const handleSubmit = async () => {
    if (!selectedFaculty || !selectedDepartment) {
      alert("Будь ласка, оберіть факультет і кафедру");
      return;
    }

    const formData = {
      firstName,
      lastName,
      email,
      password,
      facultyId: selectedFaculty,
      departmentId: selectedDepartment,
      role,
    };

    try {
      const res = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(`Помилка: ${data.message}`);
        return;
      }

      // Auto-login after registration
      const loginRes = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        alert(`Помилка логіну після реєстрації: ${loginData.message}`);
        return;
      }

      localStorage.setItem("token", loginData.token);
      localStorage.setItem("currentUser", JSON.stringify(loginData.user));

      if (loginData.user.role === "student") {
        navigate("/dashboard");
      } else if (loginData.user.role === "teacher") {
        navigate("/analytics");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Помилка мережі:", error);
      alert("Помилка мережі. Спробуйте пізніше.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0f11] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Blur Backgrounds */}
      <div className="absolute top-[-120px] right-[-80px] w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] z-0" />
      <div className="absolute bottom-[-100px] left-[-80px] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] z-0" />

      <div className="w-full max-w-3xl z-10">
        <Card className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-md transition-all duration-300 hover:shadow-blue-500/20 hover:scale-[1.01]">
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-4">
              <GraduationCap className="w-7 h-7 text-white/80" />
            </div>
            <CardTitle className="text-xl font-semibold text-white">
              Реєстрація користувача
            </CardTitle>

            {/* Role Field */}
            <div className="mt-6 w-full md:w-1/2 mx-auto">
              <Label className="text-white/80 mb-1 block text-left">Роль</Label>
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
          </CardHeader>

          <CardContent className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <Label className="text-white/80 mb-1 block">Імʼя</Label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Введіть імʼя"
                  className="w-full bg-white/10 border border-white/10 text-white/90 rounded-md px-3 py-2 outline-none placeholder:text-white/50"
                />
              </div>

              {/* Last Name */}
              <div>
                <Label className="text-white/80 mb-1 block">Прізвище</Label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Введіть прізвище"
                  className="w-full bg-white/10 border border-white/10 text-white/90 rounded-md px-3 py-2 outline-none placeholder:text-white/50"
                />
              </div>

              {/* Email */}
              <div>
                <Label className="text-white/80 mb-1 block">Email</Label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@lnu.edu.ua"
                  className="w-full bg-white/10 border border-white/10 text-white/90 rounded-md px-3 py-2 outline-none placeholder:text-white/50"
                />
              </div>

              {/* Password */}
              <div>
                <Label className="text-white/80 mb-1 block">Пароль</Label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введіть пароль"
                  className="w-full bg-white/10 border border-white/10 text-white/90 rounded-md px-3 py-2 outline-none placeholder:text-white/50"
                />
              </div>

              {/* Faculty */}
              <div>
                <Label className="text-white/80 mb-1 block">Факультет</Label>
                <Select
                  onValueChange={(value) => {
                    setSelectedFaculty(Number(value));
                    setSelectedDepartment(null);
                  }}
                  value={selectedFaculty?.toString() || ""}
                >
                  <SelectTrigger className="w-full bg-white/10 border border-white/10 text-white/90">
                    <SelectValue placeholder="Оберіть факультет" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map(({ id, name }) => (
                      <SelectItem key={id} value={id.toString()}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department */}
              <div className="md:col-start-2">
                <Label className="text-white/80 mb-1 block">Кафедра</Label>
                <Select
                  onValueChange={(value) => setSelectedDepartment(Number(value))}
                  value={selectedDepartment?.toString() || ""}
                  disabled={!selectedFaculty}
                >
                  <SelectTrigger className="w-full bg-white/10 border border-white/10 text-white/90">
                    <SelectValue placeholder="Оберіть кафедру" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(({ id, name }) => (
                      <SelectItem key={id} value={id.toString()}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit Button */}
            <GlassButton
              className="w-full mt-8 text-sm py-2"
              variant="primary"
              onClick={handleSubmit}
            >
              Зареєструватися
            </GlassButton>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
