
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, CreditCard, User, LogIn } from "lucide-react";

// Вспомогательная функция для проверки авторизации
function checkAuth() {
  return localStorage.getItem("auth_user") === "true";
}

const Cabinet = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [name, setName] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [cardLinked, setCardLinked] = useState(false);

  // При монтировании получить статус авторизации и данные профиля
  useEffect(() => {
    setIsAuth(checkAuth());
    setName(localStorage.getItem("cabinet_name") || "");
    setArrivalTime(localStorage.getItem("cabinet_arrival") || "");
    setCardLinked(localStorage.getItem("cabinet_card") === "linked");
  }, []);

  // Моковые обработчики входа, регистрации, выхода
  function handleLogin() {
    localStorage.setItem("auth_user", "true");
    setIsAuth(true);
  }
  function handleRegister() {
    localStorage.setItem("auth_user", "true");
    setIsAuth(true);
  }
  function handleLogout() {
    localStorage.removeItem("auth_user");
    setIsAuth(false);
  }

  // Сохранение профиля
  function saveProfileData() {
    localStorage.setItem("cabinet_name", name);
    localStorage.setItem("cabinet_arrival", arrivalTime);
  }

  // "Привязать карту" (затычка)
  function handleLinkCard() {
    setCardLinked(true);
    localStorage.setItem("cabinet_card", "linked");
  }

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
          <Button onClick={handleRegister} variant="secondary" className="flex gap-1 items-center">
            <User size={18} /> Зарегистрироваться
          </Button>
        </div>
      </div>
    );
  }

  // Если авторизован — профиль
  return (
    <div className="flex flex-col items-center pt-20 px-4 max-w-md mx-auto w-full">
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
          <label className="block font-semibold mb-0.5 flex gap-1 items-center">
            <Clock size={18} /> Время приезда
          </label>
          <Input
            type="time"
            value={arrivalTime}
            onChange={e => setArrivalTime(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-0.5 flex gap-1 items-center">
            <CreditCard size={18} /> Банковская карта
          </label>
          {cardLinked ? (
            <div className="flex items-center gap-2 text-green-700 font-medium">
              Карта привязана
            </div>
          ) : (
            <Button onClick={handleLinkCard} variant="outline" className="flex gap-1 items-center">
              <CreditCard size={16} /> Привязать карту
            </Button>
          )}
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
          className="w-full"
        >
          Выйти из аккаунта
        </Button>
      </div>
    </div>
  );
};

export default Cabinet;
