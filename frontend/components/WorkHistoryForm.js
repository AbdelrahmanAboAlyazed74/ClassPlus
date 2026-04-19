import React from 'react';
import { Plus, Trash2, Building, Briefcase } from 'lucide-react';

export default function WorkHistoryForm({ history, onChange }) {
  
  const handleAdd = () => {
    onChange([...history, { schoolName: '', position: '', startYear: '', endYear: '', isCurrent: false }]);
  };

  const handleChange = (index, field, value) => {
    const newHistory = [...history];
    newHistory[index][field] = value;
    onChange(newHistory);
  };

  const handleRemove = (index) => {
    const newHistory = history.filter((_, i) => i !== index);
    onChange(newHistory);
  };

  const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' };

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', fontSize: '0.95rem', color: '#334155' }}>
        سجل العمل (تاريخ الخبرات)
      </label>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {history.map((record, index) => (
          <div key={index} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', position: 'relative' }}>
            <button type="button" onClick={() => handleRemove(index)} style={{ position: 'absolute', top: '10px', left: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
              <Trash2 size={18} />
            </button>
            
            <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '0.8rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>اسم المدرسة/المؤسسة</label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} style={{ position: 'absolute', right: '10px', top: '12px', color: '#94a3b8' }} />
                  <input type="text" value={record.schoolName} onChange={e => handleChange(index, 'schoolName', e.target.value)} required style={{ ...inputStyle, paddingRight: '32px' }} />
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>المسمى الوظيفي</label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={16} style={{ position: 'absolute', right: '10px', top: '12px', color: '#94a3b8' }} />
                  <input type="text" value={record.position} onChange={e => handleChange(index, 'position', e.target.value)} required placeholder="مثال: مدرس فيزياء أول" style={{ ...inputStyle, paddingRight: '32px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>سنة البداية</label>
                <input type="number" min="1980" max="2026" value={record.startYear} onChange={e => handleChange(index, 'startYear', e.target.value)} required style={inputStyle} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>سنة الانتهاء</label>
                <input type="number" min="1980" max="2026" value={record.endYear} onChange={e => handleChange(index, 'endYear', e.target.value)} disabled={record.isCurrent} required={!record.isCurrent} style={{ ...inputStyle, background: record.isCurrent ? '#e2e8f0' : 'white' }} />
              </div>
              
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id={`current-${index}`} checked={record.isCurrent} onChange={e => handleChange(index, 'isCurrent', e.target.checked)} />
                <label htmlFor={`current-${index}`} style={{ fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>ما زلت أعمل هنا</label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={handleAdd} className="btn-outline" style={{ marginTop: history.length > 0 ? '1rem' : '0', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '8px' }}>
        <Plus size={18} /> إضافة سجل خبرة
      </button>
    </div>
  );
}
