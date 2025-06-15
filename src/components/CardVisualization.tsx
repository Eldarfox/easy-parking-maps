
import React from "react";
import { CreditCard } from "lucide-react";

interface CardVisualizationProps {
  cardNumber: string;
  holder?: string;
  exp?: string;
}

const maskCardNumber = (card: string) => {
  if (!card || card.length !== 16) return "**** **** **** ****";
  return "**** **** **** " + card.slice(-4);
};

const CardVisualization: React.FC<CardVisualizationProps> = ({
  cardNumber,
  holder,
  exp,
}) => (
  <div className="relative flex items-center gap-4 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl px-5 py-4 shadow-md text-white w-full max-w-xs my-1">
    <CreditCard size={36} className="opacity-80 absolute right-4 top-4" />
    <div className="flex flex-col gap-2 z-10">
      <div className="text-lg font-semibold tracking-widest">
        {maskCardNumber(cardNumber)}
      </div>
      <div className="flex justify-between text-xs mt-0.5">
        <span>{holder || "ДЕРЖАТЕЛЬ"}</span>
        <span>{exp || "MM/YY"}</span>
      </div>
    </div>
  </div>
);

export default CardVisualization;

