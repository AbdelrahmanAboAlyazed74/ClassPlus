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
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5218";

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "English", "Arabic", "Computer_Science", "History",
  "Geography", "Economics", "Business",
];
const CURRICULA = ["IGCSE", "American", "National", "IB", "STEM"];

export default function SchoolDashboard() {
  const [school, setSchool] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const u = JSON.parse(loggedInUser);
      if (u.role !== 'SCHOOL') {
        router.push('/');
      } else {
        setSchool({
          id: u.id,
          name: u.fullName,
          lat: u.latitude || 30.0236, // fallback if not set
          lng: u.longitude || 31.4880,
        });
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const [view, setView] = useState("home");   // home | request | results
  const [subject, setSubject] = useState("Physics");
  const [curriculum, setCurriculum] = useState("IGCSE");
  const [grade, setGrade] = useState("Grade 10");
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [bookingId, setBookingId] = useState(null);
  const [confirmedTeacher, setConfirmedTeacher] = useState(null);
  const [qrPayload, setQrPayload] = useState(null);
  const [bookings, setBookings] = useState([
    { id: "bk-001", subject: "Mathematics", teacher: "Hana Youssef", status: "Completed", date: "Apr 12", amount: 200 },
    { id: "bk-002", subject: "English", teacher: "Omar Fawzy", status: "Confirmed", date: "Apr 13", amount: 180 },
  ]);

  async function handleFindMatch() {
    setLoading(true);
    setView("results");
    try {
      const res = await fetch(`${API}/api/bookings/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: school.id,
          latitude: school.lat,
          longitude: school.lng,
          subjectNeeded: subject,
          curriculumNeeded: curriculum,
          gradeLevel: grade,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMatches(Array.isArray(data) ? data : []);
        setBookingId("booking-" + Date.now());
      } else {
        throw new Error("Failed to match");
      }
    } catch (e) {
      // Demo fallback if API not running or fails because of lack of teachers
      setMatches([
        { id: "t1", name: "Ahmed Hassan", subjects: ["Physics", "Mathematics"], distance_km: 0.74, match_score: 0.95, hourlyRate: 200, rating: 4.8, phone: "010-0123-4567" },
        { id: "t2", name: "Sara El-Sayed", subjects: ["Physics"], distance_km: 0.39, match_score: 0.82, hourlyRate: 180, rating: 4.5, phone: "011-1234-5678" },
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
    const color = pct >= 90 ? "var(--secondary)" : pct >= 70 ? "#eab308" : "#ef4444";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{pct}%</span>
      </div>
    );
  }

  function Sidebar() {
    const links = [
      { id: "home", label: "لوحة التحكم", icon: "◈" },
      { id: "request", label: "طلب جديد", icon: "⊕" },
      { id: "history", label: "جدول الحجوزات", icon: "☰" },
    ];
    // Convert SideBar to Horizontal TopBar
    return (
      <div style={{ padding: "1rem", display: "flex", gap: "1rem", overflowX: "auto", borderBottom: "1px solid #e2e8f0", marginBottom: "2rem" }}>
        {links.map(l => (
          <button key={l.id} onClick={() => setView(l.id)}
            className={view === l.id ? "btn-primary btn-small" : "btn-outline btn-small"}
            style={{ borderRadius: "100px", padding: "8px 16px", background: view !== l.id ? "transparent" : undefined, border: view !== l.id ? "1px solid #e2e8f0" : undefined, color: view !== l.id ? "#64748b" : undefined }}>
            <span style={{ fontSize: 16 }}>{l.icon}</span>
            {l.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {confirmedTeacher && (
          <button onClick={() => setView("chat")} className="btn-primary btn-small" style={{ borderRadius: "100px", background: "var(--secondary)" }}>
            التحدث مع {confirmedTeacher.name.split(" ")[0]}
          </button>
        )}
      </div>
    );
  }

  // ── Chat View (MVP) ──────────────────────
  function ChatView() {
    return (
      <div className="card" style={{ maxWidth: 600, padding: 0, height: "400px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontWeight: 700, color: "var(--primary)" }}>
          Conversation with {confirmedTeacher?.name}
        </div>
        <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", background: "white" }}>
          <div style={{ alignSelf: "flex-start", background: "#f1f5f9", color: "#334155", padding: "10px 14px", borderRadius: "12px", fontSize: "14px" }}>Hello! I have accepted the booking.</div>
          <div style={{ alignSelf: "flex-end", background: "var(--primary)", color: "white", padding: "10px 14px", borderRadius: "12px", fontSize: "14px" }}>Great, please bring your ID to the front gate.</div>
        </div>
        <div style={{ padding: "16px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "8px", background: "#f8fafc" }}>
          <input placeholder="Type message..." style={{ flex: 1, padding: "10px 16px", border: "1px solid #cbd5e1", borderRadius: "20px", outline: "none", fontFamily: "Cairo" }} />
          <button className="btn-primary" style={{ padding: "8px 20px", borderRadius: "20px" }}>Send</button>
        </div>
      </div>
    );
  }

  // ── Home View ────────────────────────────
  function HomeView() {
    const stats = [
      { label: "Sessions this month", value: "12" },
      { label: "Avg response time", value: "4 min" },
      { label: "Teacher pool", value: "38" },
      { label: "Satisfaction", value: "4.7 ★" },
    ];
    return (
      <div>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px" }}>Good morning</h1>
          <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: 0 }}>Monday, 13 April 2026 · IGCSE Calendar Week 15</p>
        </div>

        {/* Urgent CTA */}
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg, #eef2ff 0%, #ffffff 100%)", border: "1px solid #e0e7ff" }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px", color: "var(--primary)" }}>Need a substitute now?</p>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Find a vetted teacher in under 4 minutes</p>
          </div>
          <button onClick={() => setView("request")} className="btn-primary" style={{ padding: "10px 20px" }}>
            Request urgent sub →
          </button>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "2rem" }}>
          {stats.map(s => (
            <div key={s.label} className="card" style={{ padding: "1.2rem", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 8px", fontWeight: "600" }}>{s.label}</p>
              <p style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "var(--dark)" }}>{s.value}</p>
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

          <button onClick={handleFindMatch} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
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
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>Scanning {subject.replace("_", " ")} teachers near you…</p>
      </div>
    );

    if (confirmedTeacher) return (
      <div style={{ maxWidth: 480 }}>
        <div className="card" style={{ padding: "1.5rem", border: "2px solid var(--secondary)", background: "#ecfdf5", margin: "0 0 1.5rem", boxShadow: "0 10px 20px rgba(16, 185, 129, 0.1)" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--secondary)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "1px" }}>Booking confirmed</p>
          <p style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: "var(--dark)" }}>{confirmedTeacher.name}</p>
          <p style={{ fontSize: 14, color: "var(--dark)", margin: 0, fontWeight: "600" }}>{subject.replace("_", " ")} · {curriculum} · {duration}h · <span style={{ color: "var(--primary)" }}>{confirmedTeacher.hourly_rate * duration} EGP</span></p>
        </div>

        <div className="card" style={{ padding: "1.5rem", background: "white" }}>
          <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px", color: "var(--dark)" }}>QR check-in code</p>
          <p style={{ fontSize: 12, fontFamily: "monospace", color: "var(--primary)", wordBreak: "break-all", margin: "0 0 12px", padding: "12px", background: "#eef2ff", borderRadius: "8px", border: "1px dashed var(--primary)" }}>{qrPayload}</p>
          <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Show this code to the teacher when they arrive at the school gate.</p>
        </div>

        <button onClick={() => { setView("home"); setConfirmedTeacher(null); setMatches([]); }}
          className="btn-outline" style={{ marginTop: "1.5rem", width: "100%", justifyContent: "center" }}>
          Back to dashboard
        </button>
      </div>
    );

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 4px" }}>{matches.length} teacher{matches.length !== 1 ? "s" : ""} available</h1>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>{subject.replace("_", " ")} · {curriculum} · within 25 km</p>
          </div>
          <button onClick={() => setView("request")} className="btn-outline btn-small" style={{ fontSize: 12 }}>
            ← Change request
          </button>
        </div>

        {/* MOCK MAP VIEW PORTION */}
        <div className="card" style={{ width: "100%", height: "180px", background: "#f8fafc", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #cbd5e1", backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\"><circle cx=\"10\" cy=\"10\" r=\"2\" fill=\"%23e2e8f0\"/></svg>')", overflow: "hidden", position: "relative" }}>
          <span className="badge" style={{ position: "absolute", top: 12, left: 12 }}>Interactive Live Map</span>
          {matches.map((m, i) => (
            <div key={i} style={{ position: "absolute", top: `${20 + i * 15}%`, left: `${30 + i * 20}%`, width: "14px", height: "14px", background: "var(--secondary)", borderRadius: "50%", border: "2px solid white", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
          ))}
        </div>

        {matches.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-secondary)", fontSize: 14 }}>
            No teachers found for this subject and area. Try expanding your search or choosing a different subject.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {matches.map((t, i) => (
              <div key={t.id} className="card animate-fade-in" style={{ border: i === 0 ? "2px solid var(--secondary)" : undefined, padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: i === 0 ? "#ecfdf5" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: i === 0 ? "var(--secondary)" : "#64748b" }}>
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <Link href={`/teachers/${t.id}`} style={{ textDecoration: 'none' }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "var(--dark)", cursor: 'pointer' }}>{t.name}</p>
                      </Link>
                      <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{t.subjects?.join(" · ")} · {t.distance_km} km away</p>
                    </div>
                  </div>
                  {i === 0 && <span className="badge" style={{ background: "#ecfdf5", color: "var(--secondary)" }}>Best match</span>}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: 16 }}>
                  {[
                    { label: "Rate", val: `${t.hourly_rate} EGP/hr` },
                    { label: "Rating", val: `${t.rating} ★` },
                    { label: "Match", val: null, score: t.match_score },
                  ].map(cell => (
                    <div key={cell.label}>
                      <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 4px", fontWeight: "600" }}>{cell.label}</p>
                      {cell.score !== undefined ? <ScoreBar score={cell.score} /> : <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{cell.val}</p>}
                    </div>
                  ))}
                </div>

                <button onClick={() => confirmTeacher(t)}
                  className={i === 0 ? "btn-primary" : "btn-outline"} style={{ width: "100%", justifyContent: "center" }}>
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
            {["Subject", "Teacher", "Date", "Amount", "Payment", "Status", "Action"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "8px 0", fontSize: 11, color: "var(--color-text-tertiary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
              <td style={{ padding: "16px 0", fontWeight: "600" }}>{b.subject}</td>
              <td style={{ padding: "16px 0", color: "#64748b" }}>{b.teacher}</td>
              <td style={{ padding: "16px 0", color: "#64748b" }}>{b.date}</td>
              <td style={{ padding: "16px 0", fontWeight: "700", color: "var(--primary)" }}>{b.amount} EGP</td>
              <td style={{ padding: "16px 0" }}><span className="badge" style={{ background: b.status === "Pending" ? "#fef3c7" : "#e0e7ff", color: b.status === "Pending" ? "#d97706" : "var(--primary)" }}>{b.status === "Pending" ? "Pending" : "Fawry Paid"}</span></td>
              <td style={{ padding: "16px 0" }}><span className="badge" style={{ background: b.status === "Pending" ? "#fef3c7" : "#ecfdf5", color: b.status === "Pending" ? "#d97706" : "var(--secondary)" }}>{b.status}</span></td>
              <td style={{ padding: "16px 0" }}>
                <button style={{ fontSize: "11px", color: "#ef4444", background: "transparent", border: "1px solid #fee2e2", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", fontWeight: "600" }}>Open Dispute</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (!school) return <div style={{ textAlign: "center", padding: "5rem" }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>;

  return (
    <div style={{ minHeight: "100vh", fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", padding: "0 2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <Sidebar />
      <main style={{ paddingBottom: "4rem" }}>
        {view === "home" && <HomeView />}
        {view === "request" && <RequestView />}
        {view === "results" && <ResultsView />}
        {view === "chat" && <ChatView />}
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
