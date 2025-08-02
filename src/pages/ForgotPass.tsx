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
import { KeyRound } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");

  const handleReset = () => {
    if (!email) return alert("Введіть пошту!");

    console.log("Request to reset password for:", email);
    alert("На пошту відправлено інструкції з відновлення.");
  };

  return (
    <div className="min-h-screen bg-[#0e0f11] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute top-[-120px] right-[-80px] w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] z-0" />
      <div className="absolute bottom-[-100px] left-[-80px] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] z-0" />

      <div className="w-full max-w-md z-10">
        <Card className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-md transition-all duration-300 hover:shadow-blue-500/20 hover:scale-[1.01] transition-all duration-300">
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-4">
              <KeyRound className="w-7 h-7 text-white/80" />
            </div>
            <CardTitle className="text-xl font-semibold text-white">
              Забули пароль?
            </CardTitle>
          </CardHeader>

          <CardContent className="mt-4 space-y-4">
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

            <GlassButton
              className="w-full mt-6 text-sm py-2"
              variant="primary"
              onClick={handleReset}
            >
              Надіслати інструкції
            </GlassButton>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
