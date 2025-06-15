
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

type Props = {
  value: string; // "12:34:56"
  onChange: (v: string) => void;
};

const ClockField: React.FC<Props> = ({ value, onChange }) => {
  const [running, setRunning] = useState(true);
  const [clock, setClock] = useState<Date>(() => {
    const parsed = parseTimeString(value);
    return parsed || new Date();
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(toTimeStr(clock));

  const base = useRef<Date>(new Date(clock));
  const startedAt = useRef<number>(Date.now());

  // Синхронизация внутреннего значения при изменении value из пропсов
  useEffect(() => {
    const parsed = parseTimeString(value);
    if (parsed) {
      setClock(parsed);
      base.current = new Date(parsed);
      startedAt.current = Date.now();
      setEditValue(toTimeStr(parsed));
    }
    // eslint-disable-next-line
  }, [value]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      const now = Date.now();
      const delta = Math.floor((now - startedAt.current) / 1000);
      const newDate = new Date(base.current);
      newDate.setSeconds(newDate.getSeconds() + delta);
      setClock(newDate);
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  // Кнопка (с иконкой Clock) переводит поле в режим ручного редактирования
  const handleStartEditing = () => {
    setIsEditing(true);
    setRunning(false);
    setEditValue(toTimeStr(clock));
  };

  // Обработка ручного ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  // Подтверждаем время, выходим из режима редактирования и снова включаем ход времени
  const handleManualSet = () => {
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(editValue)) {
      let valueToSet = editValue.length === 5 ? editValue + ":00" : editValue;
      const parsed = parseTimeString(valueToSet);
      if (parsed) {
        setClock(parsed);
        base.current = new Date(parsed);
        startedAt.current = Date.now();
        onChange(valueToSet);
        setIsEditing(false);
        setRunning(true);
      }
    }
  };

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
        value={isEditing ? editValue : toTimeStr(clock)}
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

