
import { useState, useEffect } from "react";

// Те же утилиты, что и в ClockField
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

function restoreClockStateFromLS(lsKey: string): { base: string | null; startedAt: number | null } {
  const base = localStorage.getItem(lsKey + "_base");
  const startedAt = localStorage.getItem(lsKey + "_startedAt");
  return {
    base,
    startedAt: startedAt ? Number(startedAt) : null,
  };
}

/**
 * Хук для получения текущего "виртуального" времени приложения.
 * Возвращает Date виртуального now, а также строку в формате "YYYY-MM-DD HH:mm:ss"
 */
export function useVirtualNow(lsKey = "mainClock") {
  const [now, setNow] = useState<Date>(() => {
    // При маунте высчитываем виртуальное время
    const { base, startedAt } = restoreClockStateFromLS(lsKey);
    if (base && startedAt) {
      const parsed = parseDateTimeString(base);
      if (parsed) {
        const delta = Math.floor((Date.now() - startedAt) / 1000);
        return new Date(parsed.getTime() + delta * 1000);
      }
    }
    return new Date();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const { base, startedAt } = restoreClockStateFromLS(lsKey);
      if (base && startedAt) {
        const parsed = parseDateTimeString(base);
        if (parsed) {
          const delta = Math.floor((Date.now() - startedAt) / 1000);
          setNow(new Date(parsed.getTime() + delta * 1000));
          return;
        }
      }
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [lsKey]);

  return now;
}
