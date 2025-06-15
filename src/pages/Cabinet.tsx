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
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState<"default" | "register">("default");
  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setIsAuth(checkAuth());
    setName(localStorage.getItem("cabinet_name") || "");
    setEmail(localStorage.getItem("cabinet_email") || "");
    setPhone(localStorage.getItem("cabinet_phone") || "");
  }, []);

  function handleLogin() {
    localStorage.setItem("auth_user", "true");
    setIsAuth(true);
    setName(localStorage.getItem("cabinet_name") || "");
    setEmail(localStorage.getItem("cabinet_email") || "");
    setPhone(localStorage.getItem("cabinet_phone") || "");
    toast({ title: "Успешный вход!", duration: 1700 });
  }

  function handleRegisterStart() {
    setMode("register");
    setRegisterName("");
    setRegisterPhone("");
    setRegisterEmail("");
    setRegisterPassword("");
  }

  function handleRegisterSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (
      !registerName.trim() ||
      !registerPhone.trim() ||
      !registerEmail.trim() ||
      !registerPassword.trim()
    ) {
      toast({ title: "Пожалуйста, заполните все поля" });
      return;
    }
    localStorage.setItem("auth_user", "true");
    localStorage.setItem("cabinet_name", registerName);
    localStorage.setItem("cabinet_phone", registerPhone);
    localStorage.setItem("cabinet_email", registerEmail);
    localStorage.setItem("cabinet_password", registerPassword);
    setIsAuth(true);
    setName(registerName);
    setEmail(registerEmail);
    setPhone(registerPhone);
    setMode("default");
    // Очищаем поля после регистрации
    setRegisterName("");
    setRegisterPhone("");
    setRegisterEmail("");
    setRegisterPassword("");
    toast({
      title: "Регистрация завершена!",
      description: "Добро пожаловать, " + registerName,
      duration: 1600,
    });
  }

  function handleLogout() {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("cabinet_name");
    localStorage.removeItem("cabinet_phone");
    localStorage.removeItem("cabinet_email");
    localStorage.removeItem("cabinet_password");
    localStorage.removeItem("cabinet_card");
    localStorage.removeItem("cabinet_card_number");
    localStorage.removeItem("cabinet_card_holder");
    localStorage.removeItem("cabinet_card_exp");
    setIsAuth(false);
    setName("");
    setEmail("");
    setPhone("");
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
            <label className="block font-semibold mb-1">Телефон</label>
            <Input
              placeholder="+7 (___) ___-__-__"
              value={registerPhone}
              onChange={e => setRegisterPhone(e.target.value)}
              type="tel"
              autoFocus
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email</label>
            <Input
              placeholder="Введите e-mail"
              value={registerEmail}
              onChange={e => setRegisterEmail(e.target.value)}
              type="email"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Пароль</label>
            <Input
              placeholder="Пароль"
              value={registerPassword}
              onChange={e => setRegisterPassword(e.target.value)}
              type="password"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Ваше имя</label>
            <Input
              placeholder="Введите имя"
              value={registerName}
              onChange={e => setRegisterName(e.target.value)}
              type="text"
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
        <div>
          <label className="block font-semibold mb-0.5">Email</label>
          <Input
            value={email}
            readOnly
            type="email"
            className="bg-gray-50 cursor-default"
          />
        </div>
        <div>
          <label className="block font-semibold mb-0.5">Телефон</label>
          <Input
            value={phone}
            readOnly
            type="tel"
            className="bg-gray-50 cursor-default"
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
