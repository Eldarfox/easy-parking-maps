
import React, { useEffect, useState } from "react";
import ClockField from "@/components/ClockField";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User, Trash2 } from "lucide-react";

const TIME_KEY = "cabinet_sim_time";

const Admin = () => {
  const [simTime, setSimTime] = useState(() => {
    return (
      localStorage.getItem(TIME_KEY) ||
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setSimTime(
      localStorage.getItem(TIME_KEY) ||
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
    );
  }, []);

  function handleSetTime(val: string) {
    setSimTime(val);
    localStorage.setItem(TIME_KEY, val);
    toast({ title: "Время обновлено", description: "Новое время сохранено", duration: 2000 });
  }

  // Новый обработчик для полного сброса localStorage
  function handleResetAll() {
    localStorage.clear();
    toast({
      title: "Все данные сброшены",
      description: "Хранилище очищено полностью",
      duration: 3000,
      variant: "destructive"
    });
    // Можно сделать перезагрузку для сброса состояния, если требуется:
    // window.location.reload();
  }

  return (
    <div className="flex flex-col items-center pt-20 px-4 max-w-md mx-auto w-full">
      <Button
        variant="outline"
        size="sm"
        className="fixed top-4 left-4 z-50 px-3 py-2 rounded-lg shadow border border-blue-200 bg-white text-blue-700 flex gap-2 items-center hover:bg-blue-100 transition"
        onClick={() => navigate("/cabinet")}
      >
        <User size={18} />
        <span className="font-semibold text-sm">В кабинет</span>
      </Button>
      <h1 className="text-2xl font-bold mb-3 flex items-center gap-2 text-blue-700">
        Админка
      </h1>
      <div className="bg-white rounded-xl w-full p-6 shadow-lg border space-y-6">
        <div>
          <label className="block font-semibold mb-0.5 flex gap-1 items-center">
            🕒 Виртуальное время (можно менять)
          </label>
          <ClockField value={simTime} onChange={handleSetTime} />
          <p className="text-xs text-muted-foreground mt-1">
            Время «течёт» дальше, после изменения.
          </p>
        </div>
        <div>
          <Button
            onClick={handleResetAll}
            variant="destructive"
            className="w-full flex gap-2 items-center mt-3"
          >
            <Trash2 size={18} />
            Сбросить всё (удалить localStorage)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
