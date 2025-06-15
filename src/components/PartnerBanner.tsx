
import React from "react";
import { Banknote } from "lucide-react";

const PartnerBanner: React.FC = () => (
  <div className="flex items-center px-3 py-2 gap-3">
    <div className="flex items-center justify-center bg-yellow-300 p-2 rounded-md">
      <Banknote className="w-8 h-8 text-yellow-900" />
    </div>
    <div className="text-yellow-900 text-sm font-medium flex-1">
      Хотите стать нашим партнером? <br />
      <span className="text-xs font-normal">Начните зарабатывать прямо сейчас!</span>
    </div>
  </div>
);

export default PartnerBanner;
