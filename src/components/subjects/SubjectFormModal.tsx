import { useState, useEffect } from 'react';
import { useStore, ALL_SEMESTERS } from '@/store/useStore';
import { useToast } from '@/store/useToast';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';
import { Subject } from '@/types';

interface SubjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectToEdit?: Subject;
}

const COLORS = [
  'bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 
  'bg-amber-500', 'bg-sky-500', 'bg-purple-500', 
  'bg-rose-500', 'bg-orange-500', 'bg-teal-500'
];

export function SubjectFormModal({ isOpen, onClose, subjectToEdit }: SubjectFormModalProps) {
  const { addSubject, updateSubject } = useStore();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [semester, setSemester] = useState('');
  const [faculty, setFaculty] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (subjectToEdit) {
        setName(subjectToEdit.name);
        setCode(subjectToEdit.code || '');
        setSemester(subjectToEdit.semester);
        setFaculty(subjectToEdit.faculty || '');
        setDescription(subjectToEdit.description || '');
        setColor(subjectToEdit.color);
      } else {
        setName('');
        setCode('');
        setSemester('');
        setFaculty('');
        setDescription('');
        setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
      }
      setErrors({});
    }
  }, [isOpen, subjectToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = "Required";
    if (!semester) newErrors.semester = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (subjectToEdit) {
      updateSubject(subjectToEdit.id, {
        name,
        code,
        semester,
        faculty,
        description,
        color
      });
      addToast("Subject updated successfully.");
    } else {
      const newSubject: Subject = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        code,
        semester,
        faculty,
        description,
        color
      };
      addSubject(newSubject);
      addToast("Subject created successfully.");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-display font-bold text-slate-900">
            {subjectToEdit ? 'Edit Subject' : 'Add Subject'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="subject-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Subject Name <span className="text-red-500">*</span></label>
              <input 
                type="text"
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Subject Code</label>
                <input 
                  type="text"
                  value={code} 
                  onChange={e => setCode(e.target.value)}
                  placeholder="e.g. DBMS"
                  className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Faculty</label>
                <input 
                  type="text"
                  value={faculty} 
                  onChange={e => setFaculty(e.target.value)}
                  className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Semester <span className="text-red-500">*</span></label>
              <select 
                value={semester} 
                onChange={e => setSemester(e.target.value)}
                className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select Semester</option>
                {ALL_SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.semester && <p className="text-red-500 text-xs mt-1">{errors.semester}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Subject Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full ${c} ${color === c ? 'ring-2 ring-offset-2 ring-slate-800' : ''}`}
                  />
                ))}
              </div>
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="subject-form">
            {subjectToEdit ? 'Save Changes' : 'Create Subject'}
          </Button>
        </div>
      </div>
    </div>
  );
}
