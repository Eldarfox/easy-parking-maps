import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, User, LogIn } from "lucide-react";
import ClockField from "@/components/ClockField";
import { useToast } from "@/components/ui/use-toast";
import LinkCardModal from "@/components/LinkCardModal";
import CardVisualization from "@/components/CardVisualization";

// Вспомогательная функция для проверки авторизации
function checkAuth() {
  return localStorage.getItem("auth_user") === "true";
}

const TIME_KEY = "cabinet_sim_time";

const Cabinet = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [name, setName] = useState("");
  const [cardLinked, setCardLinked] = useState(false);
  const [simTime, setSimTime] = useState(() => {
    return localStorage.getItem(TIME_KEY) || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  });
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [cardNum, setCardNum] = useState(""); // Для хранения номера карты
  const { toast } = useToast();

  useEffect(() => {
    setIsAuth(checkAuth());
    setName(localStorage.getItem("cabinet_name") || "");
    setCardLinked(localStorage.getItem("cabinet_card") === "linked");
    setSimTime(
      localStorage.getItem(TIME_KEY) ||
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
    );
    setCardNum(localStorage.getItem("cabinet_card_number") || ""); // загрузка номера
  }, []);

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

  function saveProfileData() {
    if (!cardLinked) {
      toast({
        title: "Сначала привяжите карту",
        description: "Чтобы сохранить данные профиля и пользоваться кабинетом, необходимо привязать банковскую карту.",
      });
      return;
    }
    localStorage.setItem("cabinet_name", name);
    localStorage.setItem(TIME_KEY, simTime);
  }

  function handleSetTime(val: string) {
    setSimTime(val);
    localStorage.setItem(TIME_KEY, val);
  }

  function handleCardLinked(cardNumber: string) {
    setCardLinked(true);
    localStorage.setItem("cabinet_card", "linked");
    localStorage.setItem("cabinet_card_number", cardNumber); // сохраняем номер
    setCardNum(cardNumber);
    toast({
      title: "Карта привязана!",
      description: "Теперь профиль разблокирован.",
      duration: 2000,
    });
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
            disabled={!cardLinked}
          />
        </div>
        <div>
          <label className="block font-semibold mb-0.5 flex gap-1 items-center">
            🕒 Текущее время (можно менять)
          </label>
          <ClockField value={simTime} onChange={handleSetTime} /* убрал disabled - ClockField его не принимает */ />
          <p className="text-xs text-muted-foreground mt-1">
            Время «течёт» дальше, после изменения.
          </p>
        </div>
        <div>
          <label className="block font-semibold mb-0.5 flex gap-1 items-center">
            <CreditCard size={18} /> Банковская карта
          </label>
          {cardLinked ? (
            <>
              <CardVisualization cardNumber={cardNum} />
              <div className="flex items-center gap-2 text-green-700 font-medium">
                Карта привязана
              </div>
            </>
          ) : (
            <>
              <Button
                onClick={() => setLinkModalOpen(true)}
                variant="outline"
                className="flex gap-1 items-center"
              >
                <CreditCard size={16} /> Привязать карту
              </Button>
              <LinkCardModal
                open={linkModalOpen}
                onOpenChange={setLinkModalOpen}
                onSuccess={(num?: string) => handleCardLinked(num || "")}
              />
            </>
          )}
        </div>
        <Button
          onClick={saveProfileData}
          variant="default"
          className="w-full mt-2"
          disabled={!cardLinked}
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
        {!cardLinked && (
          <div className="mt-3 text-red-500 text-center text-sm">
            Для доступа к функциям кабинета сначала привяжите банковскую карту.
          </div>
        )}
      </div>
    </div>
  );
};

export default Cabinet;
