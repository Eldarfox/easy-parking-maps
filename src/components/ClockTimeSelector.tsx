
import React from "react";

type ClockTimeSelectorProps = {
  value: [number, number] | null;
  onChange: (val: [number, number]) => void;
  disabledHours?: number[]; // часы (0-23), которые нельзя выбрать
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
  const [start, end] = value || [null, null];

  function getHandlePos(hour: number) {
    const deg = hourToDeg(hour) - 90;
    const rad = (deg * Math.PI) / 180;
    return {
      x: CENTER + RADIUS * Math.cos(rad),
      y: CENTER + RADIUS * Math.sin(rad),
    };
  }

  // Перетаскивание стрелок
  const draggingRef = React.useRef<"start" | "end" | null>(null);

  function handleDown(kind: "start" | "end", e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    draggingRef.current = kind;
    window.addEventListener("mousemove", handleMove as any);
    window.addEventListener("mouseup", handleUp as any);
    window.addEventListener("touchmove", handleMove as any, { passive: false });
    window.addEventListener("touchend", handleUp as any);
  }

  function getHourFromPoint(x: number, y: number) {
    const angle = Math.atan2(y - CENTER, x - CENTER) * 180/Math.PI + 90;
    let deg = angle < 0 ? angle + 360 : angle;
    let hour = Math.round((deg / 360) * 15 + 8);
    if (hour < 8) hour = 8;
    if (hour > 23) hour = 23;
    // Ближайший клик разрешённого часа
    let snap = HOURS.find(h =>
      Math.abs(h - hour) === Math.min(...HOURS.map(m => Math.abs(m - hour)))
    );
    if (isDisabled(snap!, disabledHours)) {
      return null;
    }
    return snap!;
  }

  function handleMove(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    let clientX, clientY;
    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else return;
    const rect = (document.getElementById("clock-selector-svg") as SVGElement)?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const hour = getHourFromPoint(x, y);
    if (hour && !isDisabled(hour, disabledHours)) {
      if (draggingRef.current === "start" && (end === null || hour <= end)) {
        onChange([hour, end || hour]);
      }
      if (draggingRef.current === "end" && (start === null || hour >= start)) {
        onChange([start || hour, hour]);
      }
    }
  }

  function handleUp() {
    draggingRef.current = null;
    window.removeEventListener("mousemove", handleMove as any);
    window.removeEventListener("mouseup", handleUp as any);
    window.removeEventListener("touchmove", handleMove as any);
    window.removeEventListener("touchend", handleUp as any);
  }

  function selectHour(hour: number) {
    if (isDisabled(hour, disabledHours)) return;
    if (start === null || (start !== null && end !== null)) {
      onChange([hour, hour]);
    } else if (start !== null && end === null) {
      if (hour < start) {
        onChange([hour, start]);
      } else {
        onChange([start, hour]);
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
        {start !== null && end !== null && (
          <path
            d={describeArc(
              CENTER,
              CENTER,
              RADIUS,
              hourToDeg(start),
              hourToDeg(end + 1)
            )}
            fill="rgba(59,130,246,0.18)"
          />
        )}
        {/* Часовые отметки и кликабельные зоны */}
        {HOURS.map((h, idx) => {
          const { x, y } = getHandlePos(h);
          return (
            <g key={h}>
              <circle
                cx={x}
                cy={y}
                r={17}
                fill={isDisabled(h, disabledHours) ? "#cbd5e1" : "#fff"}
                stroke={
                  start !== null &&
                  end !== null &&
                  h >= start &&
                  h <= end
                    ? "#2563eb"
                    : "#e2e8f0"
                }
                strokeWidth={2}
                className="cursor-pointer"
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
            </g>
          );
        })}
        {/* Стрелка "start" */}
        {start !== null && (
          <Arrow
            angle={hourToDeg(start)}
            color={arrowColor}
            width={arrowWidth}
            id="start"
            onPointerDown={(e) => handleDown("start", e)}
          />
        )}
        {/* Стрелка "end" */}
        {end !== null && (
          <Arrow
            angle={hourToDeg(end + 1)}
            color="#1d4ed8"
            width={arrowWidth}
            id="end"
            onPointerDown={(e) => handleDown("end", e)}
          />
        )}
      </svg>
      <div className="mt-2 text-sm">
        {start !== null && end !== null
          ? `${getLabel(start)} - ${getLabel(end + 1)}`
          : "Выберите время"}
      </div>
    </div>
  );
};

// Helper — рисует часть окружности в SVG path (отрезок от a до b градусов)
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

// Стрелка на циферблате
function Arrow({
  angle,
  color,
  width,
  id,
  onPointerDown,
}: {
  angle: number;
  color: string;
  width: number;
  id: string;
  onPointerDown?: React.PointerEventHandler<SVGLineElement> | ((e: any) => void);
}) {
  // Конец стрелки
  const rad = ((angle - 90) * Math.PI) / 180;
  const x2 = CENTER + (RADIUS - 8) * Math.cos(rad);
  const y2 = CENTER + (RADIUS - 8) * Math.sin(rad);

  return (
    <line
      x1={CENTER}
      y1={CENTER}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      style={{ cursor: "pointer" }}
      onMouseDown={onPointerDown}
      onTouchStart={onPointerDown}
      data-arrow={id}
    />
  );
}

export default ClockTimeSelector;
