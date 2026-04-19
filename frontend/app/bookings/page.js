"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react';

const STATUS_MAP = {
  PENDING:   { label: 'قيد الانتظار', color: '#f59e0b', bg: '#fef9f0', icon: <AlertCircle size={14} /> },
  ACCEPTED:  { label: 'مقبول',        color: '#10b981', bg: '#f0fdf4', icon: <CheckCircle size={14} /> },
  COMPLETED: { label: 'مكتمل',        color: '#6366f1', bg: '#eef2ff', icon: <CheckCircle size={14} /> },
  CANCELLED: { label: 'ملغي',         color: '#ef4444', bg: '#fef2f2', icon: <XCircle size={14} /> },
};

export default function Bookings() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(u);
    if (u) {
      const all = JSON.parse(localStorage.getItem('mockBookings') || '[]');
      const mine = u.role === 'SCHOOL'
        ? all.filter(b => String(b.schoolId) === String(u.id))
        : all.filter(b => String(b.teacherId) === String(u.id));
      setBookings(mine.sort((a, b) => b.id - a.id));
    }
  }, []);

  const cancelBooking = (id) => {
    const all = JSON.parse(localStorage.getItem('mockBookings') || '[]');
    const updated = all.map(b => String(b.id) === String(id) ? { ...b, status: 'CANCELLED' } : b);
    localStorage.setItem('mockBookings', JSON.stringify(updated));
    setBookings(prev => prev.map(b => String(b.id) === String(id) ? { ...b, status: 'CANCELLED' } : b));
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '6rem', color: '#64748b' }}>
      <p>يجب <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>تسجيل الدخول</Link> أولاً</p>
    </div>
  );

  return (
    <div style={{ padding: '3rem 5%', minHeight: '80vh', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 6px' }}>
            <BookOpen size={28} color="var(--primary)" style={{ verticalAlign: 'middle', marginLeft: 8 }} />
            حجوزاتي
          </h1>
          <p style={{ color: '#64748b', margin: 0 }}>{bookings.length} حجز إجمالي</p>
        </div>

        {user.role === 'SCHOOL' && (
          <Link href="/search" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Search size={18} /> ابحث عن معلم جديد
          </Link>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: '2rem' }}>
        {[
          { label: 'الكل',         count: bookings.length,                                      color: 'var(--primary)', bg: '#eef2ff', key: 'ALL' },
          { label: 'قيد الانتظار', count: bookings.filter(b => b.status === 'PENDING').length,  color: '#f59e0b', bg: '#fef9f0', key: 'PENDING' },
          { label: 'مقبول',        count: bookings.filter(b => b.status === 'ACCEPTED').length, color: '#10b981', bg: '#f0fdf4', key: 'ACCEPTED' },
          { label: 'مكتمل',        count: bookings.filter(b => b.status === 'COMPLETED').length,color: '#6366f1', bg: '#eef2ff', key: 'COMPLETED' },
        ].map(s => (
          <div key={s.key} onClick={() => setFilter(s.key)} className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '1rem', background: filter === s.key ? s.bg : 'white', border: filter === s.key ? `2px solid ${s.color}` : '1px solid #e2e8f0', transition: 'all 0.2s' }}>
            <p style={{ fontSize: '1.8rem', fontWeight: '800', color: s.color, margin: '0 0 4px' }}>{s.count}</p>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <BookOpen size={48} color="#e2e8f0" style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: 0 }}>لا توجد حجوزات في هذه الفئة</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['المعلم', 'التاريخ', 'الوقت', 'المدة', 'الحالة', 'إجراء'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '600', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const s = STATUS_MAP[b.status] || { label: b.status, color: '#94a3b8', bg: '#f1f5f9', icon: null };
                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px', fontWeight: '600' }}>{b.teacherName || `معلم #${b.teacherId}`}</td>
                      <td style={{ padding: '14px', color: '#64748b' }}>{b.classDate}</td>
                      <td style={{ padding: '14px', color: '#64748b' }}>{b.classTime}</td>
                      <td style={{ padding: '14px', color: '#64748b' }}>{b.expectedDurationHours}ساعة</td>
                      <td style={{ padding: '14px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: s.bg, color: s.color, padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: '700' }}>
                          {s.icon} {s.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px' }}>
                        {b.status === 'PENDING' && (
                          <button onClick={() => cancelBooking(b.id)} style={{ background: 'none', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Cairo, sans-serif', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                            إلغاء
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
