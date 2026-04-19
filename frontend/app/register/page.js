"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Building, GraduationCap, IdCard, Camera, CheckCircle, Phone, BookOpen, Clock, MapPin, DollarSign } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import SubjectSelector from '../../components/SubjectSelector';
import WorkHistoryForm from '../../components/WorkHistoryForm';
import { useDropzone } from 'react-dropzone';

function StepIndicator({ current, total }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: '2rem', flexWrap: 'wrap' }}>
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '700', fontSize: '0.8rem',
            background: i < current ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : i === current ? '#eef2ff' : '#f1f5f9',
            color: i < current ? 'white' : i === current ? 'var(--primary)' : '#94a3b8',
            border: i === current ? '2px solid var(--primary)' : '2px solid transparent',
            transition: 'all 0.3s ease',
          }}>
            {i < current ? <CheckCircle size={14} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div style={{ flex: 1, maxWidth: 30, minWidth: 10, height: 2, borderRadius: 2, background: i < current ? 'var(--primary)' : '#e2e8f0', transition: 'background 0.3s' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px 40px 12px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', fontFamily: 'Cairo, sans-serif' };
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#334155' };

export default function Register() {
  const { t } = useLanguage();
  const router = useRouter();
  
  const [step, setStep] = useState(0); 
  const [role, setRole] = useState('TEACHER');
  
  // File uploads
  const [photoURL, setPhotoURL] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const fileRef = useRef();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    fullName: '', email: '', nationalId: '', password: '', confirmPassword: '',
    phone: '', gender: 'MALE', 
    subjects: [], educationLevel: 'BACHELOR', major: '', university: '', graduationYear: '',
    workHistory: [], 
    availableDays: [], availableFrom: '08:00', availableTo: '15:00',
    locationCity: '', locationArea: '', hourlyRate: '',
    // School specific
    schoolType: 'LANGUAGE',
    educationalStages: [],
    schoolVision: '',
    curriculaFiles: []
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('الصورة يجب أن تكون أقل من 5MB'); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = ev => setPhotoURL(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleDayToggle = (day) => {
    setFormData(prev => {
      const days = prev.availableDays.includes(day) 
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day];
      return { ...prev, availableDays: days };
    });
  };

  const handleStageToggle = (stage) => {
    setFormData(prev => {
      const stages = prev.educationalStages.includes(stage) 
        ? prev.educationalStages.filter(s => s !== stage)
        : [...prev.educationalStages, stage];
      return { ...prev, educationalStages: stages };
    });
  };

  // Helper for Dropzone per subject
  const onDropFile = (subject, acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const newFileEntry = { subject, fileName: file.name, fileSize: file.size, objectUrl: URL.createObjectURL(file) };
    setFormData(prev => {
       const existing = prev.curriculaFiles.filter(c => c.subject !== subject);
       return { ...prev, curriculaFiles: [...existing, newFileEntry] };
    });
  };

  const submitToApi = async () => {
    setLoading(true);
    setError('');
    
    const payload = {
        fullName: formData.fullName,
        email: formData.email,
        nationalId: formData.nationalId,
        password: formData.password,
        role: role,
        // School Extended Fields
        schoolType: formData.schoolType,
        educationalStages: JSON.stringify(formData.educationalStages),
        description: formData.schoolVision,
        requiredSubjects: JSON.stringify(formData.subjects),
        curriculaFiles: JSON.stringify(formData.curriculaFiles.map(f => ({ subject: f.subject, name: f.fileName })))
    };

    try {
      const response = await fetch('http://localhost:5218/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        // Keep additional fields locally for mock if they want
        const fullUser = { ...data.user, ...formData, photoURL: photoURL || '', id: data.user.id || Date.now().toString() };
        localStorage.setItem('user', JSON.stringify(fullUser));
        window.dispatchEvent(new Event('userChanged'));
        if (role === 'TEACHER') {
          router.push('/assessment');
        } else {
          router.push('/school-dashboard');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'خطأ في إرسال البيانات للتسجيل!');
        setLoading(false);
      }
    } catch (err) {
      console.warn('Backend unavailable, falling back to mock...');
      // Temporary: Save to local storage for now
      const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      if (mockUsers.find(u => u.email === formData.email)) {
        setError('البريد الإلكتروني مسجل بالفعل!');
        setLoading(false);
        return;
      }
      
      const newUser = {
        id: Date.now().toString(),
        role,
        ...formData,
        photoURL: photoURL || '',
        createdAt: new Date().toISOString()
      };
      
      mockUsers.push(newUser);
      localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
      localStorage.setItem('user', JSON.stringify(newUser));
      window.dispatchEvent(new Event('userChanged'));
      if (role === 'TEACHER') {
        router.push('/assessment');
      } else {
        router.push('/school-dashboard');
      }
      setLoading(false);
    }
  };

  const totalSteps = role === 'TEACHER' ? 6 : 5;

  const nextStep = () => {
    if (step === 2) {
      if (!formData.fullName || !formData.email || !formData.nationalId || !formData.password) {
        setError('يرجى ملء جميع الحقول الأساسية!');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('كلمتي المرور غير متطابقتين!');
        return;
      }
    }
    setError('');
    if (step === totalSteps - 1) {
      submitToApi();
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem' }}>
      <div className="card animate-fade-in" style={{ maxWidth: '650px', width: '100%', padding: '2.5rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '2rem', margin: '0 0 6px 0' }}>{t('reg_title')} <span className="gradient-text">{t('reg_highlight')}</span></h2>
          <p style={{ color: '#64748b', margin: 0 }}>{t('reg_desc')}</p>
        </div>

        <StepIndicator current={step} total={totalSteps} />

        {error && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>{error}</div>}

        {/* STEP 0: Role */}
        {step === 0 && (
          <div>
            <p style={{ textAlign: 'center', fontWeight: '600', marginBottom: '1rem', color: '#475569' }}>من أنت؟</p>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <div onClick={() => setRole('TEACHER')} style={{ flex: 1, padding: '1.5rem', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', border: role === 'TEACHER' ? '2px solid var(--primary)' : '2px solid #e2e8f0', background: role === 'TEACHER' ? '#eef2ff' : 'white', transition: 'all 0.3s ease' }}>
                <GraduationCap size={40} color={role === 'TEACHER' ? 'var(--primary)' : '#94a3b8'} style={{ margin: '0 auto 12px' }} />
                <h3 style={{ margin: 0, color: role === 'TEACHER' ? 'var(--primary)' : '#64748b' }}>{t('iam_teacher')}</h3>
              </div>
              <div onClick={() => setRole('SCHOOL')} style={{ flex: 1, padding: '1.5rem', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', border: role === 'SCHOOL' ? '2px solid var(--secondary)' : '2px solid #e2e8f0', background: role === 'SCHOOL' ? '#ecfdf5' : 'white', transition: 'all 0.3s ease' }}>
                <Building size={40} color={role === 'SCHOOL' ? 'var(--secondary)' : '#94a3b8'} style={{ margin: '0 auto 12px' }} />
                <h3 style={{ margin: 0, color: role === 'SCHOOL' ? 'var(--secondary)' : '#64748b' }}>{t('iam_school')}</h3>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Photo */}
        {step === 1 && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: '600', marginBottom: '1.5rem', color: '#475569' }}>أضف صورة {role === 'TEACHER' ? 'شخصية' : 'لشعار المدرسة'}</p>
            <div
              onClick={() => fileRef.current.click()}
              style={{ width: 140, height: 140, borderRadius: role === 'TEACHER' ? '50%' : '12px', margin: '0 auto 1.5rem', cursor: 'pointer', position: 'relative', background: photoURL ? 'transparent' : '#f8fafc', border: '3px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
            >
              {photoURL ? (
                <img src={photoURL} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ color: '#94a3b8' }}>
                  <Camera size={36} style={{ display: 'block', margin: '0 auto 8px' }} />
                  <span style={{ fontSize: '0.8rem' }}>رفع الصورة</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
          </div>
        )}

        {/* STEP 2: Basic Details (Common) */}
        {step === 2 && (
          <div className="grid grid-cols-2" style={{ gap: '1.2rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>{t('fullname_label')}</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', right: '12px', top: '13px', color: '#94a3b8' }} />
                <input type="text" name="fullName" value={formData.fullName} placeholder={role === 'TEACHER' ? 'الاسم الرباعي كما في البطاقة' : 'اسم المدرسة'} onChange={handleChange} required style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t('email_label')}</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', right: '12px', top: '13px', color: '#94a3b8' }} />
                <input type="email" name="email" value={formData.email} placeholder="example@email.com" onChange={handleChange} required style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>{role === 'TEACHER' ? t('national_id_label') : 'رقم التسجيل / هاتف المدرسة'}</label>
              <div style={{ position: 'relative' }}>
                <IdCard size={18} style={{ position: 'absolute', right: '12px', top: '13px', color: '#94a3b8' }} />
                <input type="text" name="nationalId" value={formData.nationalId} placeholder="" onChange={handleChange} required style={inputStyle} />
              </div>
            </div>
            
            {role === 'TEACHER' && (
              <>
                <div>
                  <label style={labelStyle}>رقم الهاتف</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', right: '12px', top: '13px', color: '#94a3b8' }} />
                    <input type="text" name="phone" value={formData.phone} placeholder="01xxxxxxxxx" onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>الجنس</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'Cairo' }}>
                    <option value="MALE">ذكر</option>
                    <option value="FEMALE">أنثى</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label style={labelStyle}>{t('password_label')}</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', right: '12px', top: '13px', color: '#94a3b8' }} />
                <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t('confirm_pass_label')}</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', right: '12px', top: '13px', color: '#94a3b8' }} />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required style={inputStyle} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Academic Profile (TEACHER) */}
        {role === 'TEACHER' && step === 3 && (
          <div className="grid grid-cols-2" style={{ gap: '1.2rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <SubjectSelector 
                selectedSubjects={formData.subjects} 
                onChange={subs => setFormData({...formData, subjects: subs})} 
              />
            </div>
            <div>
              <label style={labelStyle}>أعلى مؤهل دراسي</label>
              <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'Cairo' }}>
                <option value="BACHELOR">بكالوريوس / ليسانس</option>
                <option value="MASTER">ماجستير</option>
                <option value="PHD">دكتوراه</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>التخصص الدقيق</label>
              <input type="text" name="major" value={formData.major} placeholder="مثال: رياضيات بحتة" onChange={handleChange} style={{...inputStyle, paddingRight: '12px'}} />
            </div>
            <div>
              <label style={labelStyle}>الجامعة</label>
              <input type="text" name="university" value={formData.university} placeholder="مثال: جامعة القاهرة" onChange={handleChange} style={{...inputStyle, paddingRight: '12px'}} />
            </div>
            <div>
              <label style={labelStyle}>سنة التخرج</label>
              <input type="number" name="graduationYear" value={formData.graduationYear} placeholder="مثال: 2015" onChange={handleChange} style={{...inputStyle, paddingRight: '12px'}} />
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <label style={labelStyle}>السيرة الذاتية CV (اختياري)</label>
              <div style={{ border: '1px solid #cbd5e1', padding: '12px', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BookOpen size={24} color="#64748b" />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>{cvFile ? cvFile.name : 'لم يتم اختيار ملف'}</p>
                </div>
                <input type="file" accept=".pdf,.doc,.docx" id="cvUpload" style={{ display: 'none' }} onChange={e => setCvFile(e.target.files[0])} />
                <label htmlFor="cvUpload" style={{ background: 'white', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--primary)' }}>اختيار ملف</label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: General Info (SCHOOL) */}
        {role === 'SCHOOL' && step === 3 && (
          <div className="grid grid-cols-2" style={{ gap: '1.2rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>نوع المدرسة</label>
              <select name="schoolType" value={formData.schoolType} onChange={handleChange} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'Cairo' }}>
                <option value="INTERNATIONAL">دولية (International)</option>
                <option value="LANGUAGE">لغات (Language)</option>
                <option value="PRIVATE">خاصة (Private)</option>
              </select>
            </div>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>المراحل الدراسية المتوفرة</label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {['ابتدائي (Primary)', 'إعدادي (Preparatory)', 'ثانوي (Secondary)'].map(stage => {
                  const isSelected = formData.educationalStages.includes(stage);
                  return (
                    <button key={stage} type="button" onClick={() => handleStageToggle(stage)}
                      style={{
                        padding: '10px 20px', borderRadius: '20px', fontSize: '0.9rem', cursor: 'pointer',
                        border: isSelected ? '2px solid var(--secondary)' : '1px solid #cbd5e1',
                        background: isSelected ? '#ecfdf5' : 'white',
                        color: isSelected ? 'var(--secondary)' : '#475569',
                        fontWeight: isSelected ? 'bold' : 'normal',
                        transition: 'all 0.2s'
                      }}>
                      {stage}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>رؤية المدرسة (School Vision)</label>
              <textarea 
                name="schoolVision" 
                value={formData.schoolVision} 
                onChange={handleChange} 
                rows={4}
                placeholder="اكتب نبذة عن رؤية وتوجه المدرسة ليتعرف عليها المعلمون..."
                style={{ ...inputStyle, width: '100%', resize: 'none' }}
              />
            </div>
          </div>
        )}

        {/* STEP 4: Subjects & Curriculum (SCHOOL) */}
        {role === 'SCHOOL' && step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}><span style={{ color: 'var(--secondary)' }}>•</span> ما هي المواد التي تدرّسها مدرستكم؟</label>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>سيتيح لك هذا إضافة منهج (Syllabus) اختياري لكل مادة.</p>
              <SubjectSelector 
                selectedSubjects={formData.subjects} 
                onChange={subs => setFormData({...formData, subjects: subs})} 
              />
            </div>

            {formData.subjects.length > 0 && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                <label style={labelStyle}>إرفاق ملفات المنهج (Curriculum/Syllabus)</label>
                <div style={{ padding: '12px', background: '#eef2ff', color: 'var(--primary)', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem' }}>ℹ️</span> Privacy Note: This file will only be visible to teachers after a successful booking.
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {formData.subjects.map(subj => {
                     const existingFile = formData.curriculaFiles.find(c => c.subject === subj);
                     return (
                       <FileDropzone key={subj} subject={subj} existingFile={existingFile} onDrop={(acceptedFiles) => onDropFile(subj, acceptedFiles)} />
                     );
                   })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Work History (TEACHER) */}
        {role === 'TEACHER' && step === 4 && (
          <WorkHistoryForm 
            history={formData.workHistory} 
            onChange={history => setFormData({...formData, workHistory: history})} 
          />
        )}

        {/* STEP 5: Availability (TEACHER) */}
        {role === 'TEACHER' && step === 5 && (
          <div className="grid grid-cols-2" style={{ gap: '1.2rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>أيام التوافر للعمل</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['السبت','الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'].map(day => {
                  const isSelected = formData.availableDays.includes(day);
                  return (
                    <button type="button" key={day} onClick={() => handleDayToggle(day)} style={{
                      padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                      background: isSelected ? 'var(--primary)' : '#f1f5f9',
                      color: isSelected ? 'white' : '#64748b',
                      transition: 'all 0.2s'
                    }}>{day}</button>
                  );
                })}
              </div>
            </div>
            
            <div>
              <label style={labelStyle}>متاح من الساعة</label>
              <div style={{ position: 'relative' }}>
                <Clock size={18} style={{ position: 'absolute', right: '12px', top: '13px', color: '#94a3b8' }} />
                <input type="time" name="availableFrom" value={formData.availableFrom} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>إلى الساعة</label>
              <div style={{ position: 'relative' }}>
                <Clock size={18} style={{ position: 'absolute', right: '12px', top: '13px', color: '#94a3b8' }} />
                <input type="time" name="availableTo" value={formData.availableTo} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>المحافظة</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', right: '12px', top: '13px', color: '#94a3b8' }} />
                <select name="locationCity" value={formData.locationCity} onChange={handleChange} style={{...inputStyle, paddingRight: '40px'}} >
                  <option value="">أين تقيم؟</option>
                  <option value="القاهرة">القاهرة</option>
                  <option value="الجيزة">الجيزة</option>
                  <option value="الإسكندرية">الإسكندرية</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>تسعيرة الحصة (بالساعة)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={18} style={{ position: 'absolute', right: '12px', top: '13px', color: '#94a3b8' }} />
                <input type="number" name="hourlyRate" value={formData.hourlyRate} placeholder="مثال: 150" onChange={handleChange} style={inputStyle} />
                <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8', fontSize: '0.9rem' }}>ج.م</span>
              </div>
            </div>
          </div>
        )}

        {/* Nav Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          {step > 0 && (
            <button type="button" onClick={() => setStep(s => s - 1)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>← رجوع</button>
          )}
          <button type="button" onClick={nextStep} disabled={loading} className="btn-primary" style={{ flex: step > 0 ? 2 : 1, justifyContent: 'center', background: role === 'SCHOOL' ? 'var(--secondary)' : undefined }}>
            {loading ? 'جاري المعالجة...' : (step === totalSteps - 1 ? 'إتمام التسجيل ✔' : 'التالي →')}
          </button>
        </div>

        {step > 1 && step < totalSteps - 1 && role === 'TEACHER' && (
          <button onClick={nextStep} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginTop: '1rem', fontSize: '0.82rem', textDecoration: 'underline', width: '100%' }}>
            تخطي هذه الخطوة لإكمالها لاحقاً
          </button>
        )}

        <p style={{ textAlign: 'center', color: '#64748b', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          {t('have_account')} <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>{t('login_here')}</Link>
        </p>

      </div>
    </div>
  );
}

// Separate component for per-subject Dropzone to use useDropzone isolated
function FileDropzone({ subject, existingFile, onDrop }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1 });
  
  return (
    <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
       <div style={{ flex: 1 }}>
         <p style={{ margin: '0 0 4px', fontWeight: 'bold', color: '#334155' }}>{subject}</p>
         {existingFile ? (
           <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--secondary)' }}>تم الإرفاق: {existingFile.fileName}</p>
         ) : (
           <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>لم يتم إرفاق ملف (اختياري)</p>
         )}
       </div>
       <div {...getRootProps()} style={{
         padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', border: isDragActive ? '2px dashed var(--secondary)' : '2px dashed #cbd5e1',
         background: isDragActive ? '#f0fdf4' : '#f8fafc',
         color: isDragActive ? 'var(--secondary)' : '#64748b', flexShrink: 0,
         fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
       }}>
         <input {...getInputProps()} />
         <span>⬆️</span> {isDragActive ? 'أفلت الملف هنا' : 'Upload PDF'}
       </div>
    </div>
  );
}
