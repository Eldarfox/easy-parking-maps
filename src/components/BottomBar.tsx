
import React from "react";
import { wallet } from "lucide-react";

const hotbarButtons = [
  {
    label: "Кабинет",
    icon: wallet,
    onClick: () => console.log("Переход в кабинет"),
  },
  {
    label: "Тарифы",
    icon: wallet,
    onClick: () => console.log("Переход к тарифам"),
  },
  {
    label: "Кошелек",
    icon: wallet,
    onClick: () => console.log("Переход в кошелек"),
  }
];

// Простой generic компонент для lucide icon
function LucideIcon({icon: Icon, ...props}: {icon: any, size?: number, color?: string}) {
  return <Icon size={26} strokeWidth={2} color={props.color || "currentColor"} />;
}

const BottomBar: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 bg-white border-t shadow-lg flex justify-around items-center py-2 md:py-3 px-4 md:px-12 rounded-t-xl
      backdrop-blur-md bg-white/90
      ">
      {hotbarButtons.map(btn => (
        <button
          key={btn.label}
          className="flex flex-col items-center justify-end gap-1 px-2 group transition"
          onClick={btn.onClick}
        >
          <span className="rounded-full bg-blue-50 group-hover:bg-blue-100 p-2 mb-1 transition">
            <LucideIcon icon={btn.icon} />
          </span>
          <span className="text-xs text-gray-700 font-medium group-hover:text-blue-700 transition">
            {btn.label}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default BottomBar;
