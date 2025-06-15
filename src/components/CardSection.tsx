
import React from "react";
import CardVisualization from "./CardVisualization";

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
        <p className="text-gray-500 text-sm text-center">
          Банковская карта не привязана
        </p>
      </div>
    );
  }

  return (
    <CardVisualization
      cardNumber={cardNum}
      holder={cardHolder}
      exp={cardExp}
      background="gradient"
      scheme="visa"
      onUnlinkCard={onUnlinkCard}
    />
  );
};

export default CardSection;
