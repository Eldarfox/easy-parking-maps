
import React from "react";
import { X } from "lucide-react";

interface CardVisualizationProps {
  cardNumber: string;
  holder?: string;
  exp?: string;
  background?: "gradient" | "default";
  scheme?: "visa" | "default";
  onUnlinkCard?: () => void;
}

// Маска для номера: только последние 4 открыты, остальное — звездочки
const maskCardNumber = (card: string) => {
  if (!card || card.length < 4) return "**** **** **** ****";
  return "**** **** **** " + card.slice(-4);
};

const CardVisualization: React.FC<CardVisualizationProps> = ({
  cardNumber,
  holder,
  exp,
  background = "gradient",
  scheme = "default",
  onUnlinkCard,
}) => (
  <div
    className={`relative flex flex-col justify-between rounded-2xl px-6 py-5 shadow-lg text-white w-full h-36 my-1 transition-all
      ${background === "gradient"
        ? "bg-gradient-to-br from-violet-500 via-indigo-400 to-orange-400"
        : "bg-gradient-to-tr from-indigo-600 to-violet-500"
      }`}
    style={{ height: 144 }}
  >
    {/* Крестик в правом верхнем углу внутри самой карты */}
    {onUnlinkCard && (
      <button
        type="button"
        aria-label="Отвязать карту"
        className="absolute right-3 top-3 z-20 p-0 m-0 border-none bg-transparent hover:text-gray-500 transition-colors"
        onClick={onUnlinkCard}
      >
        <X className="text-gray-400" size={22} />
      </button>
    )}
    {/* Логотип VISA — крупный, в правом нижнем углу */}
    {scheme === "visa" && (
      <span className="absolute right-6 bottom-5 text-white text-lg font-extrabold tracking-wide opacity-90 drop-shadow">
        VISA
      </span>
    )}
    <div className="flex flex-col gap-2 z-10 w-full">
      <div className="text-lg font-semibold tracking-widest select-none">
        {maskCardNumber(cardNumber)}
      </div>
      <div className="flex justify-between text-xs mt-2 w-full">
        <span className="opacity-90">{holder || "ДЕРЖАТЕЛЬ"}</span>
        <span className="opacity-80">{exp || "MM/YY"}</span>
      </div>
    </div>
  </div>
);

export default CardVisualization;
