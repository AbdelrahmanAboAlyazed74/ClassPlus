// Matching Engine — ported from matching_engine.py
// score = (proximity * 0.50) + (subject * 0.35) + (rating * 0.15)

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function proximityScore(distKm, maxKm = 25) {
  if (distKm >= maxKm) return 0;
  const k = -Math.log(0.1) / maxKm;
  return Math.exp(-k * distKm);
}

function subjectScore(teacher, subjectNeeded, curriculumNeeded) {
  const subMatch = teacher.subjects.includes(subjectNeeded);
  const curMatch = teacher.curricula.includes(curriculumNeeded);
  if (!subMatch) return 0;
  return curMatch ? 1.0 : 0.6;
}

function ratingScore(rating) {
  return Math.max(0, Math.min(rating / 5.0, 1.0));
}

export function findOptimalTeachers(teachers, schoolLat, schoolLng, subjectNeeded, curriculumNeeded, maxDistKm = 25, maxResults = 5) {
  const scored = [];

  for (const teacher of Object.values(teachers)) {
    if (!teacher.is_available) continue;
    const dist = haversineKm(schoolLat, schoolLng, teacher.lat, teacher.lng);
    if (dist > maxDistKm) continue;
    if (!teacher.subjects.includes(subjectNeeded)) continue;

    const p = proximityScore(dist, maxDistKm);
    const s = subjectScore(teacher, subjectNeeded, curriculumNeeded);
    const r = ratingScore(teacher.rating);
    const score = p * 0.5 + s * 0.35 + r * 0.15;

    scored.push({
      ...teacher,
      distance_km: Math.round(dist * 100) / 100,
      match_score: Math.round(score * 10000) / 10000,
      hourly_rate: teacher.rate,
      score_breakdown: {
        proximity: Math.round(p * 1000) / 1000,
        subject: Math.round(s * 1000) / 1000,
        rating: Math.round(r * 1000) / 1000,
      },
    });
  }

  scored.sort((a, b) => b.match_score - a.match_score);
  return scored.slice(0, maxResults);
}
