// page.tsx
"use client";
import type { JSX } from "react";

import { useState, useEffect } from "react";
import "./globals.css";
import CalendarView from "./calendarView";
import TimeAdmin from "./timeAdmin";

export type PageName = "login" | "home" | "risiko" | "avvik" | "sjekklister" | "timer" | "historikk" | "maskiner" | "kalender";

export type TimeEntry = {
  date: string;
  start: string;
  end: string;
  lunch: number;
  machines: string[];
  workType: string;
  tools: string[];
};

export default function VAHMSApp() {
  const [page, setPage] = useState<PageName>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [projectList, setProjectList] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [participants, setParticipants] = useState("");
  const [riskChecks, setRiskChecks] = useState<string[]>([]);
  const [log, setLog] = useState<{ date: string; description: string; action: string }[]>([]);
  const today = new Date().toISOString().split('T')[0];
  const [newEntry, setNewEntry] = useState({ date: today, description: "", action: "" });
  const [checklists, setChecklists] = useState<{ title: string, items: string[] }[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState("");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  //const [timeLog, setTimeLog] = useState<{ date: string; start: string; end: string; lunch: number; machines: string[]; workType: string; tools: string[] }[]>([]);
  const [timeLog, setTimeLog] = useState<TimeEntry[]>([]);

  const [newTime, setNewTime] = useState({ date: today, start: "", end: "", lunch: 0, machines: [] as string[], workType: "", tools: [] as string[] });
  const [machineList, setMachineList] = useState<{ name: string; model: string; year: number; image: string; notes: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    fetch("/checklists.json").then(res => res.json()).then(data => {
      setChecklists(data);
      if (data.length > 0) setSelectedChecklist(data[0].title);
    });
    fetch("/projects.json").then(res => res.json()).then(data => {
      setProjectList(data);
      if (data.length > 0) setSelectedProject(data[0]);
    });
    fetch("/machines.json").then(res => res.json()).then(data => setMachineList(data));
    const savedUser = localStorage.getItem("rememberedUser");
    if (savedUser) setUsername(savedUser);

    const savedTimeLog = localStorage.getItem("timeLog");
    if (savedTimeLog) setTimeLog(JSON.parse(savedTimeLog));
  }, []);

  const validUsers = [
    { user: "svein", pass: "1234" },
    { user: "ola", pass: "pass" },
    { user: "kari", pass: "hemmelig" },
  ];

  const wrapperStyle = "max-w-3xl w-full space-y-4 bg-white shadow-md rounded-xl text-gray-800 mb-8";
  const pageWrapper = "pageWrapper";
  const buttonStyle = "button-primary uniform-button";

  const handleLogin = () => {
    const match = validUsers.find(u => u.user === username && u.pass === password);
    if (match) {
      if (rememberMe) localStorage.setItem("rememberedUser", username);
      setPage("home");
    } else {
      alert("Feil brukernavn eller passord");
    }
  };

  const wrap = (content: JSX.Element) => (
    <div className={pageWrapper}>
      <main className={wrapperStyle}>{content}</main>
      <footer className="text-center text-sm text-gray-500 mt-4 py-2">
        Org: 934 100 085 &nbsp; Alt det andre AS
      </footer>
    </div>
  );

  const renderLogin = () => wrap(
    <>
      <h2 className="text-2xl font-bold text-center">Logg inn</h2>
      <input type="text" placeholder="Brukernavn" className="border p-2 w-full rounded" value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
      <input type="password" placeholder="Passord" className="border p-2 w-full rounded" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
      <label className="flex items-center space-x-2">
        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> <span>Husk meg</span>
      </label>
      <div className="flex justify-center">
        <button className={buttonStyle} onClick={handleLogin}>Logg inn</button>
      </div>
    </>
  );

  const renderHome = () => wrap(
    <>
      <h1 className="text-3xl font-bold text-center">VA HMS App</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <p className="text-sm text-center text-gray-500">Valgt dato: {selectedDate || "ingen valgt"}</p> 

        {[
          ["Risikoanalyse", "risiko"],
          ["Registrere avvik", "avvik"],
          ["Sjekklister", "sjekklister"],
          ["Timeføring", "timer"],
          ["Timehistorikk", "historikk"],
          ["Maskinregister", "maskiner"],
          ["Kalender", "kalender"]
        ].map(([label, route]) => (
          <button key={route} className={buttonStyle} onClick={() => setPage(route as PageName)}>{label}</button>
        ))}
      </div>
    </>
  );

  const renderRisiko = () => wrap(
    <>
      <h2 className="text-2xl font-bold">Risikoanalyse</h2>
      <p>Prosjekt: {selectedProject}</p>
      <select className="border p-2 w-full rounded" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
        {projectList.map((p, i) => (
          <option key={i} value={p}>{p}</option>
        ))}
      </select>
      <textarea className="border p-2 w-full rounded mt-2" placeholder="Beskriv risiko..." value={participants} onChange={(e) => setParticipants(e.target.value)} />
      <button className={buttonStyle} onClick={() => setRiskChecks([...riskChecks, participants])}>Lagre risiko</button>
      <h3 className="text-lg font-semibold mt-4">Tidligere vurderinger</h3>
      <ul className="list-disc pl-6">
        {riskChecks.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </>
  );

  const renderAvvik = () => wrap(
    <>
      <h2 className="text-2xl font-bold">Registrere avvik</h2>
      <input type="text" placeholder="Dato" className="border p-2 w-full rounded" value={newEntry.date} onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })} />
      <input type="text" placeholder="Beskrivelse" className="border p-2 w-full rounded" value={newEntry.description} onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })} />
      <input type="text" placeholder="Tiltak" className="border p-2 w-full rounded" value={newEntry.action} onChange={(e) => setNewEntry({ ...newEntry, action: e.target.value })} />
      <button className={buttonStyle} onClick={() => setLog([...log, newEntry])}>Lagre</button>
      <div>
        <h3 className="font-semibold">Logg:</h3>
        <ul>
          {log.map((entry, idx) => <li key={idx}>{entry.date} - {entry.description} - {entry.action}</li>)}
        </ul>
      </div>
    </>
  );

  const renderSjekklister = () => wrap(
    <>
      <h2 className="text-2xl font-bold">Sjekklister</h2>
      <select className="border p-2 w-full rounded" value={selectedChecklist} onChange={(e) => setSelectedChecklist(e.target.value)}>
        {checklists.map((cl, idx) => <option key={idx} value={cl.title}>{cl.title}</option>)}
      </select>
      <ul>
        {checklists.find(cl => cl.title === selectedChecklist)?.items.map((item, idx) => (
          <li key={idx}>
            <label>
              <input type="checkbox" checked={checkedItems[item]} onChange={() => setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }))} /> {item}
            </label>
          </li>
        ))}
      </ul>
    </>
  );

  const renderHistorikk = () => wrap(
    <>
      <h2 className="text-2xl font-bold">Timehistorikk</h2>
      <ul>
        {timeLog.map((entry, idx) => (
          <li key={idx} className="border-b py-2">
            {entry.date}: {entry.start} - {entry.end} ({entry.workType})
            {entry.lunch ? ` – Pause: ${entry.lunch} min` : ""}
            {entry.machines?.length ? ` – Maskiner: ${entry.machines.join(", ")}` : ""}
          </li>
        ))}
      </ul>
    </>
  );

  const renderMaskiner = () => wrap(
    <>
      <h2 className="text-2xl font-bold">Maskinregister</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {machineList.map((machine, idx) => (
          <div key={idx} className="border p-4 rounded shadow">
            <h3 className="font-semibold">{machine.name} ({machine.model})</h3>
            <p>Årsmodell: {machine.year}</p>
            <p>Notater: {machine.notes}</p>
            {machine.image && <img src={machine.image} alt={machine.name} className="mt-2 max-h-40" />}
          </div>
        ))}
      </div>
    </>
  );

  if (page === "login") return renderLogin();
  if (page === "home") return renderHome();
  if (page === "risiko") return renderRisiko();
  if (page === "avvik") return renderAvvik();
  if (page === "sjekklister") return renderSjekklister();
  if (page === "timer") return wrap(
    <TimeAdmin
      newTime={newTime}
      setNewTime={setNewTime}
      machineList={machineList}
      timeLog={timeLog}
      setTimeLog={setTimeLog}
      buttonStyle={buttonStyle}
    />
  );
  if (page === "historikk") return renderHistorikk();
  if (page === "maskiner") return renderMaskiner();
  if (page === "kalender") return (
    <CalendarView
      timeLog={timeLog}
      setTimeLog={setTimeLog}
      setPage={setPage}
      setSelectedDate={setSelectedDate}
      buttonStyle={buttonStyle}
    />
  );

  return null;
}
