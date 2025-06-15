import React, { useEffect, useRef, useState } from "react";

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
  const base = useRef<Date>(new Date(clock));
  const startedAt = useRef<number>(Date.now());

  // Синхронизируем внутреннее значение, если передано новое из пропсов
  useEffect(() => {
    const parsed = parseTimeString(value);
    if (parsed) {
      setClock(parsed);
      base.current = new Date(parsed);
      startedAt.current = Date.now();
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

  // Обработка ручного ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(val)) {
      onChange(val.length === 5 ? val + ":00" : val);
      setRunning(false);
    }
  };

  const handleManualSet = () => {
    onChange(toTimeStr(clock));
    setRunning(true);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        pattern="\d{2}:\d{2}(:\d{2})?"
        maxLength={8}
        value={toTimeStr(clock)}
        onChange={handleInputChange}
        className="text-2xl font-mono w-[120px] px-2 py-1 border rounded bg-white"
        aria-label="Редактируемые часы"
      />
      <button
        type="button"
        onClick={handleManualSet}
        className="text-sm px-2 py-1 bg-blue-100 rounded border border-blue-300 hover:bg-blue-200"
        tabIndex={0}
      >
        Установить
      </button>
    </div>
  );
};

export default ClockField;
