
import { CreditCard, ArrowRight, Plus, Wallet as WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import CardVisualization from "@/components/CardVisualization";

const quickTopUps = [500, 1000, 2000, 5000];

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [cardLinked, setCardLinked] = useState(false);
  const { toast } = useToast();

  // Данные карты
  const [cardNum, setCardNum] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExp, setCardExp] = useState("");

  useEffect(() => {
    // Определяем привязана ли карта
    const isLinked = localStorage.getItem("cabinet_card") === "linked";
    setCardLinked(isLinked);

    setCardNum(localStorage.getItem("cabinet_card_number") || "");
    setCardHolder(localStorage.getItem("cabinet_card_holder") || "");
    setCardExp(localStorage.getItem("cabinet_card_exp") || "");
  }, []);

  // Функция для пополнения баланса на указанную сумму
  const handleTopUp = (amount: number) => {
    setBalance((prev) => prev + amount);
  };

  // Открыть модалку или форму для произвольного пополнения, пример простого пополнения на 1000
  const handleCustomTopUp = () => {
    if (!cardLinked) {
      toast({
        title: "Привяжите карту",
        description: "Для пополнения необходимо привязать карту.",
      });
      return;
    }
    handleTopUp(1000);
  };

  // Обработчик быстрого пополнения с учетом состояния карты
  const handleQuickTopUp = (amount: number) => {
    if (cardLinked) {
      handleTopUp(amount);
    } else {
      toast({
        title: "Привяжите карту",
        description: "Для быстрого пополнения необходимо привязать карту.",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6 pt-8 px-2 pb-32">
      <h1 className="text-2xl font-bold">Мой кошелек</h1>
      {/* Баланс карточка */}
      <div className="rounded-2xl p-5 pb-6 shadow-xl relative overflow-hidden flex flex-col gap-3 bg-white">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-gray-700 font-semibold text-lg">
            <CreditCard size={22} className="opacity-80" />
            Доступный баланс
          </div>
          <WalletIcon className="text-gray-400 opacity-70" size={22} />
        </div>
        <div className="text-4xl font-bold text-black leading-snug">
          {balance.toLocaleString()} <span className="text-3xl font-semibold">сом</span>
        </div>
        {/* Карта под балансом — по примеру */}
        {cardLinked && (
          <div className="w-full flex justify-center my-2">
            <div className="w-full">
              <CardVisualization
                cardNumber={cardNum}
                holder={cardHolder}
                exp={cardExp}
                background="orange"
                scheme="visa"
              />
            </div>
          </div>
        )}
        {/* Info banner (заглушка, без функциональности) */}
        <div className="mt-2 mb-2 rounded-lg bg-yellow-200 flex items-center px-3 py-2 gap-3">
          <img src="/lovable-uploads/4975540c-677d-41a1-ac37-4ae0135c9ed7.png" alt="" className="w-10 h-10 rounded-md object-cover" />
          <div className="text-yellow-900 text-sm font-medium flex-1">
            Хотите стать нашим партнером? <br />
            <span className="text-xs font-normal">Начни зарабатывать прямо сейчас</span>
          </div>
        </div>
        <div className="flex gap-3 mt-2 flex-col xs:flex-row">
          <Button
            variant="secondary"
            className="bg-white/80 hover:bg-white text-violet-700 font-bold flex items-center gap-2 flex-1"
            onClick={handleCustomTopUp}
          >
            <Plus size={18} /> Пополнить
          </Button>
          <Button
            variant="ghost"
            className="bg-white/20 hover:bg-white/40 text-violet-700 font-bold flex items-center gap-2 flex-1 border-none"
          >
            <ArrowRight size={18} /> Перевести
          </Button>
        </div>
      </div>
      {/* Быстрое пополнение */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-4">
        <div className="font-bold text-lg">Быстрое пополнение</div>
        <div className="grid grid-cols-2 gap-3">
          {quickTopUps.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              className="text-lg font-semibold py-4"
              onClick={() => handleQuickTopUp(amount)}
            >
              {amount.toLocaleString()} <span className="ml-1 text-base">сом</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
