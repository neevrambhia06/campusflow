import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useToast } from '@/store/useToast';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  ChevronRight, 
  Search, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  GraduationCap,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { ExperimentFormModal } from '@/components/assignments/ExperimentFormModal';
import { SubjectFormModal } from '@/components/subjects/SubjectFormModal';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { WorkflowStage, Assignment } from '@/types';
import { formatDate, getDaysRemaining, cn, getAssignmentChecklistStatus } from '@/utils';

export function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { subjects, assignments, deleteSubject, deleteAssignment } = useStore();
  const { addToast } = useToast();

  const [isAddExpOpen, setIsAddExpOpen] = useState(false);
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [isDeleteSubjectOpen, setIsDeleteSubjectOpen] = useState(false);
  const [experimentToDelete, setExperimentToDelete] = useState<Assignment | null>(null);

  // Search, Filter, and Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | WorkflowStage>('ALL');
  const [sortBy, setSortBy] = useState<'exp_asc' | 'exp_desc' | 'due_earliest' | 'due_latest'>('exp_asc');

  const subject = subjects.find((s) => s.id === id);

  // All experiments for this subject
  const subjectAssignments = useMemo(() => {
    return assignments.filter((a) => a.subjectId === id);
  }, [assignments, id]);

  // Compute metrics
  const totalCount = subjectAssignments.length;
  const completedCount = subjectAssignments.filter((a) => a.status === 'COMPLETED').length;
  const inProgressCount = subjectAssignments.filter((a) => 
    a.status === 'IN_PROGRESS' || a.status === 'NOT_STARTED' || a.status === 'READY_FOR_UPLOAD'
  ).length;
  const uploadedCount = subjectAssignments.filter((a) => 
    a.status === 'UPLOADED' || a.status === 'FACULTY_CHECKING'
  ).length;
  const overdueCount = subjectAssignments.filter((a) => 
    a.status !== 'COMPLETED' && getDaysRemaining(a.dueDate) < 0
  ).length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered & Sorted experiments
  const filteredAssignments = useMemo(() => {
    let result = [...subjectAssignments];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.notes?.toLowerCase().includes(q) ||
          a.experimentNumber.toString().includes(q) ||
          `exp ${a.experimentNumber}`.includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((a) => a.status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'exp_asc') {
        return (a.experimentNumber || 0) - (b.experimentNumber || 0);
      }
      if (sortBy === 'exp_desc') {
        return (b.experimentNumber || 0) - (a.experimentNumber || 0);
      }
      if (sortBy === 'due_earliest') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'due_latest') {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      return 0;
    });

    return result;
  }, [subjectAssignments, searchQuery, statusFilter, sortBy]);

  if (!subject) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <BookOpen className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Subject Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The requested subject does not exist or may have been deleted.
        </p>
        <Button onClick={() => navigate('/subjects')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Subjects
        </Button>
      </div>
    );
  }


  const handleDeleteSubject = () => {
    deleteSubject(subject.id);
    addToast('Subject and all associated experiments deleted successfully.');
    navigate('/subjects');
  };

  const handleDeleteExperiment = () => {
    if (!experimentToDelete) return;
    deleteAssignment(experimentToDelete.id);
    addToast(`Experiment ${experimentToDelete.experimentNumber} deleted successfully.`);
    setExperimentToDelete(null);
  };

  return (
    <div className="space-y-8 pb-14 max-w-7xl mx-auto">
      {/* 1. Top Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/subjects')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Subjects</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditSubjectOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <Edit className="h-3.5 w-3.5 text-slate-500" />
            <span>Edit Subject</span>
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteSubjectOpen(true)}
            className="gap-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Subject</span>
          </Button>
        </div>
      </div>

      {/* 2. Subject Hero Header Banner */}
      <div className="bg-white rounded-2xl shadow-soft border border-slate-200/80 overflow-hidden">
        {/* Color accent strip */}
        <div className={cn('h-3.5 w-full', subject.color || 'bg-indigo-600')} />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              {/* Badges row */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <Badge
                  variant="secondary"
                  className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/60"
                >
                  {subject.semester}
                </Badge>

                {subject.code && (
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {subject.code}
                  </span>
                )}

                {subject.faculty && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                    <span>Faculty: {subject.faculty}</span>
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold tracking-tight text-slate-900">
                {subject.name}
              </h1>

              {/* Description */}
              {subject.description ? (
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {subject.description}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">No course description provided.</p>
              )}
            </div>

            {/* Quick Actions & Progress */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 w-full lg:w-72 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <Button
                onClick={() => setIsAddExpOpen(true)}
                className="gap-2 w-full sm:w-auto lg:w-full justify-center shadow-xs font-semibold"
              >
                <Plus className="h-4 w-4" />
                <span>Add Experiment</span>
              </Button>

              {/* Overall Course Progress */}
              <div className="w-full bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-500 uppercase tracking-wider">Course Progress</span>
                  <span className="text-slate-900">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      subject.color || 'bg-indigo-600'
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 font-medium">
                  <span>{completedCount} of {totalCount} completed</span>
                  <span>{totalCount - completedCount} remaining</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Analytics / Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total</span>
            <BookOpen className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold font-display text-slate-900">{totalCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Experiments in syllabus</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-display text-emerald-700">{completedCount}</p>
          <p className="text-[11px] text-emerald-600/80 mt-0.5">{progress}% syllabus covered</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">In Progress</span>
            <Clock className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold font-display text-indigo-700">{inProgressCount}</p>
          <p className="text-[11px] text-indigo-600/80 mt-0.5">Writing & preparation</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              {overdueCount > 0 ? 'Overdue' : 'Uploaded'}
            </span>
            <AlertCircle className={cn('h-4 w-4', overdueCount > 0 ? 'text-red-500' : 'text-amber-500')} />
          </div>
          <p className={cn('text-2xl font-bold font-display', overdueCount > 0 ? 'text-red-600' : 'text-amber-700')}>
            {overdueCount > 0 ? overdueCount : uploadedCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {overdueCount > 0 ? 'Needs attention' : 'Awaiting faculty check'}
          </p>
        </div>
      </div>

      {/* 4. Experiments Section with Search, Filter & Controls */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
              Experiments & Lab Tasks
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Click any experiment to open its step-by-step workflow, checklist, and notes.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setIsAddExpOpen(true)}
            className="gap-2 shrink-0 self-start sm:self-auto font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Experiment</span>
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search experiments by title, description, or #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort experiments"
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="exp_asc">Exp # (Ascending)</option>
                <option value="exp_desc">Exp # (Descending)</option>
                <option value="due_earliest">Due Date (Earliest)</option>
                <option value="due_latest">Due Date (Latest)</option>
              </select>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Filter:
            </span>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={cn(
                'px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0',
                statusFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              )}
            >
              All ({totalCount})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={cn(
                'px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0',
                statusFilter === 'IN_PROGRESS'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              )}
            >
              In Progress ({inProgressCount})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('UPLOADED')}
              className={cn(
                'px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0',
                statusFilter === 'UPLOADED'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              )}
            >
              Uploaded ({uploadedCount})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('COMPLETED')}
              className={cn(
                'px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0',
                statusFilter === 'COMPLETED'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              )}
            >
              Completed ({completedCount})
            </button>

            {(statusFilter !== 'ALL' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline ml-auto shrink-0 px-2"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* 5. Experiments List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
          {filteredAssignments.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredAssignments.map((assignment) => {
                const daysRemaining = getDaysRemaining(assignment.dueDate);
                const isOverdue = daysRemaining < 0 && assignment.status !== 'COMPLETED';
                const isCompleted = assignment.status === 'COMPLETED';

                return (
                  <div
                    key={assignment.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/80 transition-colors group gap-4"
                  >
                    {/* Left: Experiment Avatar & Info */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                      <div
                        className={cn(
                          'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm shadow-2xs',
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : `${subject.color || 'bg-indigo-600'} text-white`
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <span>{assignment.experimentNumber || '—'}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <Link
                            to={`/assignments/${assignment.id}`}
                            className="text-sm sm:text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                          >
                            Exp {assignment.experimentNumber}: {assignment.title}
                          </Link>
                        </div>

                        {assignment.description ? (
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {assignment.description}
                          </p>
                        ) : assignment.notes ? (
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {assignment.notes}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400">No notes added</p>
                        )}
                      </div>
                    </div>

                    {/* Right: Meta, Status & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Due date countdown */}
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 sm:justify-end mb-0.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDate(assignment.dueDate)}</span>
                        </p>
                        <p
                          className={cn(
                            'text-[11px] font-bold',
                            isCompleted
                              ? 'text-emerald-600'
                              : isOverdue
                              ? 'text-red-600'
                              : daysRemaining === 0
                              ? 'text-amber-600'
                              : 'text-slate-500'
                          )}
                        >
                          {isCompleted
                            ? 'Completed'
                            : isOverdue
                            ? `Overdue by ${Math.abs(daysRemaining)} days`
                            : daysRemaining === 0
                            ? 'Due Today'
                            : `${daysRemaining} days left`}
                        </p>
                      </div>

                      {/* Status badge: Shows the next thing left from the assignment checklist */}
                      {(() => {
                        const statusInfo = getAssignmentChecklistStatus(assignment);
                        return (
                          <div className="w-32 sm:w-44 flex justify-end">
                            <Badge variant={statusInfo.variant} className="text-[11px] font-bold">
                              {statusInfo.label}
                            </Badge>
                          </div>
                        );
                      })()}

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/assignments/${assignment.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
                        >
                          <span>Open</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setExperimentToDelete(assignment)}
                          title="Delete Experiment"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : subjectAssignments.length === 0 ? (
            /* Empty state when course has 0 experiments */
            <div className="p-12 sm:p-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No experiments yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                Start tracking lab work for <strong>{subject.name}</strong> by adding your first experiment.
              </p>
              <Button
                onClick={() => setIsAddExpOpen(true)}
                className="gap-2 shadow-xs font-semibold"
              >
                <Plus className="h-4 w-4" />
                <span>Add Experiment #1</span>
              </Button>
            </div>
          ) : (
            /* Empty state when search/filter returns 0 matches */
            <div className="p-10 text-center">
              <p className="text-sm font-semibold text-slate-700 mb-1">No experiments match your criteria</p>
              <p className="text-xs text-slate-500 mb-4">Try clearing your search query or status filter.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modals & Dialogs */}
      <ExperimentFormModal
        isOpen={isAddExpOpen}
        onClose={() => setIsAddExpOpen(false)}
        preselectedSemester={subject.semester}
        preselectedSubjectId={subject.id}
      />

      <SubjectFormModal
        isOpen={isEditSubjectOpen}
        onClose={() => setIsEditSubjectOpen(false)}
        subjectToEdit={subject}
      />

      {/* Subject Deletion Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteSubjectOpen}
        onClose={() => setIsDeleteSubjectOpen(false)}
        onConfirm={handleDeleteSubject}
        title="Delete Subject"
        message={
          <div className="space-y-3">
            <p>
              Are you sure you want to delete <strong>{subject.name}</strong> ({subject.code})?
            </p>
            {subjectAssignments.length > 0 ? (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed">
                <strong>Warning:</strong> This subject has <strong>{subjectAssignments.length} experiment(s)</strong> attached to it. Deleting this subject will permanently remove all associated experiments, steps, checklists, and notes.
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                This subject currently has no experiments attached.
              </p>
            )}
          </div>
        }
        confirmText="Delete Subject & All Experiments"
        isDestructive
      />

      {/* Individual Experiment Deletion Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!experimentToDelete}
        onClose={() => setExperimentToDelete(null)}
        onConfirm={handleDeleteExperiment}
        title="Delete Experiment"
        message={
          experimentToDelete ? (
            <p>
              Are you sure you want to delete <strong>Exp {experimentToDelete.experimentNumber}: {experimentToDelete.title}</strong>? This action cannot be undone.
            </p>
          ) : null
        }
        confirmText="Delete Experiment"
        isDestructive
      />
    </div>
  );
}
