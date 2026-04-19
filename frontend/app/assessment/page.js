"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Upload, Video, CheckCircle, AlertCircle, BookOpen, Clock } from 'lucide-react';

const mockSubjectQuestions = {
  "رياضيات": [
    { q: "ما هو ناتج 5 × 12؟", options: ["60", "50", "45", "65"] },
    { q: "حل المعادلة: 2س + 4 = 10", options: ["س = 3", "س = 2", "س = 4", "س = 1"] },
    { q: "ما هي مساحة المربع الذي طول ضلعه 4؟", options: ["16", "8", "4", "12"] }
  ],
  "علوم": [
    { q: "ما هو الغاز الذي تتنفسه النباتات في عملية البناء الضوئي؟", options: ["ثاني أكسيد الكربون", "الأكسجين", "النيتروجين", "الهيدروجين"] },
    { q: "عنصر كيميائي رمزه O", options: ["أكسجين", "ذهب", "فضة", "حديد"] },
    { q: "أي من التالي هو مصدر متجدد للطاقة؟", options: ["الشمس", "الفحم", "البترول", "الغاز الطبيعي"] }
  ],
  "لغة إنجليزية": [
    { q: "Choose the correct verb: She ___ to school every day.", options: ["goes", "go", "going", "gone"] },
    { q: "What is the synonym of 'Happy'?", options: ["Joyful", "Sad", "Angry", "Tired"] },
    { q: "Which word is a noun?", options: ["Desk", "Quickly", "Run", "Beautiful"] }
  ],
  "لغة عربية": [
    { q: "ما هو إعراب كلمة 'الشمسُ' في جملة 'الشمسُ ساطعةٌ'؟", options: ["مبتدأ مرفوع", "خبر مرفوع", "فاعل مرفوع", "مفعول به منصوب"] },
    { q: "من هو أمير الشعراء؟", options: ["أحمد شوقي", "حافظ إبراهيم", "المتنبي", "طه حسين"] },
    { q: "ما نوع الكلمة 'يقرأ'؟", options: ["فعل مضارع", "اسم", "حرف", "فعل ماضي"] }
  ],
  "فيزياء": [
    { q: "ما هي وحدة قياس القوة؟", options: ["نيوتن", "جول", "وات", "باسكال"] },
    { q: "من هو مكتشف قانون الجاذبية؟", options: ["نيوتن", "أينشتاين", "غاليليو", "كوري"] }
  ],
  "كيمياء": [
    { q: "ما هو الرمز الكيميائي للماء؟", options: ["H2O", "CO2", "NaCl", "O2"] },
    { q: "ما هي القاعدة؟", options: ["مادة تتقبل بروتونات", "مادة تمنح بروتونات", "مادة لا تتفاعل", "محلول مائي حمضي"] }
  ],
  "تاريخ": [
    { q: "متى بدأت الحرب العالمية الثانية؟", options: ["1939", "1914", "1945", "1918"] },
    { q: "أين تقع أهرامات الجيزة؟", options: ["مصر", "المكسيك", "الصين", "العراق"] }
  ]
};

const workStylesPairs = [
  { left: "أفضل خطط الدروس المنظمة والمحددة مسبقاً", right: "أفضل التعلم المرن والاستكشافي مع الطلاب" },
  { left: "أركز على التميز الأكاديمي والنتائج الدقيقة", right: "أركز على التطور الشخصي والذكاء العاطفي للطالب" },
  { left: "أفضل العمل باستقلالية في تحضير موادي", right: "أفضل التعاون المستمر مع زملائي المدرسين" }
];

export default function Assessment() {
  const router = useRouter();
  const [userSubjects, setUserSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [recording, setRecording] = useState(false);
  const [videoFile, setVideoFile] = useState(null);

  useEffect(() => {
    // Attempt to load user subjects from registration
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.subjects && parsedUser.subjects.length > 0) {
        setUserSubjects(parsedUser.subjects);
        // Automatically select the first subject available in our mock DB that the user has, or fallback to their first subject
        const match = parsedUser.subjects.find(s => mockSubjectQuestions[s]);
        setSelectedSubject(match || "لغة عربية"); // fallback to Arabic if no match
      } else {
        setUserSubjects(["لغة عربية", "رياضيات", "علوم", "لغة إنجليزية"]);
        setSelectedSubject("لغة عربية");
      }
    } else {
       setUserSubjects(["لغة عربية", "رياضيات", "علوم", "لغة إنجليزية"]);
       setSelectedSubject("لغة عربية");
    }
  }, []);

  const handleRecordingToggle = () => {
    setRecording(!recording);
  };

  const handleVideoUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
    }
  };

  const currentQuestions = mockSubjectQuestions[selectedSubject] || mockSubjectQuestions["لغة عربية"];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        
        {/* Header / Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#0f172a', fontWeight: '800', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--primary)' }}>Class Plus</span> | مركز التقييم
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
             يرجى إكمال جميع الأقسام أدناه لإنهاء إعداد ملفك الشخصي بنجاح وزيادة فرص مطابقتك مع أفضل المدارس.
          </p>
        </div>

        {/* Section 1: SJT */}
        <section className="card animate-fade-in" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <AlertCircle color="var(--primary)" /> القسم 1: تقييم المواقف السلوكية (SJT)
          </h2>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#334155', marginBottom: '1rem', backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '8px', borderRight: '4px solid var(--primary)' }}>
              الموقف: طالب يقوم بإثارة الفوضى بشكل مستمر أثناء شرحك لدرس هام جداً. كيف تتصرف في هذه اللحظة؟
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {["أقوم بإيقاف الدرس وتوجيه إنذار شديد اللهجة للطالب أمام زملائه.",
                "أتجاهل التصرف تماماً وأستمر في الشرح حتى لا أضيع وقت الحصة.",
                "أقترب منه بهدوء أثناء الشرح وأطلب منه التوقف بلغة جسد حازمة دون إحراجه.",
                "أطلب منه مغادرة الفصل فوراً والذهاب للإدارة."].map((opt, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', hover: { backgroundColor: '#f8fafc' } }}>
                  <input type="radio" name="sjt_q1" style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                  <span style={{ color: '#475569' }}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Work Styles */}
        <section className="card animate-fade-in delay-1" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle color="var(--primary)" /> القسم 2: نظرة عامة على أساليب العمل (الفلسفة التعليمية)
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {workStylesPairs.map((pair, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: '500', color: '#475569' }}>
                   <span style={{ flex: 1, textAlign: 'right' }}>{pair.left}</span>
                   <span style={{ width: '40px' }}></span>
                   <span style={{ flex: 1, textAlign: 'left' }}>{pair.right}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', padding: '0 10%' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '2px', backgroundColor: '#e2e8f0', zIndex: 0 }}></div>
                  {[0, 1, 2, 3, 4].map(val => (
                    <div key={val} style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <input type="radio" name={`style_pref_${index}`} value={val} style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: 'var(--primary)', margin: 0 }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', padding: '0 5%' }}>
                   <span>يشبهني جداً</span>
                   <span>يشبهني قليلاً</span>
                   <span>محايد</span>
                   <span>يشبهني قليلاً</span>
                   <span>يشبهني جداً</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Subject Proficiency */}
        <section className="card animate-fade-in delay-2" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', marginBottom: '2rem' }}>
           <h2 style={{ fontSize: '1.4rem', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen color="var(--primary)" /> القسم 3: الكفاءة في المادة العلمية
          </h2>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>بناءً على المادة التي تدرسها، أجب عن الأسئلة التالية لاختبار الإلمام السريع بالمنهج.</p>
          
          <div style={{ marginBottom: '2rem' }}>
             <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>اختر المادة:</label>
             <select 
               value={selectedSubject} 
               onChange={(e) => setSelectedSubject(e.target.value)}
               style={{ width: '100%', maxWidth: '300px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontFamily: 'Cairo' }}
             >
                {userSubjects.map(sub => (
                   <option key={sub} value={sub}>{sub}</option>
                ))}
             </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {currentQuestions.map((qObj, qIndex) => (
              <div key={qIndex}>
                <p style={{ fontWeight: '600', color: '#334155', marginBottom: '10px' }}>س{qIndex + 1}: {qObj.q}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {qObj.options.map((opt, i) => (
                    <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>
                       <input type="radio" name={`subj_${selectedSubject}_q${qIndex}`} style={{ accentColor: 'var(--primary)' }} />
                       <span style={{ color: '#475569', fontSize: '0.95rem' }}>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Teaching Demo */}
        <section className="card animate-fade-in delay-2" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', marginBottom: '2rem' }}>
           <h2 style={{ fontSize: '1.4rem', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Video color="var(--primary)" /> القسم 4: العرض التوضيحي (Micro-Lesson & Intro)
          </h2>
          <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            يُرجى تسجيل أو رفع فيديو مدته <strong>دقيقتين</strong>. في هذا الفيديو، قم بالتعريف عن نفسك، وتحدث عن خبراتك، ثم اشرح مفهوماً قصيراً من مادتك العلمية لتوضيح أسلوبك في الشرح.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Live Recording Block */}
            <div style={{ padding: '2rem', border: '2px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', backgroundColor: recording ? '#fee2e2' : '#f8fafc', transition: 'all 0.3s' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '1rem' }}>تسجيل مباشر</h3>
                <button 
                  onClick={handleRecordingToggle}
                  style={{ width: '80px', height: '80px', borderRadius: '50%', border: 'none', backgroundColor: recording ? '#ef4444' : 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                >
                  <Mic size={32} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: recording ? '#ef4444' : '#64748b', fontWeight: 'bold', fontSize: '1.2rem' }}>
                   <Clock size={20} />
                   <span>{recording ? "00:14" : "02:00"}</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '10px' }}>
                  {recording ? "جاري التسجيل... انقر للإيقاف" : "انقر للبدء بفتح الكاميرا والمايك"}
                </p>
            </div>

            {/* Video Upload Block */}
            <div style={{ padding: '2rem', border: '2px solid #e2e8f0', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '1rem' }}>أو رفع فيديو جاهز</h3>
                <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', margin: '0 auto', border: '1px solid #cbd5e1', transition: 'all 0.2s' }}>
                  <Upload size={20} />
                  اختيار ملف
                  <input type="file" accept="video/mp4,video/x-m4v,video/*" style={{ display: 'none' }} onChange={handleVideoUpload} />
                </label>
                {videoFile && (
                  <p style={{ marginTop: '1rem', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    ✔ تم اختيار: {videoFile.name}
                  </p>
                )}
            </div>
          </div>
        </section>

        {/* Submit */}
        <div style={{ textAlign: 'left', marginTop: '2rem' }}>
          <button 
            className="btn-primary" 
            style={{ padding: '14px 32px', fontSize: '1.2rem', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            onClick={() => router.push('/profile')}
          >
            إرسال وإنهاء التقييم 🚀
          </button>
        </div>

      </div>
    </div>
  );
}
