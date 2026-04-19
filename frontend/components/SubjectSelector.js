import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

const DEFAULT_SUBJECTS = [
  'رياضيات', 'فيزياء', 'كيمياء', 'أحياء', 'لغة عربية', 
  'لغة إنجليزية', 'لغة فرنسية', 'حاسب آلي', 'تاريخ', 
  'جغرافيا', 'علوم', 'تربية دينية', 'تربية وطنية'
];

export default function SubjectSelector({ selectedSubjects, onChange }) {
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddSubject = (subject) => {
    if (!selectedSubjects.includes(subject)) {
      onChange([...selectedSubjects, subject]);
    }
    setIsAdding(false);
  };

  const handleRemoveSubject = (subject) => {
    onChange(selectedSubjects.filter(s => s !== subject));
  };

  const availableSubjects = DEFAULT_SUBJECTS.filter(s => !selectedSubjects.includes(s));

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>
        المواد التي تدرسها
      </label>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
        {selectedSubjects.map(subject => (
          <div key={subject} style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'var(--primary)', color: 'white',
            padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem'
          }}>
            {subject}
            <X size={14} cursor="pointer" onClick={() => handleRemoveSubject(subject)} />
          </div>
        ))}
        
        {!isAdding && availableSubjects.length > 0 && (
          <button type="button" onClick={() => setIsAdding(true)} style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#e2e8f0', color: '#475569', border: 'none',
            padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem', cursor: 'pointer'
          }}>
            <Plus size={14} /> إضافة مادة
          </button>
        )}
      </div>

      {isAdding && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#64748b' }}>اختر مادة:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {availableSubjects.map(subject => (
              <button key={subject} type="button" onClick={() => handleAddSubject(subject)} style={{
                background: 'white', border: '1px solid #cbd5e1', color: '#334155',
                padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer'
              }}>
                {subject}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
