
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, User, LogIn, Shield as AdminIcon, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

// Вспомогательная функция для проверки авторизации
function checkAuth() {
  return localStorage.getItem("auth_user") === "true";
}

const Cabinet = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"default" | "register">("default");
  const [registerName, setRegisterName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setIsAuth(checkAuth());
    setName(localStorage.getItem("cabinet_name") || "");
  }, []);

  function handleLogin() {
    localStorage.setItem("auth_user", "true");
    setIsAuth(true);
    toast({ title: "Успешный вход!", duration: 1700 });
  }

  function handleRegisterStart() {
    setMode("register");
    setRegisterName("");
  }

  function handleRegisterSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!registerName.trim()) {
      toast({ title: "Пожалуйста, введите имя" });
      return;
    }
    localStorage.setItem("auth_user", "true");
    localStorage.setItem("cabinet_name", registerName);
    setIsAuth(true);
    setName(registerName);
    setMode("default");
    toast({ title: "Регистрация завершена!", description: "Добро пожаловать, " + registerName, duration: 1600 });
  }

  function handleLogout() {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("cabinet_name");
    localStorage.removeItem("cabinet_card");
    localStorage.removeItem("cabinet_card_number");
    localStorage.removeItem("cabinet_card_holder");
    localStorage.removeItem("cabinet_card_exp");
    setIsAuth(false);
    setName("");
  }

  function saveProfileData() {
    localStorage.setItem("cabinet_name", name);
    toast({ title: "Изменения сохранены" });
  }

  // --------- Новый компонент AdminButton ---------
  const AdminButton = () => {
    const navigate = useNavigate();
    return (
      <Button
        size="sm"
        variant="outline"
        className="fixed top-4 right-4 z-50 px-3 py-2 rounded-lg shadow border border-blue-200 bg-white text-blue-700 flex gap-2 items-center hover:bg-blue-100 transition"
        onClick={() => navigate("/admin")}
      >
        <AdminIcon size={18} />
        <span className="font-semibold text-sm">Админка</span>
      </Button>
    );
  };
  // ------------------------------------------------

  // Форма регистрации
  if (!isAuth && mode === "register") {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-24 gap-5">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <User size={28} /> Регистрация
        </h1>
        <form
          className="bg-white rounded-xl p-6 shadow-lg border flex flex-col gap-4 min-w-[320px] w-full max-w-xs"
          onSubmit={handleRegisterSubmit}
        >
          <div>
            <label className="block font-semibold mb-1">Ваше имя</label>
            <Input
              placeholder="Введите имя"
              value={registerName}
              onChange={e => setRegisterName(e.target.value)}
              autoFocus
            />
          </div>
          <Button
            type="submit"
            variant="default"
            className="w-full"
          >
            Зарегистрироваться
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full flex gap-2 items-center"
            onClick={() => setMode("default")}
          >
            <ArrowLeft size={17} /> Назад
          </Button>
        </form>
        <AdminButton />
      </div>
    );
  }

  // Базовый режим — выбор входа/регистрации
  if (!isAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-24 gap-5">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <User size={28} /> Кабинет пользователя
        </h1>
        <p className="text-gray-600 text-center max-w-xs">
          Чтобы использовать личный кабинет и бронирование парковки, войдите или зарегистрируйтесь.
        </p>
        <div className="flex gap-3 mt-4">
          <Button onClick={handleLogin} variant="default" className="flex gap-1 items-center">
            <LogIn size={18} /> Войти
          </Button>
          <Button onClick={handleRegisterStart} variant="secondary" className="flex gap-1 items-center">
            <User size={18} /> Зарегистрироваться
          </Button>
        </div>
        <AdminButton />
      </div>
    );
  }

  // После входа — профиль
  return (
    <div className="flex flex-col items-center pt-20 px-4 max-w-md mx-auto w-full">
      <AdminButton />
      <h1 className="text-2xl font-bold mb-3 flex items-center gap-2 text-blue-700">
        <User /> Личный кабинет
      </h1>
      <div className="bg-white rounded-xl w-full p-6 shadow-lg border space-y-6">
        <div>
          <label className="block font-semibold mb-0.5">Имя</label>
          <Input
            placeholder="Введите ваше имя"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <Button
          onClick={saveProfileData}
          variant="default"
          className="w-full mt-2"
        >
          Сохранить изменения
        </Button>
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          Выйти из аккаунта
        </Button>
      </div>
    </div>
  );
};

export default Cabinet;
