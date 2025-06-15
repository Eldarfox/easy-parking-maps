
import React from "react";
import CardVisualization from "./CardVisualization";

interface CardSectionProps {
  cardLinked: boolean;
  cardNum: string;
  cardHolder: string;
  cardExp: string;
}

const CardSection: React.FC<CardSectionProps> = ({
  cardLinked,
  cardNum,
  cardHolder,
  cardExp,
}) => {
  if (!cardLinked) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-6">
        <p className="text-gray-500 text-sm text-center">Банковская карта не привязана</p>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
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
  );
};

export default CardSection;
