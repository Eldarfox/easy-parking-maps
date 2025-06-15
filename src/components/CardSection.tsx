
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
    <div className="relative w-full flex justify-center">
      {/* Крест — теперь просто серый, без подложки */}
      {onUnlinkCard && (
        <button
          type="button"
          aria-label="Отвязать карту"
          className="absolute right-0 -top-3 z-20 p-0 m-0 border-none bg-transparent hover:text-gray-500 transition-colors"
          onClick={onUnlinkCard}
        >
          <X className="text-gray-400" size={22} />
        </button>
      )}
      <CardVisualization
        cardNumber={cardNum}
        holder={cardHolder}
        exp={cardExp}
        background="gradient"
        scheme="visa"
      />
    </div>
  );
};

export default CardSection;
