"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, LogOut, ChevronDown, User, LayoutDashboard, Building2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const syncUser = () => {
      const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
      setUser(savedUser);
    };
    syncUser();
    window.addEventListener('storage', syncUser);
    window.addEventListener('userChanged', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('userChanged', syncUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setDropdownOpen(false);
    window.dispatchEvent(new Event('userChanged'));
    router.push('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1rem 5%', background: '#fff',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      position: 'sticky', top: 0, zIndex: 200,
    }}>
      {/* Logo */}
      <div className="logo-container">
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GraduationCap color="var(--primary)" size={32} />
          <span style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {t('logo_class')} <span className="gradient-text">{t('logo_plus')}</span>
          </span>
        </Link>
        <div className="lang-toggle lang-toggle-small" onClick={() => setLang(lang === 'AR' ? 'EN' : 'AR')}>
          <button className={`lang-btn lang-btn-small ${lang === 'AR' ? 'active' : ''}`}>AR</button>
          <button className={`lang-btn lang-btn-small ${lang === 'EN' ? 'active' : ''}`}>EN</button>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>

        {/* Search teachers link always visible */}
        <Link href="/search" style={{ textDecoration: 'none', color: '#475569', fontWeight: '600', fontSize: '0.95rem', transition: 'color 0.2s' }}
          onMouseEnter={e => e.target.style.color = 'var(--primary)'}
          onMouseLeave={e => e.target.style.color = '#475569'}
        >
          {t('search_teachers')}
        </Link>

        {user ? (
          /* ── Logged-in: avatar dropdown ── */
          <>
            {/* School Dashboard quick-link pill */}
            {user.role === 'SCHOOL' && (
              <Link href="/school-dashboard"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 18px', borderRadius: '40px',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  color: 'white', textDecoration: 'none',
                  fontWeight: '700', fontSize: '0.88rem',
                  boxShadow: '0 4px 12px rgba(79,70,229,0.25)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(79,70,229,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.25)'; }}
              >
                <Building2 size={15} />
                لوحة التحكم
              </Link>
            )}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: 'none', border: '1.5px solid #e2e8f0',
                  borderRadius: '40px', padding: '6px 14px 6px 6px',
                  cursor: 'pointer', transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                {/* Avatar */}
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.fullName}
                    style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0,
                  }}>
                    {getInitials(user.fullName)}
                  </div>
                )}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.fullName}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8' }}>
                    {user.role === 'TEACHER' ? t('prof_teacher') : t('prof_school')}
                  </p>
                </div>
                <ChevronDown size={16} color="#94a3b8" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                  background: 'white', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  border: '1px solid #e2e8f0', minWidth: 200, overflow: 'hidden', zIndex: 300,
                  animation: 'fadeIn 0.15s ease',
                }}>
                  <Link href="/profile" onClick={() => setDropdownOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', textDecoration: 'none', color: '#1e293b', fontSize: '0.9rem', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <User size={16} color="var(--primary)" /> {t('prof_title')} {t('prof_highlight')}
                  </Link>

                  {user.role === 'TEACHER' && (
                    <Link href="/dashboard" onClick={() => setDropdownOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', textDecoration: 'none', color: '#1e293b', fontSize: '0.9rem', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <LayoutDashboard size={16} color="var(--primary)" /> {t('teacher_dashboard')}
                    </Link>
                  )}

                  {user.role === 'SCHOOL' && (
                    <Link href="/school-dashboard" onClick={() => setDropdownOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', textDecoration: 'none', color: '#1e293b', fontSize: '0.9rem', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <Building2 size={16} color="var(--secondary)" /> لوحة تحكم المدرسة
                    </Link>
                  )}

                  <div style={{ borderTop: '1px solid #e2e8f0' }} />

                  <button onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'none', border: 'none', color: '#ef4444', fontSize: '0.9rem', cursor: 'pointer', width: '100%', textAlign: 'right', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <LogOut size={16} /> {t('prof_logout')}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* ── Logged-out: login / register ── */
          <div className="auth-buttons-container">
            <Link href="/login" className="btn-outline btn-small">{t('login')}</Link>
            <Link href="/register" className="btn-primary btn-small">{t('register')}</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
