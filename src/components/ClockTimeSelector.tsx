
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

function isInInterval(
  hour: number,
  start: number,
  end: number,
  displayedHours: number[]
) {
  if (start === null || end === null) return false;
  if (start === end) return hour === start;
  
  const si = displayedHours.indexOf(start);
  const ei = displayedHours.indexOf(end);
  const hi = displayedHours.indexOf(hour);
  
  if (si === -1 || ei === -1 || hi === -1) return false;
  
  if (si < ei) {
    // обычный диапазон
    return hi >= si && hi <= ei;
  } else {
    // через полночь
    return hi >= si || hi <= ei;
  }
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

  function getHandlePos(hour: number) {
    const deg = hourToDeg(hour, firstH, lastH) - 90;
    const rad = (deg * Math.PI) / 180;
    return {
      x: CENTER + RADIUS * Math.cos(rad),
      y: CENTER + RADIUS * Math.sin(rad),
    };
  }

  function selectHour(hour: number) {
    if (isDisabled(hour, disabledHours)) return;
    
    if (!value || value[0] === null || (value && value[0] !== null && value[1] !== null)) {
      // Первый клик  
      onChange([hour, null]);
    } else if (value && value[0] !== null && value[1] === null) {
      let newStart = value[0];
      let newEnd = hour;
      
      if (newStart === newEnd) {
        onChange(null);
        return;
      }
      
      if (nightMode && hours && hours.length > 0) {
        const si = hours.indexOf(newStart);
        const ei = hours.indexOf(newEnd);
        if (si === -1 || ei === -1) {
          onChange(null);
          return;
        }
        
        // Проверяем, является ли выбранный диапазон "дневным" (не через полночь)
        // Если да - меняем местами для создания ночного диапазона
        if (si < ei) {
          [newStart, newEnd] = [newEnd, newStart];
        }
      }
      
      onChange([newStart, newEnd]);
    }
  }

  const selection = value ?? [null, null];
  const [start, end] = selection;
  const showInterval = start !== null && end !== null && start !== end;

  // Правильное построение дуг для выделения
  function getArcPaths(start: number, end: number) {
    if (start === null || end === null) return [];
    const si = displayedHours.indexOf(start);
    const ei = displayedHours.indexOf(end);
    if (si === -1 || ei === -1) return [];

    if (si < ei) {
      // Обычный диапазон
      return [[start, end]];
    } else {
      // Через полночь - разбиваем на два сегмента
      return [
        [start, displayedHours[displayedHours.length - 1]],
        [displayedHours[0], end],
      ];
    }
  }

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
                hourToDeg(
                  displayedHours[
                    (displayedHours.indexOf(h) + 1) % displayedHours.length
                  ],
                  firstH,
                  lastH
                )
              )}
              fill="rgba(150,150,150,0.5)"
            />
          ) : null
        )}
        
        {/* Секторы выбранного интервала */}
        {showInterval &&
          getArcPaths(start!, end!).map(([arcStart, arcEnd], idx) => {
            // Правильно вычисляем диапазон для каждого сегмента
            const startIdx = displayedHours.indexOf(arcStart);
            const endIdx = displayedHours.indexOf(arcEnd);
            
            // Создаем массив часов для этого сегмента
            const segmentHours = [];
            if (startIdx <= endIdx) {
              for (let i = startIdx; i <= endIdx; i++) {
                segmentHours.push(displayedHours[i]);
              }
            } else {
              // Через полночь
              for (let i = startIdx; i < displayedHours.length; i++) {
                segmentHours.push(displayedHours[i]);
              }
              for (let i = 0; i <= endIdx; i++) {
                segmentHours.push(displayedHours[i]);
              }
            }
            
            // Рисуем дуги для каждого часа в сегменте
            return segmentHours.map((h, hIdx) => (
              <path
                key={`select-arc-${idx}-${h}`}
                d={describeArc(
                  CENTER,
                  CENTER,
                  RADIUS,
                  hourToDeg(h, firstH, lastH),
                  hourToDeg(
                    displayedHours[
                      (displayedHours.indexOf(h) + 1) % displayedHours.length
                    ],
                    firstH,
                    lastH
                  )
                )}
                fill="rgba(59,130,246,0.3)"
              />
            ));
          })}
          
        {/* Часовые отметки и кликабельные зоны */}
        {displayedHours.map((h) => {
          const { x, y } = getHandlePos(h);
          const isSelected =
            showInterval && isInInterval(h, start!, end!, displayedHours);
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
              {selection[1] === h &&
                selection[0] !== null &&
                selection[1] !== selection[0] && (
                  <circle cx={x} cy={y} r={7} fill="#1d4ed8" opacity={0.65} />
                )}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 text-sm">
        {showInterval
          ? `${getLabel(start!)}:00 - ${getLabel((end! + 1) % 24)}:00`
          : selection[0] !== null
          ? `Начало: ${getLabel(selection[0]!)}:00`
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
