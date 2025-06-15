
import React from "react";

interface CardVisualizationProps {
  cardNumber: string;
  holder?: string;
  exp?: string;
  background?: "gradient" | "default";
  scheme?: "visa" | "default";
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
}) => (
  <div
    className={`relative flex flex-col justify-between rounded-xl px-6 py-5 shadow-lg text-white w-full max-w-xs h-36 my-1 transition-all
      ${background === "gradient"
        ? "bg-gradient-to-br from-violet-500 via-indigo-400 to-orange-400"
        : "bg-gradient-to-tr from-indigo-600 to-violet-500"
      }`}
    style={{ minWidth: 290, minHeight: 140 }}
  >
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
