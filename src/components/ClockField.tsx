
import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

// Формат даты и времени: "YYYY-MM-DD HH:mm:ss"
function pad(num: number, len = 2) {
  return num.toString().padStart(len, "0");
}

function toDateTimeStr(date: Date) {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

function parseDateTimeString(str: string): Date | null {
  // Ожидаем "YYYY-MM-DD HH:mm:ss" или "YYYY-MM-DD HH:mm" или "YYYY-MM-DD"
  try {
    if (!str) return null;
    const [datePart, timePart = "00:00:00"] = str.trim().split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    let h = 0,
      m = 0,
      s = 0;
    if (timePart) {
      const timeSplit = timePart.split(":").map(Number);
      h = timeSplit[0] ?? 0;
      m = timeSplit[1] ?? 0;
      s = timeSplit[2] ?? 0;
    }
    if (
      !year || !month || !day ||
      h < 0 || h > 23 || m < 0 || m > 59 || s < 0 || s > 59
    )
      return null;
    const d = new Date(year, month - 1, day, h, m, s, 0);
    return d;
  } catch {
    return null;
  }
}

// Для хранения в localStorage
function saveClockStateToLS(lsKey: string, base: string, startedAt: number) {
  localStorage.setItem(lsKey + "_base", base);
  localStorage.setItem(lsKey + "_startedAt", startedAt.toString());
}

function restoreClockStateFromLS(lsKey: string): { base: string | null; startedAt: number | null } {
  const base = localStorage.getItem(lsKey + "_base");
  const startedAt = localStorage.getItem(lsKey + "_startedAt");
  return {
    base,
    startedAt: startedAt ? Number(startedAt) : null,
  };
}

type Props = {
  value: string; // "YYYY-MM-DD HH:mm:ss"
  onChange: (v: string) => void;
  lsKey?: string; // уникальный ключ для ls (по-умолчанию "mainClock")
};

const ClockField: React.FC<Props> = ({ value, onChange, lsKey = "mainClock" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  // Для принудительного рендера каждую секунда
  const [, forceTick] = useState(0);

  // Смотрим на value/LS на входах
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Основная функция вычисления "виртуального" времени
  function getVirtualNow(): Date {
    const { base, startedAt } = restoreClockStateFromLS(lsKey);
    if (base && startedAt) {
      const parsed = parseDateTimeString(base);
      if (parsed) {
        const delta = Math.floor((Date.now() - startedAt) / 1000);
        const show = new Date(parsed.getTime() + delta * 1000);
        return show;
      }
    }
    return parseDateTimeString(value) || new Date();
  }

  // Только для отображения в инпуте
  const [inputVal, setInputVal] = useState(value);

  useEffect(() => { setInputVal(value); }, [value]);

  // Обновлять визуал каждую секунду когда не редактируем
  useEffect(() => {
    if (!isEditing) {
      const timer = setInterval(() => {
        forceTick(t => t + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isEditing]);

  // Старт редактирования (останавливаем "течение" времени)
  const handleStartEditing = () => {
    setIsEditing(true);
    setEditValue(toDateTimeStr(getVirtualNow()));
  };

  // Ручной редакт
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  // Установить новое значение
  const handleManualSet = () => {
    // Ожидаем формат "YYYY-MM-DD HH:mm:ss" или "YYYY-MM-DD HH:mm" или "YYYY-MM-DD"
    const cleaned = editValue.trim();
    let parsed = parseDateTimeString(cleaned);
    if (parsed) {
      const baseStr = toDateTimeStr(parsed);
      const startedAt = Date.now();
      saveClockStateToLS(lsKey, baseStr, startedAt);
      onChange(baseStr);
      setIsEditing(false);
      setInputVal(baseStr);
    } else {
      // Мини-валидация: ничего не делать если невалидно
      // Можно добавить тултип/ошибку тут если надо
    }
  };

  // При маунте: если найдено в LS - синхронизуем value через onChange
  useEffect(() => {
    const { base, startedAt } = restoreClockStateFromLS(lsKey);
    if (base && startedAt) {
      onChange(base);
    }
    // eslint-disable-next-line
  }, []);

  // Вью: если не редактируем - берём из getVirtualNow()
  const display = isEditing ? editValue : toDateTimeStr(getVirtualNow());

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={
          "p-1 rounded border bg-blue-50 hover:bg-blue-100 transition-colors" +
          (isEditing ? " border-blue-500" : " border-blue-300")
        }
        aria-label="Редактировать дату и время"
        onClick={handleStartEditing}
        tabIndex={0}
        title="Остановить и редактировать дату / время"
      >
        <Clock className={isEditing ? "text-blue-700" : "text-blue-500"} size={22} />
      </button>
      <input
        type="text"
        pattern="\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?"
        maxLength={19}
        value={display}
        onChange={handleInputChange}
        className={
          "text-2xl font-mono w-[220px] px-2 py-1 border rounded bg-white" +
          (isEditing ? " border-blue-500 ring-2 ring-blue-200" : "")
        }
        aria-label="Редактируемые дата и время"
        readOnly={!isEditing}
        placeholder="ГГГГ-MM-ДД чч:мм:сс"
      />
      <button
        type="button"
        onClick={handleManualSet}
        className={
          "text-sm px-2 py-1 rounded border " +
          (isEditing
            ? "bg-blue-600 text-white border-blue-700 hover:bg-blue-700"
            : "bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200")
        }
        tabIndex={0}
        disabled={!isEditing}
      >
        Установить
      </button>
    </div>
  );
};

export default ClockField;
