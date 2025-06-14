// timeAdmin.tsx
import React from "react";
import type { TimeEntry } from "./page";

interface Machine {
  name: string;
  model?: string;
  year?: number;
  image?: string;
  notes?: string;
}

interface TimeAdminProps {
  newTime: TimeEntry;
  setNewTime: React.Dispatch<React.SetStateAction<TimeEntry>>;
  machineList: Machine[];
  timeLog: TimeEntry[];
  setTimeLog: React.Dispatch<React.SetStateAction<TimeEntry[]>>;
  buttonStyle: string;
}

export default function TimeAdmin({ newTime, setNewTime, machineList, timeLog, setTimeLog, buttonStyle }: TimeAdminProps) {
  return (
    <>
      <h2 className="text-2xl font-bold">Timerføring</h2>
      <input type="date" className="border p-2 w-full rounded" value={newTime.date} onChange={(e) => setNewTime({ ...newTime, date: e.target.value })} />
      <input type="time" className="border p-2 w-full rounded" value={newTime.start} onChange={(e) => setNewTime({ ...newTime, start: e.target.value })} placeholder="Starttid" />
      <input type="time" className="border p-2 w-full rounded" value={newTime.end} onChange={(e) => setNewTime({ ...newTime, end: e.target.value })} placeholder="Sluttid" />
      <input type="number" className="border p-2 w-full rounded" value={newTime.lunch} onChange={(e) => setNewTime({ ...newTime, lunch: parseInt(e.target.value) })} placeholder="Pause (min)" />
      <input type="text" className="border p-2 w-full rounded" value={newTime.workType} onChange={(e) => setNewTime({ ...newTime, workType: e.target.value })} placeholder="Arbeidstype" />
      <div>
        <label>Maskiner brukt:</label>
        {machineList.map((m, i) => (
          <label key={i} className="block">
            <input type="checkbox" checked={newTime.machines.includes(m.name)} onChange={(e) => {
              const machines = e.target.checked ? [...newTime.machines, m.name] : newTime.machines.filter((name) => name !== m.name);
              setNewTime({ ...newTime, machines });
            }} /> {m.name}
          </label>
        ))}
      </div>
      <button className={buttonStyle} onClick={() => {
        const updatedLog = [...timeLog, newTime];
        setTimeLog(updatedLog);
        localStorage.setItem("timeLog", JSON.stringify(updatedLog));
        setNewTime({ ...newTime, start: "", end: "", lunch: 0, workType: "", machines: [] });
      }}>Lagre</button>
    </>
  );
}
