/**
 * NAIB — School Dashboard
 * /pages/dashboard.jsx  (Next.js)
 *
 * Features:
 *  - Stats overview
 *  - "Request Urgent Sub" flow
 *  - Live matched teacher cards
 *  - Recent bookings table
 */

"use client";
import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const SUBJECTS = [
  "Mathematics","Physics","Chemistry","Biology",
  "English","Arabic","Computer_Science","History",
  "Geography","Economics","Business",
];
const CURRICULA = ["IGCSE","American","National","IB","STEM"];

export default function SchoolDashboard() {
  const school = {
    id: "school-001",
    name: "Cairo American College",
    lat: 30.0236,
    lng: 31.4880,
  };

  const [view, setView]               = useState("home");   // home | request | results
  const [subject, setSubject]         = useState("Physics");
  const [curriculum, setCurriculum]   = useState("IGCSE");
  const [grade, setGrade]             = useState("Grade 10");
  const [duration, setDuration]       = useState(1);
  const [loading, setLoading]         = useState(false);
  const [matches, setMatches]         = useState([]);
  const [bookingId, setBookingId]     = useState(null);
  const [confirmedTeacher, setConfirmedTeacher] = useState(null);
  const [qrPayload, setQrPayload]     = useState(null);
  const [bookings, setBookings]       = useState([
    { id: "bk-001", subject: "Mathematics", teacher: "Hana Youssef", status: "Completed", date: "Apr 12", amount: 200 },
    { id: "bk-002", subject: "English",     teacher: "Omar Fawzy",   status: "Confirmed", date: "Apr 13", amount: 180 },
  ]);

  async function handleFindMatch() {
    setLoading(true);
    setView("results");
    try {
      const res = await fetch(`${API}/api/bookings/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school_id:         school.id,
          school_lat:        school.lat,
          school_lng:        school.lng,
          subject_needed:    subject,
          curriculum_needed: curriculum,
          grade_level:       grade,
          duration_hours:    duration,
        }),
      });
      const data = await res.json();
      // Also grab the booking ID from a second response header or parse from data
      setMatches(Array.isArray(data) ? data : []);
      // For demo: mock a booking ID since our API returns it separately
      setBookingId("booking-" + Date.now());
    } catch (e) {
      // Demo fallback if API not running
      setMatches([
        { id: "t1", name: "Ahmed Hassan",  subjects: ["Physics","Mathematics"], distance_km: 0.74, match_score: 0.95, hourly_rate: 200, rating: 4.8, phone: "010-0123-4567" },
        { id: "t2", name: "Sara El-Sayed", subjects: ["Physics"],               distance_km: 0.39, match_score: 0.82, hourly_rate: 180, rating: 4.5, phone: "011-1234-5678" },
      ]);
      setBookingId("booking-demo-" + Date.now());
    }
    setLoading(false);
  }

  async function confirmTeacher(teacher) {
    try {
      const res = await fetch(`${API}/api/bookings/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId, teacher_id: teacher.id }),
      });
      const data = await res.json();
      setQrPayload(data.qr_payload || `naib://checkin?booking=${bookingId}&token=demo-token`);
    } catch {
      setQrPayload(`naib://checkin?booking=${bookingId}&token=demo-token`);
    }
    setConfirmedTeacher(teacher);
    setBookings(prev => [{
      id: bookingId, subject, teacher: teacher.name,
      status: "Confirmed", date: "Today", amount: teacher.hourly_rate * duration,
    }, ...prev]);
  }

  // ── Score bar helper ─────────────────────
  function ScoreBar({ score }) {
    const pct = Math.round(score * 100);
    const color = pct >= 90 ? "#1D9E75" : pct >= 70 ? "#BA7517" : "#D85A30";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, height: 6, background: "var(--color-background-secondary)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 500, color }}>{pct}%</span>
      </div>
    );
  }

  function StatusBadge({ status }) {
    const map = {
      Confirmed:  { bg: "#E1F5EE", color: "#0F6E56" },
      Completed:  { bg: "#E6F1FB", color: "#185FA5" },
      Pending:    { bg: "#FAEEDA", color: "#854F0B" },
      Cancelled:  { bg: "#FCEBEB", color: "#A32D2D" },
    };
    const s = map[status] || { bg: "#F1EFE8", color: "#5F5E5A" };
    return (
      <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.color }}>
        {status}
      </span>
    );
  }

  // ── Sidebar ──────────────────────────────
  function Sidebar() {
    const links = [
      { id: "home",    label: "Dashboard",  icon: "◈" },
      { id: "request", label: "New Request", icon: "⊕" },
      { id: "history", label: "Bookings",    icon: "☰" },
    ];
    return (
      <aside style={{ width: 220, minHeight: "100vh", borderRight: "0.5px solid var(--color-border-tertiary)", padding: "2rem 1rem", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", color: "var(--color-text-tertiary)", textTransform: "uppercase", margin: "0 0 4px" }}>Naib</p>
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.3 }}>{school.name}</p>
        </div>
        {links.map(l => (
          <button key={l.id} onClick={() => setView(l.id)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: "var(--border-radius-md)", border: "none", cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: view === l.id ? 500 : 400, background: view === l.id ? "var(--color-background-secondary)" : "transparent", color: view === l.id ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}>
            <span style={{ fontSize: 14 }}>{l.icon}</span>
            {l.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: "12px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)" }}>
          <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>Active booking</p>
          {confirmedTeacher ? (
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, margin: 0, color: "var(--color-text-primary)" }}>{confirmedTeacher.name} — {subject}</p>
              <button onClick={() => setView("chat")} style={{ marginTop: "8px", width: "100%", padding: "6px", fontSize: "11px", background: "var(--color-primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Message Teacher</button>
            </div>
          ) : (
            <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: 0 }}>None active</p>
          )}
        </div>
      </aside>
    );
  }

  // ── Chat View (MVP) ──────────────────────
  function ChatView() {
    return (
      <div style={{ maxWidth: 600, border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", height: "400px", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px", borderBottom: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)", fontWeight: 500 }}>
          Conversation with {confirmedTeacher?.name}
        </div>
        <div style={{ flex: 1, padding: "12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ alignSelf: "flex-start", background: "var(--color-background-secondary)", padding: "8px 12px", borderRadius: "8px", fontSize: "13px" }}>Hello! I have accepted the booking.</div>
          <div style={{ alignSelf: "flex-end", background: "#E1F5EE", color: "#0F6E56", padding: "8px 12px", borderRadius: "8px", fontSize: "13px" }}>Great, please bring your ID to the front gate.</div>
        </div>
        <div style={{ padding: "12px", borderTop: "0.5px solid var(--color-border-tertiary)", display: "flex", gap: "8px" }}>
          <input placeholder="Type message..." style={{ flex: 1, padding: "8px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "4px" }} />
          <button style={{ padding: "8px 16px", background: "var(--color-text-primary)", color: "white", border: "none", borderRadius: "4px" }}>Send</button>
        </div>
      </div>
    );
  }

  // ── Home View ────────────────────────────
  function HomeView() {
    const stats = [
      { label: "Sessions this month", value: "12" },
      { label: "Avg response time",   value: "4 min" },
      { label: "Teacher pool",        value: "38" },
      { label: "Satisfaction",        value: "4.7 ★" },
    ];
    return (
      <div>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px" }}>Good morning</h1>
          <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: 0 }}>Monday, 13 April 2026 · IGCSE Calendar Week 15</p>
        </div>

        {/* Urgent CTA */}
        <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "1.5rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", border: "0.5px solid var(--color-border-tertiary)" }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 4px" }}>Need a substitute now?</p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>Find a vetted teacher in under 4 minutes</p>
          </div>
          <button onClick={() => setView("request")} style={{ padding: "10px 20px", borderRadius: "var(--border-radius-md)", background: "var(--color-text-primary)", color: "var(--color-background-primary)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            Request urgent sub →
          </button>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "2rem" }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "1rem" }}>
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Recent bookings */}
        <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: "1rem" }}>Recent bookings</h2>
        <BookingsTable />
      </div>
    );
  }

  // ── Request View ─────────────────────────
  function RequestView() {
    return (
      <div style={{ maxWidth: 520 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 0.5rem" }}>Request a substitute</h1>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 2rem" }}>We'll find the closest available teacher immediately.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Subject needed</span>
            <select value={subject} onChange={e => setSubject(e.target.value)} style={{ padding: "10px 12px", fontSize: 14, border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", background: "var(--color-background-primary)", color: "var(--color-text-primary)" }}>
              {SUBJECTS.map(s => <option key={s}>{s.replace("_", " ")}</option>)}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Curriculum</span>
            <select value={curriculum} onChange={e => setCurriculum(e.target.value)} style={{ padding: "10px 12px", fontSize: 14, border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", background: "var(--color-background-primary)", color: "var(--color-text-primary)" }}>
              {CURRICULA.map(c => <option key={c}>{c}</option>)}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Grade level</span>
            <input value={grade} onChange={e => setGrade(e.target.value)} placeholder="e.g. Grade 10" style={{ padding: "10px 12px", fontSize: 14, border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", background: "var(--color-background-primary)", color: "var(--color-text-primary)" }} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Duration: {duration}h ({duration * 45} min)</span>
            <input type="range" min={1} max={6} step={0.5} value={duration} onChange={e => setDuration(parseFloat(e.target.value))} style={{ width: "100%" }} />
          </label>

          <button onClick={handleFindMatch} style={{ padding: "12px", borderRadius: "var(--border-radius-md)", background: "var(--color-text-primary)", color: "var(--color-background-primary)", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
            Find available teachers →
          </button>
        </div>
      </div>
    );
  }

  // ── Results View ─────────────────────────
  function ResultsView() {
    if (loading) return (
      <div style={{ padding: "3rem 0", textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>Scanning {subject.replace("_"," ")} teachers near you…</p>
      </div>
    );

    if (confirmedTeacher) return (
      <div style={{ maxWidth: 480 }}>
        <div style={{ padding: "1.5rem", borderRadius: "var(--border-radius-lg)", border: "0.5px solid #9FE1CB", background: "#E1F5EE", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#0F6E56", margin: "0 0 4px" }}>Booking confirmed</p>
          <p style={{ fontSize: 20, fontWeight: 500, margin: "0 0 8px", color: "#085041" }}>{confirmedTeacher.name}</p>
          <p style={{ fontSize: 13, color: "#0F6E56", margin: 0 }}>{subject.replace("_"," ")} · {curriculum} · {duration}h · {confirmedTeacher.hourly_rate * duration} EGP</p>
        </div>

        <div style={{ padding: "1.5rem", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)" }}>
          <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 12px" }}>QR check-in code</p>
          <p style={{ fontSize: 11, fontFamily: "monospace", color: "var(--color-text-secondary)", wordBreak: "break-all", margin: "0 0 12px", padding: "8px", background: "var(--color-background-primary)", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)" }}>{qrPayload}</p>
          <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: 0 }}>Show this code to the teacher when they arrive at the school gate.</p>
        </div>

        <button onClick={() => { setView("home"); setConfirmedTeacher(null); setMatches([]); }}
          style={{ marginTop: "1.5rem", padding: "10px 20px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", background: "transparent", cursor: "pointer", fontSize: 13, color: "var(--color-text-secondary)" }}>
          Back to dashboard
        </button>
      </div>
    );

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 4px" }}>{matches.length} teacher{matches.length !== 1 ? "s" : ""} available</h1>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>{subject.replace("_"," ")} · {curriculum} · within 25 km</p>
          </div>
          <button onClick={() => setView("request")} style={{ fontSize: 12, color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-secondary)", padding: "6px 12px", borderRadius: "var(--border-radius-md)", background: "transparent", cursor: "pointer" }}>
            ← Change request
          </button>
        </div>

        {/* MOCK MAP VIEW PORTION */}
        <div style={{ width: "100%", height: "180px", background: "#f0f2f5", borderRadius: "var(--border-radius-lg)", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--color-border-tertiary)", backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\"><circle cx=\"10\" cy=\"10\" r=\"2\" fill=\"%23ccc\"/></svg>')", overflow: "hidden", position: "relative" }}>
           <span style={{ fontSize: "13px", color: "var(--color-text-tertiary)", background: "white", padding: "4px 8px", borderRadius: "4px" }}>Interactive Live Map (Haversine distances)</span>
           {matches.map((m, i) => (
             <div key={i} style={{ position: "absolute", top: `${20 + i * 15}%`, left: `${30 + i * 20}%`, width: "12px", height: "12px", background: "#1D9E75", borderRadius: "50%", border: "2px solid white", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
           ))}
        </div>

        {matches.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-secondary)", fontSize: 14 }}>
            No teachers found for this subject and area. Try expanding your search or choosing a different subject.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {matches.map((t, i) => (
              <div key={t.id} style={{ background: "var(--color-background-primary)", border: i === 0 ? "1.5px solid #9FE1CB" : "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: i === 0 ? "#E1F5EE" : "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: i === 0 ? "#0F6E56" : "var(--color-text-secondary)" }}>
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>{t.name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)" }}>{t.subjects?.join(" · ")} · {t.distance_km} km away</p>
                    </div>
                  </div>
                  {i === 0 && <span style={{ fontSize: 10, background: "#E1F5EE", color: "#0F6E56", padding: "3px 10px", borderRadius: 20, fontWeight: 500 }}>Best match</span>}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: 12 }}>
                  {[
                    { label: "Rate", val: `${t.hourly_rate} EGP/hr` },
                    { label: "Rating", val: `${t.rating} ★` },
                    { label: "Match", val: null, score: t.match_score },
                  ].map(cell => (
                    <div key={cell.label}>
                      <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: "0 0 3px" }}>{cell.label}</p>
                      {cell.score !== undefined ? <ScoreBar score={cell.score} /> : <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{cell.val}</p>}
                    </div>
                  ))}
                </div>

                <button onClick={() => confirmTeacher(t)}
                  style={{ width: "100%", padding: "9px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", background: i === 0 ? "var(--color-text-primary)" : "transparent", color: i === 0 ? "var(--color-background-primary)" : "var(--color-text-primary)", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                  Confirm {t.name.split(" ")[0]} — {t.hourly_rate * duration} EGP total
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function BookingsTable() {
    return (
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
            {["Subject","Teacher","Date","Amount","Payment","Status","Action"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "8px 0", fontSize: 11, color: "var(--color-text-tertiary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              <td style={{ padding: "12px 0" }}>{b.subject}</td>
              <td style={{ padding: "12px 0", color: "var(--color-text-secondary)" }}>{b.teacher}</td>
              <td style={{ padding: "12px 0", color: "var(--color-text-secondary)" }}>{b.date}</td>
              <td style={{ padding: "12px 0" }}>{b.amount} EGP</td>
              <td style={{ padding: "12px 0" }}><span style={{fontSize: 11, background: b.status==="Pending" ? "#FAEEDA" : "#E1F5EE", padding: "2px 6px", borderRadius: "4px"}}>{b.status==="Pending" ? "Pending" : "Fawry Paid"}</span></td>
              <td style={{ padding: "12px 0" }}><StatusBadge status={b.status} /></td>
              <td style={{ padding: "12px 0" }}>
                 <button style={{ fontSize: "11px", color: "#A32D2D", background: "transparent", border: "1px solid #FCEBEB", borderRadius: "4px", padding: "4px 8px", cursor: "pointer" }}>Open Dispute</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-sans)", color: "var(--color-text-primary)" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "2rem 2.5rem", overflowY: "auto" }}>
        {view === "home"    && <HomeView />}
        {view === "request" && <RequestView />}
        {view === "results" && <ResultsView />}
        {view === "chat"    && <ChatView />}
        {view === "history" && (
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: "1.5rem" }}>All bookings & Transactions</h1>
            <BookingsTable />
          </div>
        )}
      </main>
    </div>
  );
}
