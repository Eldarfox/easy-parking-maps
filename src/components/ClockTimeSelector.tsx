
import React from "react";

type ClockTimeSelectorProps = {
  value: [number, number] | null;
  onChange: (val: [number, number] | null) => void;
  disabledHours?: number[];
  hours?: number[]; // список отображаемых часов
  nightMode?: boolean; // если true -- вообще без локального state/hook
};

export const hourToDeg = (hour: number, first: number, last: number) => {
  const range = ((last - first + 24) % 24) + 1;
  let idx = ((hour - first + 24) % 24);
  return (idx / range) * 360;
};

const RADIUS = 80;
const CENTER = 100;

function isDisabled(hour: number, disabledHours?: number[]) {
  return disabledHours?.includes(hour);
}

const getLabel = (h: number) => h.toString().padStart(2, "0");

function getDisplayedHours(hours?: number[]) {
  if (hours && hours.length > 0) return hours;
  return Array.from({ length: 16 }, (_, i) => i + 8); // [8,23]
}

// Без хуков: только через props.value/props.onChange
const ClockTimeSelector: React.FC<ClockTimeSelectorProps> = ({
  value,
  onChange,
  disabledHours = [],
  hours,
  nightMode = false,
}) => {
  const displayedHours = getDisplayedHours(hours);
  const firstH = displayedHours[0];
  const lastH = displayedHours[displayedHours.length - 1];

  // Без локального состояния, весь selection читается из props.value
  function getHandlePos(hour: number) {
    const deg = hourToDeg(hour, firstH, lastH) - 90;
    const rad = (deg * Math.PI) / 180;
    return {
      x: CENTER + RADIUS * Math.cos(rad),
      y: CENTER + RADIUS * Math.sin(rad),
    };
  }

  // В режиме nightMode диапазон выбирается за один проход (первый и второй клик)
  function selectHour(hour: number) {
    if (isDisabled(hour, disabledHours)) return;
    if (!value || value[0] === null || (value && value[0] !== null && value[1] !== null)) {
      // Первый клик
      onChange([hour, null]);
    } else if (value && value[0] !== null && value[1] === null) {
      const newStart = value[0];
      const newEnd = hour;
      if (newStart === newEnd) {
        // Клик по той же: сброс
        onChange(null);
        return;
      }
      // Всегда в пределах displayedHours
      const idxStart = displayedHours.indexOf(newStart);
      const idxEnd = displayedHours.indexOf(newEnd);
      if (idxStart === -1 || idxEnd === -1) return;
      const realStart = Math.min(idxStart, idxEnd);
      const realEnd = Math.max(idxStart, idxEnd);
      const selHours = displayedHours.slice(realStart, realEnd + 1);
      // Нет disabled
      if (selHours.some(h => isDisabled(h, disabledHours))) return;
      onChange([displayedHours[realStart], displayedHours[realEnd]]);
    }
  }

  // Рендер компонента -- только на propах
  const selection = value ?? [null, null];
  const showInterval = selection[0] !== null && selection[1] !== null && selection[1]! > selection[0]!;

  return (
    <div className="flex flex-col items-center">
      <svg
        id="clock-selector-svg"
        width={200}
        height={200}
        viewBox="0 0 200 200"
        style={{ touchAction: "none" }}
      >
        {/* Основа круга */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#f1f5f9" />
        {/* Серые секторы для занятых часов */}
        {displayedHours.map((h) =>
          isDisabled(h, disabledHours) ? (
            <path
              key={`sect-${h}`}
              d={describeArc(
                CENTER,
                CENTER,
                RADIUS,
                hourToDeg(h, firstH, lastH),
                hourToDeg(h + 1 > 23 ? firstH : h + 1, firstH, lastH)
              )}
              fill="rgba(150,150,150,0.5)"
            />
          ) : null
        )}
        {/* Секторы выбранного интервала */}
        {showInterval && (
          <path
            d={describeArc(
              CENTER,
              CENTER,
              RADIUS,
              hourToDeg(selection[0]!, firstH, lastH),
              hourToDeg(selection[1]! + 1 > 23 ? firstH : selection[1]! + 1, firstH, lastH)
            )}
            fill="rgba(59,130,246,0.18)"
          />
        )}
        {/* Часовые отметки и кликабельные зоны */}
        {displayedHours.map((h) => {
          const { x, y } = getHandlePos(h);
          const isSelected =
            showInterval && h >= selection[0]! && h <= selection[1]!;
          return (
            <g key={h}>
              <circle
                cx={x}
                cy={y}
                r={17}
                fill={isDisabled(h, disabledHours) ? "#cbd5e1" : "#fff"}
                stroke={
                  isSelected ? "#2563eb" : "#e2e8f0"
                }
                strokeWidth={2}
                className={
                  isDisabled(h, disabledHours)
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }
                onClick={() => selectHour(h)}
              />
              <text
                x={x}
                y={y + 5}
                fontSize={15}
                textAnchor="middle"
                fill={isDisabled(h, disabledHours) ? "#6b7280" : "#0f172a"}
                style={{ userSelect: "none", pointerEvents: "none" }}
              >
                {getLabel(h)}
              </text>
              {/* Маркеры выбранного начала/конца */}
              {selection[0] === h && (
                <circle cx={x} cy={y} r={7} fill="#2563eb" opacity={0.65} />
              )}
              {selection[1] === h && selection[0] !== null && selection[1] !== selection[0] && (
                <circle cx={x} cy={y} r={7} fill="#1d4ed8" opacity={0.65} />
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 text-sm">
        {showInterval
          ? `${getLabel(selection[0]!)} - ${getLabel(selection[1]! + 1)}`
          : selection[0] !== null
          ? `Начало: ${getLabel(selection[0]!)}`
          : "Выберите время"}
      </div>
    </div>
  );
};

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);

  var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
    "L", x, y,
    "Z"
  ].join(" ");
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

export default ClockTimeSelector;

