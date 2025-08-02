import { useState } from "react";
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

// Мокані дані: факультети з кафедрами, спеціальностей нема
const facultyData: Record<string, { departments: string[] }> = {
  "Біологічний факультет": {
    departments: [
      "біофізики та біоінформатики",
      "біохімії",
      "ботаніки",
      "генетики та біотехнології",
      "зоології та екології тварин",
      "мікробіології",
      "фізіології людини та тварин",
      "фізіології та екології рослин",
      "екології",
    ],
  },
  "Географічний факультет": {
    departments: [
      "географії України",
      "геоморфології і палеографії",
      "ґрунтознавства і географії ґрунтів",
      "економічної і соціальної географії",
      "конструктивної географії та картографії",
      "раціонального використання природних ресурсів і охорони природи",
      "туризму",
      "фізичної географії",
    ],
  },
  "Геологічний факультет": {
    departments: [
      "геології корисних копалин і геофізики",
      "екологічної та інженерної геології і гідрогеології",
      "загальної та історичної геології і палеонтології",
      "мінералогіїї, петрографії і геохімії",
    ],
  },
  "Економічний факультет": {
    departments: [
      "аналітичної економії і міжнародної економіки",
      "банківського і страхового бізнесу",
      "економічної кібернетики",
      "економіки України",
      "інформаційниї систем в менеджменті",
      "маркетингу",
      "менеджменту",
      "обліку і аудиту",
      "статистики",
      "фінансів, грошового обліку і кредиту",
    ],
  },
  "Факультет електроніки та компʼютерних технологій": {
    departments: [
      "оптоелектроніки та інформаційних технологій",
      "радіоелектронних і компʼютерних систем",
      "радіофізики та компʼютерних технологій",
      "системного проектування",
      "сенсорної та напівпровідникової електроніки",
      "фізичної і біомедичної електроніки",
    ],
  },
  "Факультет журналістики": {
    departments: [
      "зарубіжної преси та інформації",
      "мови засобів масової інформації",
      "української преси",
    ],
  },
  "Факультет іноземних мов": {
    departments: [
      "англійської філології",
      "класичної філології",
      "німецької філології",
      "світової літератури",
      "французької та іспанської філології",
      "міжкультурної комунікації та перекладу",
    ],
  },
  "Історичний факультет": {
    departments: [
      "новітньої історії України",
      "давньої історії України та архівознавства",
      "історії середніх віків та візантиністики",
      "нової та новітньої історії",
      "історії словʼянських країн",
      "етнології",
      "історичного краєзнавства",
      "арехології та історії стародавнього світу",
      "соціології",
    ],
  },
  "Факультет культури і мистецтв": {
    departments: [
      "музичне мистецтво",
      "режисури та хореографії",
      "соціокультурного менеджменту",
      "театрознавства та акторської майстерності",
    ],
  },
  "Механіко-математичний факультет": {
    departments: [
      "алгебри та логіки",
      "геометрії та топології",
      "диференціальних рівнянь",
      "математичної економіки і економетрії",
      "математичного моделювання",
      "математчного і функціонального аналізу",
      "теорії функцій і теорії ймовірностей",
      "теортичної та прикладної статистики",
      "механіки",
      "вищої математики",
    ],
  },
  "Факультет міжнародних відносин": {
    departments: [
      "міжнародного права",
      "міжнародних економічних відносин",
      "іноземних мов факультету міжнародних відносин",
      "країнознавства і міжнародного туризму",
      "міжнародних відносин і дипломатичної служби",
      "міжнародного економічного аналізу і фінансів",
      "європейського права",
    ],
  },
  "Факультет педагогічної освіти": {
    departments: [
      "загальної педагогіки та педагогіки вищої школи",
      "початкової та дошкільної освіти",
      "соціальної педагогіки та соціальної роботи",
      "соціальної освіти",
      "фізичного виховання та спорту",
    ],
  },
  "Факультет прикладної математики та інформатики": {
    departments: [
      "обчислювальної математики",
      "прикладної математики",
      "теорії оптимальних процесів",
      "програмування",
      "інформаційних систем",
      "математичного моделювання соціально-економічних процесів",
      "дискретного аналізу та інтелектуальних систем",
      "кібербезпеки",
    ],
  },
  "Факультет управління фінансами та бізнесу": {
    departments: [
      "економіки та публічного управління",
      "обліку, аналізу і контролю",
      "публічного адміністрування та управління бізнесом",
      "фінансових технологій та консалтингу",
      "фінансового менеджменту",
      "цифрової економіки та бізнес-аналітики",
    ],
  },
  "Фізичний факультет": {
    departments: [
      "астрофізики",
      "експериментальної фізики",
      "загальної фізики",
      "фізики металів",
    ],
  },
  "Філологічний факультет": {
    departments: [
      "загального мовознавства",
      "польської філології",
      "словʼянської філології",
      "сходознавства",
      "української літератури",
    ],
  },
  "Філософський факультет": {
    departments: [
      "історії філософії",
      "політології",
      "психології",
      "теорії та історії культури",
      "теорії та історії політичної науки",
      "філософії",
    ],
  },
  "Хімічний факультет": {
    departments: [
      "аналітичної хімії",
      "органічної хімії",
      "неорганічної хімії",
    ],
  },
  "Юридичний факультет": {
    departments: [
      "адміністративного та фінансового права",
      "конституційного права",
      "кримінального процесу і криміналістики",
      "соціального права",
      "цивільного права та процесу",
    ],
  },
};

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const departments = selectedFaculty
    ? facultyData[selectedFaculty]?.departments || []
    : [];

  const handleSubmit = () => {
    const formData = {
      firstName,
      lastName,
      email,
      password,
      faculty: selectedFaculty,
      department: selectedDepartment,
    };
    console.log("Form Data:", formData);
    alert("Реєстрація успішна ✅");
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
              Реєстрація студента
            </CardTitle>
          </CardHeader>

          <CardContent className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
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

              {/* Surname */}
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
                    setSelectedFaculty(value);
                    setSelectedDepartment("");
                  }}
                  value={selectedFaculty}
                >
                  <SelectTrigger className="w-full bg-white/10 border border-white/10 text-white/90">
                    <SelectValue placeholder="Оберіть факультет" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(facultyData).map((faculty) => (
                      <SelectItem key={faculty} value={faculty}>
                        {faculty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department */}
              <div className="md:col-start-2">
                <Label className="text-white/80 mb-1 block">Кафедра</Label>
                <Select
                  onValueChange={(value) => setSelectedDepartment(value)}
                  value={selectedDepartment}
                  disabled={!selectedFaculty}
                >
                  <SelectTrigger className="w-full bg-white/10 border border-white/10 text-white/90">
                    <SelectValue placeholder="Оберіть кафедру" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <GlassButton
              className="w-full mt-8 text-sm py-2"
              variant="primary"
              onClick={handleSubmit} >
              Зареєструватися
            </GlassButton>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;