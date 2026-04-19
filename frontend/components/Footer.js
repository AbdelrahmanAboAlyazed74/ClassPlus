"use client";
import React from 'react';
import Link from 'next/link';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#94a3b8',
      padding: '4rem 5% 2rem',
      marginTop: '4rem',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
        
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
            <GraduationCap size={28} color="#818cf8" />
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: '800', color: 'white' }}>
              Class <span style={{ background: 'linear-gradient(135deg, #818cf8, #10b981)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Plus</span>
            </span>
          </div>
          <p style={{ lineHeight: '1.7', fontSize: '0.9rem' }}>
            المنصة الأولى في مصر لربط المدارس بأفضل المعلمين البديلين المؤهلين والموثقين.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: '1.2rem' }}>
            {['𝕏', 'in', 'f'].map(icon => (
              <div key={icon} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s', fontWeight: '700', color: '#cbd5e1' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(129,140,248,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}>
                {icon}
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h3 style={{ color: 'white', fontWeight: '700', marginBottom: '1rem', fontSize: '1rem' }}>روابط سريعة</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'الرئيسية', href: '/' },
              { label: 'البحث عن معلمين', href: '/search' },
              { label: 'تسجيل الدخول', href: '/login' },
              { label: 'حساب جديد', href: '/register' },
              { label: 'حجوزاتي', href: '/bookings' },
            ].map(l => (
              <li key={l.href}>
                <Link href={l.href} style={{ textDecoration: 'none', color: '#94a3b8', fontSize: '0.9rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#818cf8'}
                  onMouseLeave={e => e.target.style.color = '#94a3b8'}>
                  ← {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* For schools */}
        <div>
          <h3 style={{ color: 'white', fontWeight: '700', marginBottom: '1rem', fontSize: '1rem' }}>للمدارس</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['طلب معلم فوري', 'كيف يعمل النظام؟', 'التسعير والباقات', 'الأسئلة الشائعة', 'سياسة الخصوصية'].map(label => (
              <li key={label}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#10b981'}
                  onMouseLeave={e => e.target.style.color = '#94a3b8'}>
                  ← {label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 style={{ color: 'white', fontWeight: '700', marginBottom: '1rem', fontSize: '1rem' }}>تواصل معنا</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0, fontSize: '0.88rem' }}>
              <Mail size={16} color="#818cf8" /> info@classplus.eg
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0, fontSize: '0.88rem' }}>
              <Phone size={16} color="#818cf8" /> 19XXX
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0, fontSize: '0.88rem' }}>
              <MapPin size={16} color="#818cf8" /> القاهرة الجديدة، مصر
            </p>
          </div>

          {/* Newsletter */}
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.85rem', marginBottom: 8, color: '#cbd5e1' }}>اشترك في نشرتنا البريدية</p>
            <div style={{ display: 'flex', gap: 6 }}>
              <input placeholder="بريدك الإلكتروني" style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: 'white', outline: 'none', fontSize: '0.82rem', fontFamily: 'Cairo, sans-serif' }} />
              <button style={{ padding: '9px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #818cf8, #10b981)', color: 'white', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', fontFamily: 'Cairo, sans-serif' }}>اشترك</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ margin: 0, fontSize: '0.82rem' }}>© {new Date().getFullYear()} Class Plus. جميع الحقوق محفوظة.</p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['الشروط والأحكام', 'سياسة الخصوصية', 'ملفات تعريف الارتباط'].map(label => (
            <span key={label} style={{ fontSize: '0.78rem', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#818cf8'}
              onMouseLeave={e => e.target.style.color = '#94a3b8'}>
              {label}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
