import { useState } from 'react';
import { useStore, ALL_SEMESTERS } from '@/store/useStore';
import { useToast } from '@/store/useToast';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Plus, GitBranch, LayoutGrid, BookOpen } from 'lucide-react';
import { cn } from '@/utils';
import { SubjectFormModal, SubjectCard } from '@/components/subjects';
import { BranchedMenu } from '@/components/ui/BranchedMenu';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { ExperimentFormModal } from '@/components/assignments/ExperimentFormModal';
import { Subject } from '@/types';

export function Subjects() {
  const { subjects, assignments, deleteSubject } = useStore();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'branched' | 'grid'>('branched');
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [selectedSubjectForExp, setSelectedSubjectForExp] = useState<Subject | null>(null);

  const subjectToDeleteExpsCount = subjectToDelete
    ? assignments.filter((a) => a.subjectId === subjectToDelete.id).length
    : 0;

  const handleDeleteSubject = () => {
    if (!subjectToDelete) return;
    deleteSubject(subjectToDelete.id);
    addToast(`Subject "${subjectToDelete.name}" and all associated experiments deleted.`);
    setSubjectToDelete(null);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              Curriculum Manager
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900">
            Subjects & Experiments
          </h1>
          <p className="mt-1 sm:mt-1.5 text-sm sm:text-base text-slate-500">
            Explore subjects and their connected experiments in a structured workflow tree or grid.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('branched')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === 'branched'
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>Branched Tree</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === 'grid'
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
          </div>

          <Button className="gap-2 shrink-0 shadow-sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Add Subject</span>
          </Button>
        </div>
      </div>

      <div className="space-y-12">
        {subjects.length === 0 ? (
          <Card className="bg-slate-50/50 border-dashed">
            <CardContent className="p-16 text-center text-slate-500">
              <BookOpen className="h-12 w-12 mx-auto text-indigo-300 mb-4" />
              <p className="text-xl font-bold text-slate-700 mb-2">No subjects yet.</p>
              <p className="text-sm mb-6">Add your first subject to start organizing your college work.</p>
              <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Subject
              </Button>
            </CardContent>
          </Card>
        ) : (
          ALL_SEMESTERS.map((semester) => {
            const semesterSubjects = subjects.filter((s) => s.semester === semester);
            if (semesterSubjects.length === 0) return null;

            return (
              <section key={semester} className="space-y-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg sm:text-xl font-display font-extrabold text-slate-900 tracking-tight">
                    {semester}
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {semesterSubjects.length} {semesterSubjects.length === 1 ? 'Course' : 'Courses'}
                  </span>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>

                {/* React Bits BranchedMenu View */}
                {viewMode === 'branched' ? (
                  <div className="space-y-5">
                    {semesterSubjects.map((subject) => {
                      const subjectAssignments = assignments.filter((a) => a.subjectId === subject.id);
                      return (
                        <BranchedMenu
                          key={subject.id}
                          subject={subject}
                          assignments={subjectAssignments}
                          defaultExpanded={false}
                          onDeleteSubject={(s) => setSubjectToDelete(s)}
                          onAddExperiment={(s) => setSelectedSubjectForExp(s)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  /* Classic Grid View */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {semesterSubjects.map((subject) => {
                      const subjectAssignments = assignments.filter((a) => a.subjectId === subject.id);
                      return (
                        <SubjectCard
                          key={subject.id}
                          subject={subject}
                          assignments={subjectAssignments}
                          onDeleteSubject={(s) => setSubjectToDelete(s)}
                        />
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>

      {/* Add Subject Modal */}
      <SubjectFormModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      {/* Add Experiment with Preselected Subject Modal */}
      {selectedSubjectForExp && (
        <ExperimentFormModal
          isOpen={!!selectedSubjectForExp}
          onClose={() => setSelectedSubjectForExp(null)}
          preselectedSemester={selectedSubjectForExp.semester}
          preselectedSubjectId={selectedSubjectForExp.id}
        />
      )}

      {/* Delete Subject Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!subjectToDelete}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={handleDeleteSubject}
        title="Delete Subject"
        message={
          subjectToDelete ? (
            <div className="space-y-3">
              <p>
                Are you sure you want to delete <strong>{subjectToDelete.name}</strong> ({subjectToDelete.code})?
              </p>
              {subjectToDeleteExpsCount > 0 ? (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed">
                  <strong>Warning:</strong> This subject has <strong>{subjectToDeleteExpsCount} experiment(s)</strong> attached to it. Deleting this subject will permanently remove all associated experiments and lab checklist items.
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  This subject currently has no experiments attached.
                </p>
              )}
            </div>
          ) : null
        }
        confirmText="Delete Subject & Experiments"
        isDestructive
      />
    </div>
  );
}
