
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LinkCardModalProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  // теперь onSuccess получает объект с данными
  onSuccess: (data: { cardNumber: string; holder: string; exp: string }) => void;
}

const LinkCardModal: React.FC<LinkCardModalProps> = ({ open, onOpenChange, onSuccess }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [holder, setHolder] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // сохраняем все в localStorage — смогут подхватить и при перезагрузке
      localStorage.setItem("cabinet_card_number", cardNumber);
      localStorage.setItem("cabinet_card_holder", holder);
      localStorage.setItem("cabinet_card_exp", exp);
      onSuccess({ cardNumber, holder, exp });
      onOpenChange(false);
      setCardNumber("");
      setHolder("");
      setExp("");
      setCvc("");
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Привязать банковскую карту</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div>
            <label className="text-sm font-medium">Номер карты</label>
            <Input
              required
              pattern="\d{16}"
              maxLength={16}
              minLength={16}
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value.replace(/\D/g, ""))}
              autoComplete="cc-number"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-sm font-medium">Держатель</label>
              <Input
                required
                placeholder="ИМЯ ФАМИЛИЯ"
                value={holder}
                onChange={e => setHolder(e.target.value.toUpperCase())}
                autoComplete="cc-name"
              />
            </div>
            <div className="w-24">
              <label className="text-sm font-medium">Срок</label>
              <Input
                required
                placeholder="MM/YY"
                maxLength={5}
                value={exp}
                onChange={e => setExp(e.target.value.replace(/[^0-9/]/g, "").replace(/^(\d{2})$/, "$1/"))}
                autoComplete="cc-exp"
              />
            </div>
            <div className="w-20">
              <label className="text-sm font-medium">CVC</label>
              <Input
                required
                pattern="\d{3,4}"
                maxLength={4}
                placeholder="CVC"
                value={cvc}
                onChange={e => setCvc(e.target.value.replace(/\D/g, ""))}
                autoComplete="cc-csc"
              />
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button type="submit" variant="default" disabled={loading || !cardNumber || !holder || !exp || !cvc}>
              {loading ? "Сохраняем..." : "Сохранить"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Отмена</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LinkCardModal;
