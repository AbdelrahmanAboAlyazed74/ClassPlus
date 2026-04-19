"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Dashboard() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      if (parsedUser.role !== 'TEACHER') {
        router.push('/');
      } else {
        setUser(parsedUser);
        fetchRequests(parsedUser.id);
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchRequests = async (teacherId) => {
    try {
      const res = await fetch(`http://localhost:5218/api/Booking?userId=${teacherId}&role=TEACHER`);
      if (res.ok) {
        const bookings = await res.json();
        setRequests(bookings);
      } else {
        throw new Error("Failed to load");
      }
    } catch (err) {
      console.warn("Backend unavailable, falling back to mock:", err);
      const bookings = JSON.parse(localStorage.getItem('mockBookings') || '[]');
      const teacherBookings = bookings.filter(b => String(b.teacherId) === String(teacherId));
      setRequests(teacherBookings);
    }
  };

  const handleAccept = async (bookingId) => {
    try {
      const res = await fetch(`http://localhost:5218/api/Booking/${bookingId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACCEPTED" })
      });
      
      if (res.ok) {
         setRequests(requests.map(b => String(b.id) === String(bookingId) ? { ...b, status: 'ACCEPTED' } : b));
      } else {
         throw new Error();
      }
    } catch (err) {
      console.warn("API failed, falling back to mock");
      const bookings = JSON.parse(localStorage.getItem('mockBookings') || '[]');
      const updated = bookings.map(b => String(b.id) === String(bookingId) ? { ...b, status: 'ACCEPTED' } : b);
      localStorage.setItem('mockBookings', JSON.stringify(updated));
      setRequests(updated.filter(b => String(b.teacherId) === String(user.id)));
    }
  };

  if (!user) return <div style={{ textAlign: 'center', padding: '5rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>;

  return (
    <div style={{ padding: '2rem 5%', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{t('dash_welcome')} {user.fullName}</h1>
          <p style={{ color: '#64748b' }}>{t('dash_desc')}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#64748b', fontSize: '1rem', marginBottom: '8px' }}>{t('dash_pending')}</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
            {requests.filter(r => r.status === 'PENDING').length}
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#64748b', fontSize: '1rem', marginBottom: '8px' }}>{t('dash_confirmed')}</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>
            {requests.filter(r => r.status === 'ACCEPTED').length}
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#64748b', fontSize: '1rem', marginBottom: '8px' }}>{t('dash_rating')}</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>4.8/5</p>
        </div>
      </div>

      <div className="card" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{t('dash_latest')}</h3>

        {requests.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>{t('dash_no_reqs')}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#334155' }}>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>{t('dash_th_school')}</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>{t('dash_th_date')}</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>{t('dash_th_time')}</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>{t('dash_th_dur')}</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>{t('dash_th_status')}</th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>{t('dash_th_action')}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(request => (
                  <tr key={request.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px', fontWeight: 'bold' }}>#{request.schoolId}</td>
                    <td style={{ padding: '16px' }}>{request.classDate}</td>
                    <td style={{ padding: '16px' }}>{request.classTime}</td>
                    <td style={{ padding: '16px' }}>{request.expectedDurationHours} {t('dash_hr')}</td>
                    <td style={{ padding: '16px', fontWeight: 'bold', color: request.status === 'PENDING' ? '#f59e0b' : '#10b981' }}>
                      {request.status === 'PENDING' ? t('dash_status_pending') : t('dash_status_confirmed')}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {request.status === 'PENDING' ? (
                        <button
                          onClick={() => handleAccept(request.id)}
                          style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <CheckCircle size={16} /> {t('dash_btn_accept')}
                        </button>
                      ) : (
                        <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={16} /> {t('dash_btn_accepted')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
