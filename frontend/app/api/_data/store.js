// NAIB — In-memory data store (shared across API routes)
// In production this would be PostgreSQL

export const TEACHERS_DB = {
  t1: {
    id: "t1", name: "Ahmed Hassan", phone: "010-0123-4567",
    subjects: ["Physics", "Mathematics"], curricula: ["IGCSE", "IB"],
    lat: 30.0300, lng: 31.4900, is_available: true,
    rating: 4.8, rate: 200, experience: 7, verified: true,
    avatar: "AH", district: "New Cairo",
  },
  t2: {
    id: "t2", name: "Sara El-Sayed", phone: "011-1234-5678",
    subjects: ["Physics", "Chemistry"], curricula: ["American", "IGCSE"],
    lat: 30.0260, lng: 31.4850, is_available: true,
    rating: 4.5, rate: 180, experience: 4, verified: true,
    avatar: "SE", district: "Maadi",
  },
  t3: {
    id: "t3", name: "Nour Mahmoud", phone: "012-2345-6789",
    subjects: ["Biology", "Chemistry"], curricula: ["IGCSE", "National"],
    lat: 30.0400, lng: 31.5100, is_available: true,
    rating: 4.9, rate: 220, experience: 10, verified: true,
    avatar: "NM", district: "Nasr City",
  },
  t4: {
    id: "t4", name: "Omar Fawzy", phone: "015-0987-6543",
    subjects: ["Mathematics", "Computer_Science"], curricula: ["American", "IB", "STEM"],
    lat: 30.0180, lng: 31.4800, is_available: true,
    rating: 4.7, rate: 195, experience: 6, verified: true,
    avatar: "OF", district: "Heliopolis",
  },
  t5: {
    id: "t5", name: "Hana Youssef", phone: "017-7654-3210",
    subjects: ["English", "Arabic"], curricula: ["National", "IGCSE", "American"],
    lat: 30.0320, lng: 31.5000, is_available: false,
    rating: 4.6, rate: 160, experience: 8, verified: true,
    avatar: "HY", district: "Zamalek",
  },
  t6: {
    id: "t6", name: "Karim Nabil", phone: "010-1111-2222",
    subjects: ["Physics", "Mathematics", "Chemistry"], curricula: ["IGCSE", "IB", "STEM"],
    lat: 30.0410, lng: 31.4950, is_available: true,
    rating: 5.0, rate: 250, experience: 15, verified: true,
    avatar: "KN", district: "Rehab City",
  },
};

export const BOOKINGS_DB = {
  "bk-001": {
    id: "bk-001", school_id: "school-001", subject: "Mathematics",
    curriculum: "IGCSE", teacher_id: "t5", teacher_name: "Hana Youssef",
    status: "Completed", created_at: "2026-04-12T08:00:00Z",
    checked_in_at: "2026-04-12T09:00:00Z", checked_out_at: "2026-04-12T10:00:00Z",
    duration_hours: 1, amount: 160, qr_token: "tok-001",
  },
  "bk-002": {
    id: "bk-002", school_id: "school-001", subject: "English",
    curriculum: "American", teacher_id: "t4", teacher_name: "Omar Fawzy",
    status: "Confirmed", created_at: "2026-04-13T07:30:00Z",
    duration_hours: 2, amount: 390, qr_token: "tok-002",
  },
};
