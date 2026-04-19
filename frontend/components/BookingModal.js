import React, { useState } from 'react';
import { X, Calendar, Clock, BookOpen, CheckCircle } from 'lucide-react';

export default function BookingModal({ teacher, onClose }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    // Get School ID from logged user
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'SCHOOL') {
      setStatus('error');
      setErrorMsg('يجب تسجيل الدخول كحساب (مدرسة) حتى تتمكن من إرسال طلب تعاقد مع المعلم.');
      return;
    }

    try {
      // For now we will just use the mock bookings API by posting to the Next.js API or local storage
      // In a real scenario we'd do a fetch POST. 
      // Since NEXT API match returns booking_id and expects checkin, we will mock the booking for the dashboard.
      const bookings = JSON.parse(localStorage.getItem('mockBookings') || '[]');
      bookings.push({ id: Date.now(), schoolId: user.id, teacherId: String(teacher.id), teacherName: teacher.name, classDate: date, classTime: time + ":00", expectedDurationHours: duration, status: 'PENDING' });
      localStorage.setItem('mockBookings', JSON.stringify(bookings));
      
      setStatus('success');
      setTimeout(() => onClose(), 3500);
    } catch (err) {
      console.error('Booking error:', err);
      setStatus('error');
      setErrorMsg('خطأ في إرسال الطلب: ' + (err.message || 'خطأ غير معروف'));
    }
  };

  return (
    <div className="animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', position: 'relative', animation: 'fadeIn 0.3s ease-out', border: 'none', padding: '2.5rem' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', left: '16px', background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}>
          <X size={18} />
        </button>
        
        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ background: '#ecfdf5', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={40} color="var(--secondary)" />
            </div>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '8px', color: 'var(--secondary)' }}>تم إرسال الطلب بنجاح!</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6' }}>سيتم التواصل معك فور مراجعة المعلم <strong>{teacher.name}</strong> لطلبكم وتأكيده.</p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              طلب تعاقد مع <span className="gradient-text">{teacher.name}</span>
            </h2>
            
            {status === 'error' && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.95rem', fontWeight: 'bold' }}>{errorMsg}</div>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>تاريخ الحصة المطلوبة</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={20} style={{ position: 'absolute', right: '12px', top: '12px', color: '#94a3b8' }} />
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ width: '100%', padding: '12px 40px 12px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border 0.3s' }} />
                </div>
              </div>
              
              <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>وقت البدء</label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={20} style={{ position: 'absolute', right: '12px', top: '12px', color: '#94a3b8' }} />
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required style={{ width: '100%', padding: '12px 40px 12px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>المدة المتوقعة</label>
                  <div style={{ position: 'relative' }}>
                    <BookOpen size={20} style={{ position: 'absolute', right: '12px', top: '12px', color: '#94a3b8' }} />
                    <select value={duration} onChange={(e) => setDuration(e.target.value)} style={{ width: '100%', padding: '12px 40px 12px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}>
                      <option value="1">ساعة واحدة</option>
                      <option value="2">ساعتان</option>
                      <option value="3">3 ساعات</option>
                      <option value="4">4 ساعات</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '8px', marginTop: '0.8rem', border: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', color: '#64748b' }}>إجمالي التكلفة التقديرية</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>{teacher.hourlyRate * duration} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: '600' }}>ج.م</span></span>
              </div>

              <button type="submit" disabled={status === 'loading'} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '14px' }}>
                {status === 'loading' ? 'جاري الإرسال وعمل التعاقد...' : 'تأكيد إرسال الطلب'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
