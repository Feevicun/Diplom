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
        console.log('Завантажуємо дані користувача для профілю...');
        
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log('Знайшли користувача в localStorage:', parsedUser);
            
            // Встановлюємо дані з localStorage
            setName(parsedUser.name || '');
            setEmail(parsedUser.email || '');
            setRole(parsedUser.role === 'student' ? 'Студент' : 'Викладач');
            
            if (parsedUser.avatarUrl) {
              setAvatarUrl(parsedUser.avatarUrl);
            }
            
            return;
          } catch (error) {
            console.log('Помилка парсингу localStorage:', error);
          }
        }

        const res = await fetch('/api/current-user', {
          method: 'GET',
          credentials: 'include',
        });
        
        console.log('Отримали відповідь з API:', res.status, res.ok);
        
        if (res.ok) {
          const data = await res.json();
          const user = data.user;
          console.log('Дані користувача з API:', user);
          
          if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setRole(user.role === 'student' ? 'Студент' : 'Викладач');
            
            if (user.avatarUrl) {
              setAvatarUrl(user.avatarUrl);
            }
            
            const userForStorage = {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatarUrl: user.avatarUrl || null
            };
            localStorage.setItem('currentUser', JSON.stringify(userForStorage));
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

  const handleSave = async () => {
  try {
    console.log('Зберігаємо дані профілю...');
    
    // Спершу дістаємо id користувача з localStorage
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      alert('Користувача не знайдено');
      return;
    }
    const parsedUser = JSON.parse(currentUser);

    const userData = { 
      id: parsedUser.id,
      name: name.trim(),
      email: email.trim(), 
      avatarUrl,
    };
    
    console.log("Дані для збереження:", userData);
    
    const response = await fetch('/api/update-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(`Помилка при збереженні: ${errorData.message}`);
      return;
    }

    const data = await response.json();

    // Оновлюємо localStorage
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    setName(data.user.name);
    setEmail(data.user.email);
    setAvatarUrl(data.user.avatar_url);

    alert('Дані профілю збережено!');
  } catch (error) {
    console.error('Помилка при збереженні профілю:', error);
    alert('Помилка при збереженні даних');
  }
};


  const handleLogout = async () => {
    try {
      console.log('Виходимо з системи...');
      
      // запит на logout
      await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoutTime: new Date().toISOString(),
        }),
        credentials: 'include',
      });

      // Очищаємо localStorage
      localStorage.removeItem('currentUser');
      localStorage.removeItem('firstVisitDone');
      console.log('localStorage очищено');

      // Перенаправлення на головну сторінку
      navigate("/");
    } catch (error) {
      console.error("Помилка при виході:", error);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('firstVisitDone');
      navigate("/");
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
                        .toUpperCase() || "U"}
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
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Роль не можна змінювати самостійно
                </p>
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