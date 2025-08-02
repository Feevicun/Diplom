import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setName(`${user.firstName} ${user.lastName}`);
      setEmail(user.email);
      setRole(user.role === "student" ? "Студент" : "Викладач");
    }
  }, []);

  const handleSave = () => {
    console.log("Збережено:", { name, email, role });
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    // Перенаправлення відбудеться через Link нижче
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
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
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

                <Link to="/" onClick={handleLogout}>
                  <Button variant="outline" className="w-full">
                    {t("sidebar.logout")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
