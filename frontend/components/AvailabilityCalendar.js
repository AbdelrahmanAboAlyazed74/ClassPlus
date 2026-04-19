import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';

export default function AvailabilityCalendar({ teacher, onBookDate }) {
  // A simplified UI representation of a calendar (For Phase 5 display)
  // Maps 0-6 to Sunday-Saturday
  const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  
  // Dummy generate 2 weeks dates
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d);
    }
    return dates;
  };

  const dates = generateDates();

  const isAvailable = (dateStr, dayName) => {
    if (teacher.blockedDates && teacher.blockedDates.includes(dateStr)) return false;
    return teacher.availableDays && teacher.availableDays.includes(dayName);
  };

  return (
    <div>
      <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 1rem', fontSize: '1.1rem' }}>
        <CalendarIcon color="var(--primary)" /> الأيام المتاحة للحجز (أسبوعين)
      </h4>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#475569' }}>
           <Clock size={18} color="var(--primary)" /> متاح من {teacher.availableFrom} إلى {teacher.availableTo}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
        {daysOfWeek.map(d => (
          <div key={d} style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#64748b', paddingBottom: '8px' }}>{d.substring(0,3)}</div>
        ))}
        
        {/* Placeholder for beginning of week offset */}
        {Array.from({ length: dates[0].getDay() }).map((_, i) => <div key={`empty-${i}`} />)}

        {dates.map((d, i) => {
          const dateStr = d.toISOString().split('T')[0];
          const dayName = daysOfWeek[d.getDay()];
          const available = isAvailable(dateStr, dayName);
          
          return (
            <div 
                key={i} 
                onClick={() => available && onBookDate && onBookDate(dateStr)}
                style={{ 
                    padding: '10px 0', 
                    borderRadius: '8px', 
                    border: '1px solid',
                    borderColor: available ? '#bbf7d0' : '#e2e8f0',
                    background: available ? '#f0fdf4' : '#f8fafc',
                    color: available ? '#166534' : '#94a3b8',
                    cursor: available ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    fontWeight: available ? 'bold' : 'normal'
                }}
            >
              <div style={{ fontSize: '1.1rem' }}>{d.getDate()}</div>
              {available && <div style={{ fontSize: '0.65rem', marginTop: '4px', background: '#22c55e', color: 'white', display: 'inline-block', padding: '2px 6px', borderRadius: '10px' }}>متاح</div>}
            </div>
          );
        })}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
        <AlertCircle size={16} /> يمكنك الضغط على اليوم المتاح لطلب الحجز
      </div>
    </div>
  );
}
