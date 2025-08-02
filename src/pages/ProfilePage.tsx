import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

import { useTranslation } from "react-i18next";

const ProfilePage = () => {
  const { t } = useTranslation();
  const [name, setName] = useState("Олександр Петренко");
  const [email, setEmail] = useState("petrenko@student.university.ua");
  const [role, setRole] = useState("Студент 4 курсу");

  const handleSave = () => {
    console.log("Збережено:", { name, email, role });
  };

  const handleLogout = () => {
    console.log("Користувач вийшов з акаунту!");
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    ОП
                  </AvatarFallback>
                </Avatar>
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
                  placeholder="Введіть імʼя"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Введіть email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{t("profile.role")}</Label>
                <Input
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Введіть статус"
                />
              </div>

              {/* Buttons */}
              <div className="space-y-2">
                <Button onClick={handleSave} className="w-full">
                  {t("profile.save")}
                </Button>
                <Button onClick={handleLogout} className="w-full">
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
