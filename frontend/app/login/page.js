"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Login() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:5218/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('userChanged'));
        if (data.user.role === 'SCHOOL') {
          router.push('/school-dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'البريد الإلكتروني أو كلمة المرور خاطئة!');
      }
    } catch (err) {
      console.warn('Backend unavailable, falling back to mock...');
      // MOCK FALLBACK
      const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      const user = mockUsers.find(u => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new Event('userChanged'));
        if (user.role === 'SCHOOL') {
          router.push('/school-dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        if (email === 'school@naib.com' && password === '123456') {
            const defaultSchool = { id: 'school-001', role: 'SCHOOL', fullName: 'Cairo American College', email: 'school@naib.com' };
            localStorage.setItem('user', JSON.stringify(defaultSchool));
            window.dispatchEvent(new Event('userChanged'));
            router.push('/school-dashboard');
            return;
        }
        setError('بيانات الدخول غير صحيحة');
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem' }}>
      <div className="card animate-fade-in" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: '#e0e7ff', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <LogIn size={32} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 8px 0' }}>{t('login_title')} <span className="gradient-text">{t('login_highlight')}</span></h2>
          <p style={{ color: '#64748b', margin: 0 }}>{t('login_desc')}</p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('email_label')}</label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{ position: 'absolute', right: '12px', top: '12px', color: '#94a3b8' }} />
              <input 
                type="email" 
                placeholder={t('email_placeholder')} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 40px 12px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: '600' }}>{t('password_label')}</label>
              <Link href="#" style={{ fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'none' }}>{t('forgot_pass')}</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', right: '12px', top: '12px', color: '#94a3b8' }} />
              <input 
                type="password" 
                placeholder={t('pass_placeholder')} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 40px 12px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            {t('btn_login')}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#64748b', marginTop: '2rem', fontSize: '0.95rem' }}>
          {t('no_account')} <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>{t('register_here')}</Link>
        </p>
      </div>
    </div>
  );
}
