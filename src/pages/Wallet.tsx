
import { CreditCard, ArrowRight, Plus, Wallet as WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

const quickTopUps = [500, 1000, 2000, 5000];

const Wallet = () => {
  const [balance, setBalance] = useState(0);

  // Функция для пополнения баланса на указанную сумму
  const handleTopUp = (amount: number) => {
    setBalance((prev) => prev + amount);
  };

  // Открыть модалку или форму для произвольного пополнения, пример простого пополнения на 1000
  const handleCustomTopUp = () => {
    handleTopUp(1000);
  };

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6 pt-8 px-2 pb-32">
      <h1 className="text-2xl font-bold">Кошелек</h1>
      <p className="text-gray-500 mb-2">Управляйте своими финансами</p>

      {/* Баланс карточка */}
      <div
        className="rounded-2xl p-5 pb-6 shadow-xl relative overflow-hidden flex flex-col gap-3"
        style={{
          background:
            "linear-gradient(135deg, #6456FF 0%, #B854E7 100%)",
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-white font-semibold text-lg">
            <CreditCard size={22} className="opacity-80" />
            Баланс
          </div>
          <WalletIcon className="text-white opacity-70" size={22} />
        </div>
        <div className="text-4xl font-bold text-white leading-snug">
          {balance.toLocaleString()} <span className="text-3xl font-semibold">⃀</span>
        </div>
        <div className="text-white text-sm opacity-90 mb-3">Доступно для использования</div>
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
            className="bg-white/20 hover:bg-white/40 text-white font-bold flex items-center gap-2 flex-1 border-none"
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
              onClick={() => handleTopUp(amount)}
            >
              {amount.toLocaleString()} <span className="ml-1 text-base">⃀</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
