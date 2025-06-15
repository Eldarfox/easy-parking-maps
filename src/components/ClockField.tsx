
import React, { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

function pad(num: number, len = 2) {
  return num.toString().padStart(len, "0");
}

function toTimeStr(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function parseTimeString(str: string): Date | null {
  const parts = str.split(":").map(Number);
  if (parts.length < 2 || parts.some(isNaN)) return null;
  const [h, m, s = 0] = parts;
  if (h < 0 || h > 23 || m < 0 || m > 59 || s < 0 || s > 59) return null;
  const now = new Date();
  now.setHours(h, m, s, 0);
  return now;
}

// Для хранения в localStorage
function saveClockStateToLS(lsKey: string, baseTime: string, startedAt: number) {
  localStorage.setItem(lsKey + "_base", baseTime);
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
  value: string; // "12:34:56"
  onChange: (v: string) => void;
  lsKey?: string; // уникальный ключ для ls (по-умолчанию "mainClock")
};

const ClockField: React.FC<Props> = ({ value, onChange, lsKey = "mainClock" }) => {
  // Стейт редактирования
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  // Таймер обновления UI (для tикания)
  const [, forceTick] = useState(0);

  // Смотрим на данные в localStorage при маунте и изменении value
  useEffect(() => {
    // Показывать всегда актуальное
    setEditValue(value);
  }, [value]);

  // Основная функция вычисления текущего времени (на лету!)
  function getVirtualNow(): Date {
    const { base, startedAt } = restoreClockStateFromLS(lsKey);
    let show: Date;
    if (base && startedAt) {
      const parsed = parseTimeString(base);
      if (parsed) {
        const delta = Math.floor((Date.now() - startedAt) / 1000);
        show = new Date(parsed);
        show.setSeconds(show.getSeconds() + delta);
        return show;
      }
    }
    // Default fallbacks - на случай сбоя
    const fallback = parseTimeString(value) || new Date();
    return fallback;
  }

  // Для input
  const [inputVal, setInputVal] = useState(value);

  // Ставим регулярное обновление визуала только если не редактируем
  useEffect(() => {
    if (isEditing) return;
    const timer = setInterval(() => {
      forceTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line
  }, [isEditing]);

  // Не даём ClockField самому рассинхронизироваться с value
  useEffect(() => {
    setInputVal(value);
  }, [value]);

  // При старт редактирования
  const handleStartEditing = () => {
    setIsEditing(true);
    setEditValue(toTimeStr(getVirtualNow()));
  };

  // Ввод вручную
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  // Подтвердить новое время.
  const handleManualSet = () => {
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(editValue)) {
      let valueToSet = editValue.length === 5 ? editValue + ":00" : editValue;
      const parsed = parseTimeString(valueToSet);
      if (parsed) {
        // Время выбранное пользователем → baseTime
        const baseTimeStr = toTimeStr(parsed);
        const startedAt = Date.now();
        // Сохраняем значения, чтобы любое открытие страницы считало корректно
        saveClockStateToLS(lsKey, baseTimeStr, startedAt);
        // Вызываем внешний onChange (если надо)
        onChange(baseTimeStr);
        setIsEditing(false);
        setInputVal(baseTimeStr);
      }
    }
  };

  // При маунте: если найдено в LS - синхронизируем
  useEffect(() => {
    const { base, startedAt } = restoreClockStateFromLS(lsKey);
    if (base && startedAt) {
      // Просто обновляем value в App через onChange
      // (чтобы прокинулось наверх, если вдруг LS сбросился)
      onChange(base);
    }
    // eslint-disable-next-line
  }, []);

  // Показываем визуал: если не редактируем - вычисляем виртуальное 'текущее время', иначе показываем editValue
  const display = isEditing ? editValue : toTimeStr(getVirtualNow());

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={
          "p-1 rounded border bg-blue-50 hover:bg-blue-100 transition-colors" +
          (isEditing ? " border-blue-500" : " border-blue-300")
        }
        aria-label="Редактировать часы"
        onClick={handleStartEditing}
        tabIndex={0}
        title="Остановить и редактировать время"
      >
        <Clock className={isEditing ? "text-blue-700" : "text-blue-500"} size={22} />
      </button>
      <input
        type="text"
        pattern="\d{2}:\d{2}(:\d{2})?"
        maxLength={8}
        value={display}
        onChange={handleInputChange}
        className={
          "text-2xl font-mono w-[120px] px-2 py-1 border rounded bg-white" +
          (isEditing ? " border-blue-500 ring-2 ring-blue-200" : "")
        }
        aria-label="Редактируемые часы"
        readOnly={!isEditing}
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

