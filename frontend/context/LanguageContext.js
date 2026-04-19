"use client";
import React, { createContext, useState, useContext, useEffect } from 'react';

const translations = {
  AR: {
    home: "الرئيسية", search_teachers: "البحث عن مدرسين", teacher_dashboard: "لوحة تحكم المعلم",
    login: "تسجيل الدخول", register: "حساب جديد", logo_class: "Class ", logo_plus: "Plus",
    slogan: "تعليم جديد بدون تعقيد", hero_title_1: "اربط مدرستك بأفضل", hero_title_2: "المعلمين المحترفين",
    hero_desc: "المنصة الأولى المخصصة لربط الكفاءات التعليمية بالمدارس والمؤسسات. ابحث، قارن، ووظف أفضل المدرسين بضغطة زر.",
    btn_search_now: "ابحث عن مدرس الآن", btn_join_teacher: "انضم كمعلم", features_title: "لماذا تختار منصتنا؟",
    feat_1_title: "مطابقة مثالية", feat_1_desc: "خوارزميات ذكية لربط احتياجات مدرستك بأفضل الكفاءات المتوفرة والمناسبة لميزانيتك.",
    feat_2_title: "جودة مضمونة", feat_2_desc: "تقييمات حقيقية من مدراء مدارس آخرين تضمن لك مستوى المدرس وخبرته قبل التعاقد.",
    feat_3_title: "سرعة التوظيف", feat_3_desc: "لا مزيد من إعلانات التوظيف الطويلة، ابحث وتواصل مع المدرس مباشرة واحجز حصتك.",
    search_title: "تصفح", search_highlight: "المعلمين", search_desc: "ابحث بالتخصص أو بالاسم لتعثر على أفضل الكفاءات لمدرستك.",
    search_placeholder: "ابحث عن معلم...", filter_all: "جميع التخصصات", all: "الكل", math: "رياضيات",
    english: "لغة إنجليزية", physics: "فيزياء", years_exp: "سنوات", currency: "ج/س", req_contract: "طلب تعاقد",
    no_results: "لا يوجد معلمين يطابقون بحثك حالياً.", login_title: "تسجيل", login_highlight: "الدخول",
    login_desc: "مرحباً بك مجدداً في Class Plus", email_label: "البريد الإلكتروني", password_label: "كلمة المرور",
    email_placeholder: "أدخل بريدك الإلكتروني", pass_placeholder: "أدخل كلمة المرور", forgot_pass: "نسيت كلمة المرور؟",
    no_account: "ليس لديك حساب؟", register_here: "سجل كحساب جديد", btn_login: "تسجيل الدخول", reg_title: "حساب",
    reg_highlight: "جديد", reg_desc: "انضم إلينا الآن لتستفيد من خدماتنا", iam_teacher: "أنا معلم",
    iam_teacher_desc: "أبحث عن فرص تدريس", iam_school: "أنا مدرسة", iam_school_desc: "أبحث عن أفضل المعلمين",
    fullname_label: "الاسم الكامل", national_id_label: "الرقم القومي", national_id_placeholder: "الرقم القومي (14 رقم)",
    confirm_pass_label: "تأكيد كلمة المرور", create_acc_teacher: "إنشاء حساب كـمعلم", create_acc_school: "إنشاء حساب كـمدرسة",
    have_account: "لديك حساب بالفعل؟", login_here: "سجل دخولك من هنا", dash_welcome: "أهلاً بك يا",
    dash_desc: "إليك نظرة عامة على نشاطك وطلبات المدارس.", dash_pending: "طلبات جديدة (قيد الانتظار)", dash_confirmed: "حصص وحجوزات مؤكدة",
    dash_rating: "التقييم العام", dash_latest: "أحدث طلبات المدارس", dash_no_reqs: "لا توجد طلبات تعاقد حتى الآن.",
    dash_th_school: "رقم المدرسة", dash_th_date: "تاريخ الحصة", dash_th_time: "وقت البدء", dash_th_dur: "المدة",
    dash_th_status: "الحالة", dash_th_action: "إجراء", dash_hr: "ساعة", dash_status_pending: "قيد الانتظار",
    dash_status_confirmed: "مؤكد", dash_btn_accept: "قبول الطلب", dash_btn_accepted: "تم القبول", prof_title: "الملف",
    prof_highlight: "الشخصي", prof_teacher: "مدرس", prof_school: "مدرسة", prof_email: "البريد الإلكتروني:",
    prof_nat: "الرقم القومي:", prof_logout: "تسجيل الخروج"
  },
  EN: {
    home: "Home", search_teachers: "Find Teachers", teacher_dashboard: "Teacher Dashboard",
    login: "Login", register: "Sign Up", logo_class: "Class ", logo_plus: "Plus",
    slogan: "Modern Education, Simplified", hero_title_1: "Connect your school with", hero_title_2: "Professional Teachers",
    hero_desc: "The premier platform dedicated to connecting educational talents with schools and institutions.", btn_search_now: "Find a Teacher Now",
    btn_join_teacher: "Join as a Teacher", features_title: "Why choose our platform?", feat_1_title: "Perfect Match",
    feat_1_desc: "Smart algorithms to connect your school's needs with the best available talents.", feat_2_title: "Guaranteed Quality",
    feat_2_desc: "Real reviews from other school principals ensuring the teacher's level.", feat_3_title: "Fast Hiring",
    feat_3_desc: "No more long hiring ads. Search, connect directly with the teacher.", search_title: "Browse",
    search_highlight: "Teachers", search_desc: "Search by specialty or name to find the best talents for your school.",
    search_placeholder: "Search for a teacher...", filter_all: "All Specialties", all: "All", math: "Math", english: "English",
    physics: "Physics", years_exp: "Years", currency: "EGP/h", req_contract: "Request Contract",
    no_results: "No teachers match your search currently.", login_title: "Account", login_highlight: "Login",
    login_desc: "Welcome back to Class Plus", email_label: "Email Address", password_label: "Password",
    email_placeholder: "Enter your email", pass_placeholder: "Enter your password", forgot_pass: "Forgot Password?",
    no_account: "Don't have an account?", register_here: "Sign up here", btn_login: "Login", reg_title: "New",
    reg_highlight: "Account", reg_desc: "Join us now to benefit from our services", iam_teacher: "I am a Teacher",
    iam_teacher_desc: "Looking for teaching opportunities", iam_school: "I am a School", iam_school_desc: "Looking for the best teachers",
    fullname_label: "Full Name", national_id_label: "National ID", national_id_placeholder: "National ID (14 digits)",
    confirm_pass_label: "Confirm Password", create_acc_teacher: "Create Teacher Account", create_acc_school: "Create School Account",
    have_account: "Already have an account?", login_here: "Login here", dash_welcome: "Welcome", dash_desc: "Here is an overview of your activity.",
    dash_pending: "New Requests (Pending)", dash_confirmed: "Confirmed Classes", dash_rating: "Overall Rating", dash_latest: "Latest School Requests",
    dash_no_reqs: "No booking requests yet.", dash_th_school: "School ID", dash_th_date: "Class Date", dash_th_time: "Start Time",
    dash_th_dur: "Duration", dash_th_status: "Status", dash_th_action: "Action", dash_hr: "Hour", dash_status_pending: "Pending",
    dash_status_confirmed: "Confirmed", dash_btn_accept: "Accept Request", dash_btn_accepted: "Accepted", prof_title: "My",
    prof_highlight: "Profile", prof_teacher: "Teacher", prof_school: "School", prof_email: "Email:", prof_nat: "National ID:",
    prof_logout: "Logout"
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('AR');

  useEffect(() => {
    const saved = localStorage.getItem('classplus_lang') || 'AR';
    setLang(saved);
    document.documentElement.dir = saved === 'AR' ? 'rtl' : 'ltr';
    document.documentElement.lang = saved === 'AR' ? 'ar' : 'en';
  }, []);

  useEffect(() => {
    localStorage.setItem('classplus_lang', lang);
    document.documentElement.dir = lang === 'AR' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang === 'AR' ? 'ar' : 'en';
  }, [lang]);

  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
