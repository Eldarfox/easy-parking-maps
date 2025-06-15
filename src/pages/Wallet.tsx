
import { CreditCard, ArrowRight, Plus, Wallet as WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import CardSection from "@/components/CardSection";
import PartnerBanner from "@/components/PartnerBanner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

const quickTopUps = [500, 1000, 2000, 5000];

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [cardLinked, setCardLinked] = useState(false);

  const [cardNum, setCardNum] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExp, setCardExp] = useState("");
  const { toast } = useToast();

  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);

  useEffect(() => {
    const isLinked = localStorage.getItem("cabinet_card") === "linked";
    setCardLinked(isLinked);
    setCardNum(localStorage.getItem("cabinet_card_number") || "");
    setCardHolder(localStorage.getItem("cabinet_card_holder") || "");
    setCardExp(localStorage.getItem("cabinet_card_exp") || "");
  }, []);

  const handleTopUp = (amount: number) => {
    setBalance((prev) => prev + amount);
  };

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

  const handleUnlinkCard = () => {
    setUnlinkDialogOpen(true);
  };

  const confirmUnlinkCard = () => {
    setCardLinked(false);
    setCardNum("");
    setCardHolder("");
    setCardExp("");
    localStorage.removeItem("cabinet_card");
    localStorage.removeItem("cabinet_card_number");
    localStorage.removeItem("cabinet_card_holder");
    localStorage.removeItem("cabinet_card_exp");
    setUnlinkDialogOpen(false);
    toast({
      title: "Карта отвязана",
      description: "Банковская карта успешно отвязана.",
      duration: 2000,
    });
  };

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6 pt-8 px-2 pb-32">
      <h1 className="text-2xl font-bold">Мой кошелек</h1>

      {/* Доступный баланс */}
      <div className="rounded-2xl p-5 pb-6 shadow-xl relative overflow-hidden flex flex-col gap-3 bg-white">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-gray-700 font-semibold text-lg">
            <CreditCard size={22} className="opacity-80" />
            Доступный баланс
          </div>
          <WalletIcon className="text-gray-400 opacity-70" size={22} />
        </div>
        <div className="text-4xl font-bold text-black leading-snug">
          {balance.toLocaleString()}{" "}
          <span className="text-3xl font-semibold">сом</span>
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

      {/* Банковская карта — отдельный блок */}
      <div className="bg-white rounded-2xl shadow-xl px-4 py-5">
        <CardSection
          cardLinked={cardLinked}
          cardNum={cardNum}
          cardHolder={cardHolder}
          cardExp={cardExp}
          onUnlinkCard={handleUnlinkCard}
        />
      </div>

      {/* Модалка подтверждения отвязки карты */}
      <Dialog open={unlinkDialogOpen} onOpenChange={setUnlinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отвязать банковскую карту?</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите отвязать карту? Данные сохраняться не будут.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="destructive" onClick={confirmUnlinkCard}>
              Отвязать
            </Button>
            <DialogClose asChild>
              <Button variant="secondary">Отмена</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Партнёрский баннер — отдельный блок */}
      <div className="bg-yellow-100 rounded-2xl shadow-xl px-4 py-4">
        <PartnerBanner />
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
