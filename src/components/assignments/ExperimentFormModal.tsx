import { useState, useEffect } from 'react';
import { useStore, ALL_SEMESTERS } from '@/store/useStore';
import { useToast } from '@/store/useToast';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';
import { Assignment } from '@/types';

interface ExperimentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentToEdit?: Assignment;
  preselectedSemester?: string;
  preselectedSubjectId?: string;
}

export function ExperimentFormModal({ isOpen, onClose, assignmentToEdit, preselectedSemester, preselectedSubjectId }: ExperimentFormModalProps) {
  const { subjects, addAssignment, updateAssignment } = useStore();
  const { addToast } = useToast();

  const [semester, setSemester] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [experimentNumber, setExperimentNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moodleUrl, setMoodleUrl] = useState('');
  const [faculty, setFaculty] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (assignmentToEdit) {
        const subject = subjects.find(s => s.id === assignmentToEdit.subjectId);
        setSemester(subject?.semester || '');
        setSubjectId(assignmentToEdit.subjectId);
        setExperimentNumber(assignmentToEdit.experimentNumber.toString());
        setTitle(assignmentToEdit.title);
        setDescription(assignmentToEdit.description || '');
        setMoodleUrl(assignmentToEdit.moodleUrl || '');
        setFaculty(assignmentToEdit.faculty || '');
        setReleaseDate(assignmentToEdit.releaseDate);
        setDueDate(assignmentToEdit.dueDate);
        setNotes(assignmentToEdit.notes || '');
      } else {
        setSemester(preselectedSemester || '');
        setSubjectId(preselectedSubjectId || '');
        setExperimentNumber('');
        setTitle('');
        setDescription('');
        setMoodleUrl('');
        setFaculty('');
        setReleaseDate('');
        setDueDate('');
        setNotes('');
      }
      setErrors({});
    }
  }, [isOpen, assignmentToEdit, preselectedSemester, preselectedSubjectId, subjects]);

  useEffect(() => {
    if (subjectId && !faculty && !assignmentToEdit) {
      const subject = subjects.find(s => s.id === subjectId);
      if (subject?.faculty) {
        setFaculty(subject.faculty);
      }
    }
  }, [subjectId, subjects, faculty, assignmentToEdit]);

  if (!isOpen) return null;

  const filteredSubjects = subjects.filter(s => s.semester === semester);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!semester) newErrors.semester = "Required";
    if (!subjectId) newErrors.subjectId = "Required";
    if (!experimentNumber) newErrors.experimentNumber = "Required";
    if (!title) newErrors.title = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (assignmentToEdit) {
      updateAssignment(assignmentToEdit.id, {
        subjectId,
        experimentNumber: Number(experimentNumber),
        title,
        description,
        moodleUrl,
        faculty,
        releaseDate,
        dueDate,
        notes,
      });
      addToast("Experiment updated successfully.");
    } else {
      const newAssignment: Assignment = {
        id: Math.random().toString(36).substring(2, 9),
        subjectId,
        experimentNumber: Number(experimentNumber),
        title,
        description,
        moodleUrl,
        faculty,
        releaseDate,
        dueDate,
        priority: 'medium',
        notes,
        status: 'NOT_STARTED',
        checklist: {
          moodleReceived: false,
          experimentWritten: false,
          experimentPerformed: false,
          templatePrepared: false,
          uploadedToMoodle: false,
          facultyChecked: false
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addAssignment(newAssignment);
      addToast("Experiment created successfully.");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100">
          <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900">
            {assignmentToEdit ? 'Edit Experiment' : 'Add Experiment'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {subjects.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-900 font-semibold mb-2">No subjects available.</p>
              <p className="text-slate-500 text-sm mb-6">Create a subject first before adding an experiment.</p>
              <Button onClick={() => {
                onClose();
              }}>
                Close
              </Button>
            </div>
          ) : (
            <form id="experiment-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Semester <span className="text-red-500">*</span></label>
                  <select 
                    value={semester} 
                    onChange={e => {
                      setSemester(e.target.value);
                      setSubjectId('');
                    }}
                    className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Select Semester</option>
                    {ALL_SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.semester && <p className="text-red-500 text-xs mt-1">{errors.semester}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Subject <span className="text-red-500">*</span></label>
                  <select 
                    value={subjectId} 
                    onChange={e => setSubjectId(e.target.value)}
                    disabled={!semester}
                    className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50"
                  >
                    <option value="">Select Subject</option>
                    {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {errors.subjectId && <p className="text-red-500 text-xs mt-1">{errors.subjectId}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Experiment No. <span className="text-red-500">*</span></label>
                  <input 
                    type="number"
                    value={experimentNumber} 
                    onChange={e => setExperimentNumber(e.target.value)}
                    className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  {errors.experimentNumber && <p className="text-red-500 text-xs mt-1">{errors.experimentNumber}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Moodle URL</label>
                  <input 
                    type="url"
                    value={moodleUrl} 
                    onChange={e => setMoodleUrl(e.target.value)}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Release Date</label>
                  <input 
                    type="date"
                    value={releaseDate} 
                    onChange={e => setReleaseDate(e.target.value)}
                    className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Due Date</label>
                  <input 
                    type="date"
                    value={dueDate} 
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Notes</label>
                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </form>
          )}
        </div>
        
        {subjects.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose}>Cancel</Button>
            <Button type="submit" form="experiment-form" className="w-full sm:w-auto">
              {assignmentToEdit ? 'Save Changes' : 'Create Experiment'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
