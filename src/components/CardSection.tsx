
import React from "react";
import CardVisualization from "./CardVisualization";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CardSectionProps {
  cardLinked: boolean;
  cardNum: string;
  cardHolder: string;
  cardExp: string;
  onUnlinkCard?: () => void;
}

const CardSection: React.FC<CardSectionProps> = ({
  cardLinked,
  cardNum,
  cardHolder,
  cardExp,
  onUnlinkCard,
}) => {
  if (!cardLinked) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-6">
        <p className="text-gray-500 text-sm text-center">Банковская карта не привязана</p>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center relative">
      <div className="w-full">
        {/* Крестик в правом верхнем углу */}
        {onUnlinkCard && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Отвязать карту"
            className="absolute -right-2 -top-2 z-20 rounded-full p-1 bg-white shadow hover:bg-red-50 border border-gray-200"
            onClick={onUnlinkCard}
          >
            <X className="text-red-500" size={20} />
          </Button>
        )}
        <CardVisualization
          cardNumber={cardNum}
          holder={cardHolder}
          exp={cardExp}
          background="orange"
          scheme="visa"
        />
      </div>
    </div>
  );
};

export default CardSection;
