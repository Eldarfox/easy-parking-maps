
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Wallet } from "lucide-react";

const hotbarButtons = [
  {
    label: "Кабинет",
    icon: Wallet,
    route: "/cabinet",
  },
  {
    label: "Тарифы",
    icon: Wallet,
    route: "/tariffs",
  },
  {
    label: "Кошелек",
    icon: Wallet,
    route: "/wallet",
  }
];

function LucideIcon({icon: Icon, ...props}: {icon: any, size?: number, color?: string}) {
  return <Icon size={26} strokeWidth={2} color={props.color || "currentColor"} />;
}

const BottomBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 bg-white border-t shadow-lg flex justify-around items-center py-2 md:py-3 px-4 md:px-12 rounded-t-xl
      backdrop-blur-md bg-white/90
      ">
      {hotbarButtons.map(btn => {
        const isActive = location.pathname === btn.route;
        return (
          <button
            key={btn.label}
            className={`flex flex-col items-center justify-end gap-1 px-2 group transition ${isActive ? "font-bold text-blue-700" : ""}`}
            onClick={() => navigate(btn.route)}
          >
            <span className={`rounded-full ${isActive ? "bg-blue-200" : "bg-blue-50"} group-hover:bg-blue-100 p-2 mb-1 transition`}>
              <LucideIcon icon={btn.icon} color={isActive ? "#1d4ed8" : undefined} />
            </span>
            <span className={`text-xs font-medium group-hover:text-blue-700 transition ${isActive ? "text-blue-700" : "text-gray-700"}`}>
              {btn.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomBar;
