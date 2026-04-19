"use client";
import React from 'react';
import Link from 'next/link';
import { Search, Users, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div>
      <section className="hero" style={{ textAlign: 'center', margin: '4rem 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }} className="animate-fade-in glass-panel">
          <div className="slogan-badge">
            <span style={{ fontSize: '1.4rem' }}>✨</span> {t('slogan')}
          </div>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '24px', lineHeight: '1.2' }}>
            {t('hero_title_1')} <br/><span className="gradient-text">{t('hero_title_2')}</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '2rem', lineHeight: '1.8' }}>
            {t('hero_desc')}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link href="/search" className="btn-primary">
              <Search size={20} />
              {t('btn_search_now')}
            </Link>
            <Link href="/register" className="btn-outline">
              {t('btn_join_teacher')}
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '5rem 5%', background: 'transparent' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem' }}>{t('features_title')}</h2>
        
        <div className="grid grid-cols-3">
          <div className="card animate-fade-in delay-1" style={{ textAlign: 'center' }}>
            <div style={{ background: '#e0e7ff', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Users size={32} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>{t('feat_1_title')}</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6' }}>{t('feat_1_desc')}</p>
          </div>

          <div className="card animate-fade-in delay-2" style={{ textAlign: 'center' }}>
            <div style={{ background: '#d1fae5', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ShieldCheck size={32} color="var(--secondary)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>{t('feat_2_title')}</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6' }}>{t('feat_2_desc')}</p>
          </div>

          <div className="card animate-fade-in delay-1" style={{ textAlign: 'center' }}>
            <div style={{ background: '#fef3c7', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Zap size={32} color="#d97706" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>{t('feat_3_title')}</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6' }}>{t('feat_3_desc')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
