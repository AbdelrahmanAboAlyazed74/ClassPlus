"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, CheckCircle, Mail, IdCard, Camera, BookOpen, Star, Phone, Activity } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Profile() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const u = JSON.parse(loggedInUser);
      setUser(u);
      const all = JSON.parse(localStorage.getItem('mockBookings') || '[]');
      if (u.role === 'TEACHER') {
        setBookings(all.filter(b => String(b.teacherId) === String(u.id)));
      } else {
        setBookings(all.filter(b => String(b.schoolId) === String(u.id)));
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userChanged'));
    router.push('/login');
  };

  const computeProfileStrength = (u) => {
    let score = 0;
    const tips = [];

    if (u.photoURL) score += 10; else tips.push('صورة شخصية (+10)');
    if (u.bio) score += 10; else tips.push('نبذة شخصية (+10)');
    if (u.phone) score += 5; else tips.push('رقم الهاتف (+5)');
    
    if (u.subjects && u.subjects.length > 0) {
      score += 10;
      if (u.subjects.length >= 3) score += 10;
    } else {
      tips.push('مواد التدريس (+10)');
    }

    if (u.workHistory && u.workHistory.length > 0) {
      score += 15;
      if (u.workHistory.length >= 2) score += 10;
    } else {
      tips.push('سجل العمل (+15)');
    }

    // Default assumes cv is missing since we mocked it
    tips.push('سيرة ذاتية (+15)');
    tips.push('شهادة معتمدة (+5)');
    
    if (u.availableDays && u.availableDays.length > 0) score += 5; else tips.push('أيام التوافر (+5)');
    if (u.hourlyRate) score += 5; else tips.push('سعر الحصة (+5)');

    return { strength: Math.min(score, 100), tips: tips.slice(0, 3) };
  };

  if (!user) return <div style={{ textAlign: 'center', padding: '5rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>;

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  const statusColor = { PENDING: '#f59e0b', ACCEPTED: '#10b981', CONFIRMED: '#10b981', COMPLETED: '#6366f1', CANCELLED: '#ef4444' };

  const { strength, tips } = user.role === 'TEACHER' ? computeProfileStrength(user) : { strength: 100, tips: [] };

  return (
    <div style={{ padding: '3rem 5%', minHeight: '80vh', maxWidth: 900, margin: '0 auto' }}>
      
      {user.role === 'TEACHER' && (
        <div className="card animate-fade-in" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(to right, #f8fafc, #fff)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="var(--primary)" /> قوة الملف الشخصي
            </h3>
            <span style={{ fontWeight: '800', color: strength >= 80 ? '#10b981' : 'var(--primary)' }}>{strength}%</span>
          </div>
          
          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ 
              height: '100%', 
              width: `${strength}%`, 
              background: strength >= 80 ? '#10b981' : 'var(--primary)',
              transition: 'width 1s ease-out'
            }} />
          </div>
          
          {tips.length > 0 && (
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#64748b' }}>أكمل بياناتك للحصول على المزيد من طلبات المدارس:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {tips.map((tip, i) => (
                  <span key={i} style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    + {tip}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Profile Card ── */}
      <div className="card animate-fade-in delay-1" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', padding: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flexShrink: 0, position: 'relative' }}>
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.fullName} style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', border: '4px solid #e0e7ff' }} />
          ) : (
            <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '2rem', border: '4px solid #e0e7ff' }}>
              {getInitials(user.fullName)}
            </div>
          )}
          {user.role === 'TEACHER' && strength >= 80 && (
            <div style={{ position: 'absolute', bottom: 5, right: 0, background: 'white', borderRadius: '50%', padding: '2px' }} title="حساب موثق">
              <CheckCircle size={24} color="#10b981" fill="white" />
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
            <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: '800' }}>{user.fullName}</h2>
            <span className="badge" style={{ fontSize: '0.85rem' }}>
              {user.role === 'TEACHER' ? `👨‍🏫 ${t('prof_teacher')}` : `🏫 ${t('prof_school')}`}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '12px 0', color: '#475569', fontSize: '0.9rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={16} color="var(--primary)" /> {user.email}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IdCard size={16} color="var(--primary)" /> {user.nationalId}</span>
            {user.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={16} color="var(--primary)" /> {user.phone}</span>}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: '1rem', flexWrap: 'wrap' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 14px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: '800', fontSize: '1.3rem', color: 'var(--secondary)' }}>{bookings.filter(b => b.status === 'ACCEPTED' || b.status === 'CONFIRMED' || b.status === 'COMPLETED').length}</p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>حجوزات مكتملة</p>
            </div>
            <div style={{ background: '#fef9f0', border: '1px solid #fed7aa', borderRadius: 8, padding: '8px 14px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: '800', fontSize: '1.3rem', color: '#f59e0b' }}>{bookings.filter(b => b.status === 'PENDING').length}</p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>قيد الانتظار</p>
            </div>
          </div>
        </div>

        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px solid #fca5a5', borderRadius: 8, padding: '8px 16px', color: '#ef4444', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: '0.9rem', fontWeight: '600', transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <LogOut size={16} /> {t('prof_logout')}
        </button>
      </div>

      {user.role === 'TEACHER' && user.subjects && user.subjects.length > 0 && (
        <div className="card animate-fade-in delay-2" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 1rem' }}>معلوماتي الأكاديمية</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {user.subjects.map(s => (
              <span key={s} style={{ background: '#e0e7ff', color: 'var(--primary)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Bookings ── */}
      <div className="card animate-fade-in delay-2" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={20} color="var(--primary)" />
          {user.role === 'TEACHER' ? 'طلبات الحجز الواردة' : 'حجوزاتي'}
        </h3>

        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <BookOpen size={40} color="#e2e8f0" style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: 0 }}>{t('dash_no_reqs')}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['المعلم / المدرسة', 'التاريخ', 'الوقت', 'المدة', 'الحالة'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '600', fontSize: '0.82rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px', fontWeight: '600' }}>{user.role === 'TEACHER' ? `#${b.schoolId}` : b.teacherName}</td>
                    <td style={{ padding: '14px', color: '#64748b' }}>{b.classDate}</td>
                    <td style={{ padding: '14px', color: '#64748b' }}>{b.classTime}</td>
                    <td style={{ padding: '14px', color: '#64748b' }}>{b.expectedDurationHours} ساعة</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ background: `${statusColor[b.status] || '#94a3b8'}20`, color: statusColor[b.status] || '#94a3b8', padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: '700' }}>
                        ● {b.status === 'PENDING' ? 'قيد الانتظار' : b.status === 'ACCEPTED' ? 'مقبول' : b.status === 'COMPLETED' ? 'مكتمل' : b.status}
                      </span>
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
