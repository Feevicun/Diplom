import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/current-user', {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          const user = data.user;
          if (user) {
            setName(`${user.firstName} ${user.lastName}`.trim());
            setEmail(user.email);
            setRole(user.role === 'student' ? 'Студент' : 'Викладач');
            if (user.avatarUrl) {
              setAvatarUrl(user.avatarUrl);
            }
          }
        } else {
          console.warn('Не вдалось отримати користувача:', res.status);
        }
      } catch (err) {
        console.error('Помилка при завантаженні користувача:', err);
      }
    }

    fetchUser();
  }, []);

  const handleSave = () => {
    const userData = { 
      firstName: name.split(" ")[0] || "", 
      lastName: name.split(" ")[1] || "", 
      email, 
      role: role === "Студент" ? "student" : "teacher",
      avatarUrl,
    };
    console.log("Збережено (поки що тільки в консолі):", userData);
    // Якщо потрібно, тут можна зробити запит для оновлення профілю на сервері
  };

  const handleLogout = async () => {
    try {
      // Відправка запиту на logout
      await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoutTime: new Date().toISOString(),
        }),
        credentials: 'include',
      });

      // Перенаправлення на головну сторінку
      navigate("/");
    } catch (error) {
      console.error("Помилка при виході:", error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setAvatarUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="User avatar" />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                />
                <div>
                  <CardTitle>{t("profile.title")}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("profile.subtitle")}
                  </p>
                </div>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("profile.name")}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("profile.namePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("profile.emailPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{t("profile.role")}</Label>
                <Input
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder={t("profile.rolePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Button onClick={handleSave} className="w-full">
                  {t("profile.save")}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLogout}
                >
                  {t("sidebar.logout")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
