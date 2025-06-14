import React from "react";

type ClockTimeSelectorProps = {
  value: [number, number] | null;
  onChange: (val: [number, number] | null) => void;
  disabledHours?: number[];
};

const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 8-23

export const hourToDeg = (hour: number) => ((hour - 8) / 15) * 360;

const RADIUS = 80;
const CENTER = 100;

function isDisabled(hour: number, disabledHours?: number[]) {
  return disabledHours?.includes(hour);
}

const getLabel = (h: number) => h.toString().padStart(2, "0") + ":00";

const arrowColor = "#2563eb";
const arrowWidth = 3;

const ClockTimeSelector: React.FC<ClockTimeSelectorProps> = ({
  value,
  onChange,
  disabledHours = [],
}) => {
  const [selection, setSelection] = React.useState<[number | null, number | null]>([null, null]);

  // Синхронизация с value из props
  React.useEffect(() => {
    if (!value) setSelection([null, null]);
    else setSelection([value[0], value[1]]);
  }, [value]);

  function getHandlePos(hour: number) {
    const deg = hourToDeg(hour) - 90;
    const rad = (deg * Math.PI) / 180;
    return {
      x: CENTER + RADIUS * Math.cos(rad),
      y: CENTER + RADIUS * Math.sin(rad),
    };
  }

  // Клик по часу: логика выбора диапазона
  function selectHour(hour: number) {
    if (isDisabled(hour, disabledHours)) return;
    const [start, end] = selection;
    if (start === null || (start !== null && end !== null)) {
      // Первое нажатие или пере-выбор — устанавливаем начало
      setSelection([hour, null]);
      onChange(null); // Сброс выделения
    } else if (start !== null && end === null) {
      if (hour === start) {
        // Клик по тому же часу — снимаем выделение
        setSelection([null, null]);
        onChange(null);
      } else {
        // Выбор диапазона: проверяем, что нет "запрещённых" часов внутри
        const min = Math.min(start, hour);
        const max = Math.max(start, hour);
        const disabledInRange = HOURS.some(
          (h) => h >= min && h <= max && isDisabled(h, disabledHours)
        );
        if (disabledInRange) return;
        setSelection([min, max]);
        onChange([min, max]);
      }
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
        {HOURS.map((h, idx) =>
          isDisabled(h, disabledHours) ? (
            <path
              key={`sect-${h}`}
              d={describeArc(
                CENTER,
                CENTER,
                RADIUS,
                hourToDeg(h),
                hourToDeg(h + 1)
              )}
              fill="rgba(150,150,150,0.5)"
            />
          ) : null
        )}
        {/* Секторы выбранного интервала */}
        {selection[0] !== null && selection[1] !== null && (
          <path
            d={describeArc(
              CENTER,
              CENTER,
              RADIUS,
              hourToDeg(selection[0]),
              hourToDeg(selection[1] + 1)
            )}
            fill="rgba(59,130,246,0.18)"
          />
        )}
        {/* Часовые отметки и кликабельные зоны */}
        {HOURS.map((h, idx) => {
          const { x, y } = getHandlePos(h);
          const selected =
            selection[0] !== null &&
            selection[1] !== null &&
            h >= selection[0] &&
            h <= selection[1];
          return (
            <g key={h}>
              <circle
                cx={x}
                cy={y}
                r={17}
                fill={isDisabled(h, disabledHours) ? "#cbd5e1" : "#fff"}
                stroke={
                  selected ? "#2563eb" : "#e2e8f0"
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
                fontSize={12}
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
        {selection[0] !== null && selection[1] !== null
          ? `${getLabel(selection[0])} - ${getLabel(selection[1] + 1)}`
          : selection[0] !== null
          ? `Начало: ${getLabel(selection[0])}` 
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
