// calendarView.tsx
import type { PageName, TimeEntry } from "./page";
import React, { useState } from 'react';

type CalendarViewProps = {
  timeLog: TimeEntry[];
  setTimeLog: React.Dispatch<React.SetStateAction<TimeEntry[]>>;
  setPage: React.Dispatch<React.SetStateAction<PageName>>;
  setSelectedDate: (date: string) => void;
  buttonStyle: string;
};

const wrapperStyle = "max-w-3xl w-full space-y-4 bg-white shadow-md rounded-xl text-gray-800 mb-8";
const pageWrapper = "pageWrapper";

const CalendarView = ({ timeLog, setTimeLog, setPage, setSelectedDate, buttonStyle }: CalendarViewProps) => {
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const staticHolidays = [
    [`${viewYear}-01-01`, "Nyttårsdag"],
    [`${viewYear}-05-01`, "Arbeidernes dag"],
    [`${viewYear}-05-17`, "Grunnlovsdag"],
    [`${viewYear}-12-25`, "1. juledag"],
    [`${viewYear}-12-26`, "2. juledag"]
  ];

  const calculateEaster = (year: number): Date => {
    const f = Math.floor,
      G = year % 19,
      C = f(year / 100),
      H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
      I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
      J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
      L = I - J,
      month = 3 + f((L + 40) / 44),
      day = L + 28 - 31 * f(month / 4);
    return new Date(year, month - 1, day);
  };

  const movableHolidays = (() => {
    const easter = calculateEaster(viewYear);
    const plusDays = (date: Date, days: number): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

    return ([
      [easter, "1. påskedag"],
      [plusDays(easter, -3), "Skjærtorsdag"],
      [plusDays(easter, -2), "Langfredag"],
      [plusDays(easter, 1), "2. påskedag"],
      [plusDays(easter, 39), "Kristi himmelfartsdag"],
      [plusDays(easter, 49), "1. pinsedag"],
      [plusDays(easter, 50), "2. pinsedag"]
    ] as [Date, string][]).map(([d, name]) => [`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`, name]);
  })();

  const allHolidays = [...staticHolidays, ...movableHolidays];
  const holidays = allHolidays.map(([d]) => d);
  const getHolidayName = (date: string) => {
    const found = allHolidays.find(([d]) => d === date);
    return found ? found[1] : null;
  };

  const changeMonth = (offset: number) => {
    let newMonth = viewMonth + offset;
    let newYear = viewYear;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
  const startOffset = (firstDay + 6) % 7;
  const formatDate = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const calendarDays = [...Array(startOffset).fill(null), ...Array(daysInMonth).fill(0).map((_, i) => i + 1)];

  return (
    <div className={pageWrapper}>
      <main className={wrapperStyle}>
        <div className="flex justify-between items-center mb-6">
          <button className={buttonStyle} onClick={() => changeMonth(-1)}>← Forrige</button>
          <span className="text-xl font-semibold">{viewYear}-{String(viewMonth).padStart(2, '0')}</span>
          <button className={buttonStyle} onClick={() => changeMonth(1)}>Neste →</button>
        </div>
        <div className="w-full max-w-full overflow-hidden border rounded-lg">
          <table className="table-fixed w-full border border-gray-400 border-collapse text-sm">
            <thead>
              <tr className="">
                {['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'].map((d, i) => (
                  <th key={i} className="p-2 border border-gray-400 bg-gray-50 text-center">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, rowIndex) => (
                <tr key={rowIndex}>
                  {calendarDays.slice(rowIndex * 7, rowIndex * 7 + 7).map((dayNum, dayIndex) => {
                    const fullDate: string = formatDate(viewYear, viewMonth, dayNum!);
                    const entries = fullDate ? timeLog.filter(t => t.date === fullDate) : [];
                    const totalHours = entries.reduce((sum, e) => {
                      const start = parseFloat(e.start);
                      const end = parseFloat(e.end);
                      if (isNaN(start) || isNaN(end)) return sum;
                      return sum + (end - start);
                    }, 0);

                    return dayNum ? (
                      <td
                        key={dayIndex}
                        className={`align-top p-2 h-24 text-left ${fullDate === formatDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()) ? 'bg-blue-200 border-blue-500 text-blue-900 font-bold ring-2 ring-blue-300' : 'border-gray-400 ring-2 ring-gray-300'} ${holidays.includes(fullDate) ? 'bg-red-100' : ''}`}
                        onClick={() => {
                          setSelectedDate(fullDate);
                          setPage("timer");
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(ev) => {
                          const data = ev.dataTransfer.getData("application/json");
                          if (!data) return;
                          try {
                            const droppedEntry = JSON.parse(data);
                            const newEntry = { ...droppedEntry, date: fullDate };
                            const updatedLog = timeLog.filter((t) =>
                              !(t.date === droppedEntry.date && t.start === droppedEntry.start && t.end === droppedEntry.end && t.workType === droppedEntry.workType)
                            );
                            const finalLog = [...updatedLog, newEntry];
                            setTimeLog(finalLog);
                            localStorage.setItem("timeLog", JSON.stringify(finalLog));
                          } catch (err) {
                            console.error("Ugyldig data droppet:", err);
                          }
                        }}
                      >
                        <div className="font-semibold text-sm">
                          {dayNum}
                          {getHolidayName(fullDate) && <div className="text-[10px] text-red-700">{getHolidayName(fullDate)}</div>}
                        </div>
                        {entries.length > 0 && (
                          <div className="text-xs mt-1 space-y-1">
                            {entries.map((e, i) => (
                              <div
                                key={i}
                                className="border-b border-gray-200 text-[11px] flex justify-between items-center"
                                draggable
                                onDragStart={(ev) => {
                                  ev.dataTransfer.setData("application/json", JSON.stringify(e));
                                }}
                              >
                                <span className="truncate">🕒 {e.start}-{e.end} • {e.workType}</span>
                                <button
                                  className="text-red-500 hover:text-red-700 text-xs ml-2"
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    if (!confirm("Er du sikker på at du vil slette denne føringen?")) return;
                                    const updatedLog = timeLog.filter((t) =>
                                      !(t.date === e.date && t.start === e.start && t.end === e.end && t.workType === e.workType)
                                    );
                                    setTimeLog(updatedLog);
                                    localStorage.setItem("timeLog", JSON.stringify(updatedLog));
                                  }}
                                >🗑️</button>
                              </div>
                            ))}
                            <div className="text-center text-[10px] font-semibold pt-1">Totalt: {totalHours.toFixed(1)}t</div>
                          </div>
                        )}
                      </td>
                    ) : (
                      <td key={dayIndex} className="border border-gray-400 ring-2 ring-gray-300 h-24"></td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-6">
          <button className={buttonStyle} onClick={() => setPage("home")}>Tilbake</button>
        </div>
      </main>
      <footer className="text-center text-sm text-gray-500 mt-4 py-2">
        Org: 934 100 085 &nbsp; Alt det andre AS
      </footer>
    </div>
  );
};

export default CalendarView;
