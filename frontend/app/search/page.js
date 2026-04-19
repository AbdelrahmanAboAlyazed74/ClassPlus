"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, Filter, Star, Briefcase, DollarSign, CheckCircle, MapPin, Calendar } from 'lucide-react';
import BookingModal from '../../components/BookingModal';
import { useLanguage } from '../../context/LanguageContext';

export default function Search() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("الكل");
  const [cityFilter, setCityFilter] = useState("الكل");
  const [expFilter, setExpFilter] = useState(0); // minimum experience

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [allTeachers, setAllTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch('http://localhost:5218/api/Teacher');
        if (response.ok) {
          const data = await response.json();
          // The API returns dates/properties that need normalization before display if needed.
          // But our properties map exactly to what the UI needs based on the DTO.
          const formatted = data.map(t => ({
            ...t,
            city: t.city || "القاهرة",
            days: ['السبت', 'الأحد', 'الإثنين'] // default fallback for mock ui presentation
          }));
          setAllTeachers(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch from backend", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const filteredTeachers = allTeachers.filter((teacher) => {
    const matchesSearch = teacher.name.includes(searchTerm) || teacher.specialty.includes(searchTerm);
    const matchesSpecialty = specialtyFilter === "الكل" || teacher.specialty === specialtyFilter;
    const matchesCity = cityFilter === "الكل" || teacher.city === cityFilter;
    const matchesExp = teacher.experience >= expFilter;
    return matchesSearch && matchesSpecialty && matchesCity && matchesExp;
  });

  return (
    <div style={{ padding: '3rem 5%', minHeight: '80vh' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{t('search_title')} <span className="gradient-text">{t('search_highlight')}</span></h1>
        <p style={{ color: '#64748b' }}>{t('search_desc')}</p>
      </div>

      <div className="card" style={{ marginBottom: '3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <SearchIcon size={20} style={{ position: 'absolute', right: '12px', top: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 40px 12px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: 'white' }}>
            <option value="الكل">جميع المواد</option>
            <option value="رياضيات">{t('math')} / رياضيات</option>
            <option value="لغة إنجليزية">{t('english')} / إنجليزي</option>
            <option value="فيزياء">{t('physics')} / فيزياء</option>
            <option value="أحياء">أحياء</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: 'white' }}>
            <option value="الكل">كل المحافظات</option>
            <option value="القاهرة">القاهرة</option>
            <option value="الجيزة">الجيزة</option>
            <option value="الأسكندرية">الأسكندرية</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.9rem', color: '#475569' }}>أقل خبرة: <strong style={{ color: 'var(--primary)' }}>{expFilter}</strong> سنوات</span>
          <input type="range" min="0" max="20" value={expFilter} onChange={(e) => setExpFilter(parseInt(e.target.value))} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
      ) : (
        <div className="grid grid-cols-3">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link href={`/teachers/${teacher.id}`} style={{ color: 'var(--dark)', textDecoration: 'none' }}>
                      {teacher.name}
                    </Link>
                    {teacher.isVerified && <CheckCircle size={18} color="#10b981" fill="white" />}
                  </h3>
                  <span className="badge">{teacher.specialty}</span>
                </div>
              </div>

              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', flexGrow: 1, marginBottom: '16px' }}>{teacher.bio}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem' }}>
                  <Briefcase size={16} color="var(--primary)" /> {teacher.experience} {t('years_exp')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem' }}>
                  <MapPin size={16} color="var(--primary)" /> {teacher.city}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  <Star size={16} fill="#f59e0b" /> {teacher.rating}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  <DollarSign size={16} /> {teacher.hourlyRate} {t('currency')}/س
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                {teacher.days.map(d => (
                  <span key={d} style={{ background: '#ecfdf5', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {d}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Link href={`/teachers/${teacher.id}`} className="btn-outline" style={{ flex: 1, justifyContent: 'center', textAlign: 'center', padding: '10px' }}>
                  الملف الكامل
                </Link>
                <button onClick={() => setSelectedTeacher(teacher)} className="btn-primary" style={{ flex: 1.5, justifyContent: 'center', padding: '10px' }}>
                  {t('req_contract')}
                </button>
              </div>
            </div>
          ))}
          {filteredTeachers.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              {t('no_results')}
            </div>
          )}
        </div>
      )}

      {selectedTeacher && (
        <BookingModal
          teacher={selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
        />
      )}
    </div>
  );
}
