"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Star, MapPin, Briefcase, DollarSign, CheckCircle, GraduationCap, Award, MessageSquare, Building } from 'lucide-react';
import BookingModal from '../../../components/BookingModal';
import AvailabilityCalendar from '../../../components/AvailabilityCalendar';

export default function TeacherProfile() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const API = "http://localhost:5218";

  useEffect(() => {
    if (!id) return;
    const fetchTeacher = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API}/api/Teacher/${id}`);
        if (response.ok) {
          const data = await response.json();
          setTeacher(data);
        }
      } catch (err) {
        console.error("Failed to fetch teacher", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '6rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>;
  if (!teacher) return <div style={{ textAlign: 'center', padding: '6rem' }}>عذراً، لم يتم العثور على المعلم.</div>;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', padding: '4rem 5% 6rem', color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          {teacher.name}
          {teacher.isVerified && <CheckCircle size={28} color="#10b981" fill="white" title="حساب موثق" />}
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, margin: 0 }}>مدرس {teacher.specialty} محترف</p>
      </div>

      <div style={{ padding: '0 5%', maxWidth: '1000px', margin: '-4rem auto 0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Profile Header Card */}
        <div className="card" style={{ padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ marginTop: '-4rem', position: 'relative' }}>
            <img src={teacher.avatar} alt={teacher.name} style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', border: '6px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}><Briefcase color="var(--primary)" /> <b>{teacher.experience}</b> سنوات الخبرة</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}><MapPin color="var(--primary)" /> <b>{teacher.city}</b></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}><Star fill="#f59e0b" /> <b>{teacher.rating}</b> التقييم</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}><DollarSign /> <b>{teacher.hourlyRate}</b> ج.م / ساعة</div>
            </div>

            <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '1.05rem', margin: 0 }}>{teacher.bio}</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '180px' }}>
            <button onClick={() => setIsBookingModalOpen(true)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
              حجز موعد الآن
            </button>
            <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px' }}>
              <MessageSquare size={18} /> تواصل معي
            </button>
          </div>
        </div>

        {/* Tabs & Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
          <div className="card" style={{ padding: '0' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', overflowX: 'auto' }}>
              {['overview', 'availability', 'reviews'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  style={{ 
                    flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '700', fontSize: '1rem',
                    color: activeTab === tab ? 'var(--primary)' : '#64748b',
                    borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
                    transition: 'all 0.2s'
                  }}>
                  {tab === 'overview' ? 'نظرة عامة' : tab === 'availability' ? 'التقويم والتوافر' : 'المراجعات'}
                </button>
              ))}
            </div>

            <div style={{ padding: '2rem' }}>
              {activeTab === 'overview' && (
                <div className="animate-fade-in">
                  <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                    <GraduationCap color="var(--primary)" /> المؤهل العلمي
                  </h3>
                  <p style={{ color: '#475569', fontSize: '1rem', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    {teacher.education}
                  </p>

                  <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px', margin: '2rem 0 1.5rem' }}>
                    <Briefcase color="var(--primary)" /> سجل العمل
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {teacher.workHistory.map((w, i) => (
                      <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                          <Building size={20} />
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>{w.schoolName}</h4>
                          <p style={{ margin: '0 0 6px', color: '#64748b', fontSize: '0.9rem' }}>{w.position}</p>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold' }}>{w.startYear} - {w.endYear}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px', margin: '2rem 0 1.5rem' }}>
                     <Award color="var(--primary)" /> الشهادات والاعتمادات
                  </h3>
                  <ul style={{ paddingRight: '1.5rem', margin: 0, color: '#475569' }}>
                    {teacher.certifications.map((c, i) => (
                      <li key={i} style={{ marginBottom: '8px' }}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'availability' && (
                <div className="animate-fade-in">
                  <AvailabilityCalendar 
                    teacher={teacher} 
                    onBookDate={(date) => {
                      // Pass to booking modal
                      setIsBookingModalOpen(true);
                    }} 
                  />
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="animate-fade-in" style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
                  <Star size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p>لا توجد مراجعات حتى الآن.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Profile Strength Widget for Owner only (Hidden on public view typically, but illustrative here) */}
          <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(to bottom, #f8fafc, white)' }}>
            <h4 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#334155' }}>معلومات إضافية</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#475569', fontSize: '0.95rem' }}>
               <div><b>وقت الاستجابة:</b> خلال ساعة</div>
               <div><b>إلغاء الحجز:</b> متاح قبل 24 ساعة</div>
               <div><b>نطاق العمل:</b> {teacher.city} وضواحيها</div>
            </div>
          </div>
        </div>

      </div>

      {isBookingModalOpen && (
        <BookingModal 
          teacher={teacher} 
          onClose={() => setIsBookingModalOpen(false)} 
        />
      )}
    </div>
  );
}
