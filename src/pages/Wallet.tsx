
import { CreditCard, Plus, Wallet as WalletIcon, History, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
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
import LinkCardModal from "@/components/LinkCardModal";

const quickTopUps = [500, 1000, 2000, 5000];

const WALLET_BALANCE_KEY = "cabinet_wallet_balance";

const Wallet = () => {
  // --- баланс теперь синхронизирован с localStorage ---
  const [balance, setBalance] = useState(2450);
  const [cardLinked, setCardLinked] = useState(false);

  const [cardNum, setCardNum] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExp, setCardExp] = useState("");
  const { toast } = useToast();

  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [linkCardModalOpen, setLinkCardModalOpen] = useState(false);

  const [topupModalOpen, setTopupModalOpen] = useState(false);

  // --- Хука для баланса ---
  useEffect(() => {
    // баланс кошелька всегда берём из localStorage, или дефолт
    const bal = localStorage.getItem(WALLET_BALANCE_KEY);
    setBalance(bal ? parseInt(bal) : 2450);

    const isLinked = localStorage.getItem("cabinet_card") === "linked";
    setCardLinked(isLinked);
    setCardNum(localStorage.getItem("cabinet_card_number") || "");
    setCardHolder(localStorage.getItem("cabinet_card_holder") || "");
    setCardExp(localStorage.getItem("cabinet_card_exp") || "");

    // подписываемся на внешние изменения баланса
    const onStorage = (e: StorageEvent) => {
      if (e.key === WALLET_BALANCE_KEY) {
        setBalance(e.newValue ? parseInt(e.newValue) : 0);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // --- обновляем баланс в LS и стейте
  const updateBalance = (fn: (old: number) => number) => {
    setBalance((prev) => {
      const next = fn(prev);
      localStorage.setItem(WALLET_BALANCE_KEY, next.toString());
      return next;
    });
  };

  const handleTopUp = (amount: number) => {
    updateBalance((prev) => prev + amount);
  };

  const handleCustomTopUp = () => {
    setTopupModalOpen(true);
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

  const handleTransactionHistory = () => {
    toast({
      title: "Скоро появится",
      description: "История транзакций будет доступна в ближайшем обновлении.",
    });
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

  // Функция для обработки выбора способа пополнения
  const handleTopupProvider = (provider: string) => {
    setTopupModalOpen(false);
    toast({
      title: "Вы выбрали:",
      description: provider,
      duration: 2000,
    });
  };

  // Функция для обработки успеха привязки карты
  const handleLinkCardSuccess = (data: { cardNumber: string; holder: string; exp: string }) => {
    setCardLinked(true);
    setCardNum(data.cardNumber);
    setCardHolder(data.holder);
    setCardExp(data.exp);

    localStorage.setItem("cabinet_card", "linked");
    localStorage.setItem("cabinet_card_number", data.cardNumber);
    localStorage.setItem("cabinet_card_holder", data.holder);
    localStorage.setItem("cabinet_card_exp", data.exp);

    toast({
      title: "Карта привязана",
      description: "Банковская карта успешно привязана.",
      duration: 2000,
    });
  };

  // Изменённый обработчик для кнопки "Добавить карту"
  const handleAddCardClick = () => {
    if (cardLinked) {
      toast({
        title: "Карта уже привязана",
        description: "У вас уже привязана банковская карта.",
        duration: 1800,
      });
      return;
    }
    setLinkCardModalOpen(true);
  };

  return (
    <div className="max-w-md mx-auto flex flex-col gap-7 pt-8 px-2 pb-32">
      {/* Заголовок и подзаголовок */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-black/90">Кошелек</h1>
        <div className="text-base text-gray-500 font-medium mt-1">Управляйте своими финансами</div>
      </div>

      {/* Баланс с градиентом */}
      <div className="wallet-card-gradient">
        <div className="flex items-center justify-between">
          <span className="wallet-balance-label">
            <CreditCard size={22} className="opacity-90" /> Баланс
          </span>
          <WalletIcon className="opacity-70" size={22} />
        </div>
        <div className="wallet-balance-value">
          {balance.toLocaleString()}{" "}
          <span className="wallet-balance-currency">⃀</span>
        </div>
        <div className="text-base text-white/70 mb-1">Доступно для использования</div>

        <div className="flex gap-3 mt-2">
          <button className="btn-wallet-gradient flex items-center gap-2 flex-1" onClick={handleCustomTopUp}>
            <Plus size={20} /> Пополнить
          </button>
          {/* Заменяем кнопку "Перевести" на "Добавить карту" */}
          <button className="btn-wallet-outline flex items-center gap-2 flex-1" onClick={handleAddCardClick}>
            <CreditCard size={20} /> Добавить карту
          </button>
        </div>
      </div>

      {/* Банковская карта */}
      <div>
        <CardSection
          cardLinked={cardLinked}
          cardNum={cardNum}
          cardHolder={cardHolder}
          cardExp={cardExp}
          onUnlinkCard={handleUnlinkCard}
        />
      </div>

      {/* Модалка привязки карты */}
      <LinkCardModal
        open={linkCardModalOpen}
        onOpenChange={setLinkCardModalOpen}
        onSuccess={handleLinkCardSuccess}
      />

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

      {/* Модалка выбора способа пополнения */}
      <Dialog open={topupModalOpen} onOpenChange={setTopupModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Выберите способ пополнения</DialogTitle>
            <DialogDescription>Через какую систему вы хотите пополнить баланс?</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => handleTopupProvider("Мбанк")}
            >
              <span className="font-medium text-base">МБанк</span>
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => handleTopupProvider("О!деньги")}
            >
              <span className="font-medium text-base">О! Деньги</span>
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => handleTopupProvider("Оптима")}
            >
              <span className="font-medium text-base">Оптима Банк</span>
            </Button>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" className="w-full">Отмена</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Быстрое пополнение */}
      <div className="quick-topup-card">
        <div className="font-bold text-lg text-black/80">Быстрое пополнение</div>
        <div className="grid grid-cols-2 gap-3 mt-1.5">
          {quickTopUps.map((amount) => (
            <button
              key={amount}
              className="quick-topup-btn"
              onClick={() => handleQuickTopUp(amount)}
            >
              {amount.toLocaleString()} <span className="ml-1 text-base">⃀</span>
            </button>
          ))}
        </div>
      </div>

      {/* Partner banner */}
      <div className="bg-blue-50 rounded-2xl shadow px-4 py-4">
        <PartnerBanner />
      </div>
    </div>
  );
};

export default Wallet;

// ... (file end)
