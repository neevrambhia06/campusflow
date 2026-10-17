import { useState, useEffect } from 'react';
import { 
  X, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Bookmark, 
  KeyRound, 
  Globe, 
  Check, 
  Calendar, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useStore } from '@/store/useStore';
import { useToast } from '@/store/useToast';
import { 
  MoodleExtractedExperiment, 
  MoodleScanResult, 
  scanMoodle, 
  applyMoodleSyncToStore,
  getStoredCredentials,
  saveStoredCredentials
} from '@/services/moodleService';
import { generateBookmarkletCode } from '@/services/moodleBookmarklet';

interface MoodleSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSyncData?: MoodleExtractedExperiment[];
}

export function MoodleSyncModal({ isOpen, onClose, initialSyncData }: MoodleSyncModalProps) {
  const { subjects, assignments, addSubject, addAssignment, updateAssignment } = useStore();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'direct' | 'bookmarklet' | 'paste'>('direct');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  // Scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanError, setScanError] = useState<string | null>(null);

  // Review & apply state
  const [scannedData, setScannedData] = useState<MoodleExtractedExperiment[] | null>(null);
  const [siteDetails, setSiteDetails] = useState<{ siteName?: string; userName?: string } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Paste JSON state
  const [pastedJson, setPastedJson] = useState('');

  // Load stored credentials on mount
  useEffect(() => {
    const creds = getStoredCredentials();
    if (creds.url) setUrl(creds.url);
    if (creds.username) setUsername(creds.username);
    if (creds.password) setPassword(creds.password);
    if (creds.remember !== undefined) setRemember(creds.remember);
  }, []);

  // Handle incoming bookmarklet payload if passed via props
  useEffect(() => {
    if (initialSyncData && initialSyncData.length > 0) {
      setScannedData(initialSyncData);
      setSiteDetails({ siteName: 'Moodle Portal', userName: 'Student' });
    }
  }, [initialSyncData]);

  if (!isOpen) return null;

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanError(null);
    setIsScanning(true);
    setScanProgress(10);
    setScanStep('Connecting to Moodle...');

    try {
      const creds = { url, username, password, remember };
      saveStoredCredentials(creds);

      const result: MoodleScanResult = await scanMoodle(creds, (step, percent) => {
        setScanStep(step);
        setScanProgress(percent);
      });

      setScannedData(result.experiments);
      setSiteDetails({ siteName: result.siteName, userName: result.userName });
      addToast(`Found ${result.experiments.length} experiments across ${result.coursesCount} courses!`);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setScanError(error?.message || 'Failed to sync with Moodle. Check your URL and credentials.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleApplySync = async () => {
    if (!scannedData || scannedData.length === 0) return;
    setIsApplying(true);

    try {
      const { added, updated, subjectsCreated } = await applyMoodleSyncToStore(
        scannedData,
        subjects,
        assignments,
        { addSubject, addAssignment, updateAssignment }
      );

      addToast(`Sync successful! Added ${added} new, updated ${updated} experiments (${subjectsCreated} new subjects).`);
      onClose();
      setScannedData(null);
    } catch (err: unknown) {
      const error = err as { message?: string };
      addToast(error?.message || 'Failed to save synced experiments.');
    } finally {
      setIsApplying(false);
    }
  };

  const toggleExperimentSelection = (assignId: number) => {
    if (!scannedData) return;
    setScannedData(
      scannedData.map((e) =>
        e.moodleAssignId === assignId ? { ...e, selected: !e.selected } : e
      )
    );
  };

  const selectAll = (select: boolean) => {
    if (!scannedData) return;
    setScannedData(scannedData.map((e) => ({ ...e, selected: select })));
  };

  const handleParsePastedJson = () => {
    try {
      setScanError(null);
      const parsed = JSON.parse(pastedJson);
      const exps = Array.isArray(parsed) ? parsed : parsed.experiments;
      if (!Array.isArray(exps) || exps.length === 0) {
        throw new Error('Valid JSON array of experiments not found in pasted content.');
      }
      setScannedData(exps.map((e) => ({ ...e, selected: true })));
      setSiteDetails({ siteName: 'Pasted Moodle Data', userName: 'Student' });
      addToast(`Successfully parsed ${exps.length} experiments!`);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setScanError(error?.message || 'Could not parse JSON. Please check format.');
    }
  };

  const bookmarkletCode = generateBookmarkletCode();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50/50 via-white to-indigo-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-xs font-bold text-lg">
              M
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                Moodle Auto-Sync
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-orange-700">
                  Live Flow
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Automatically scans subjects, experiments, deadlines & submission statuses.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: Not Scanned Yet - Show Credentials / Bookmarklet Tabs */}
          {!scannedData && (
            <>
              {/* Tab Navigation */}
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setActiveTab('direct')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'direct'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Direct Login
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('bookmarklet')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'bookmarklet'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5 text-indigo-600" />
                  1-Click Bookmarklet
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'paste'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                  Paste JSON
                </button>
              </div>

              {/* Tab 1: Direct Login Form */}
              {activeTab === 'direct' && (
                <form onSubmit={handleStartScan} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Moodle URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Globe className="h-4 w-4" />
                      </div>
                      <input
                        type="url"
                        required
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://moodle.yourcollege.edu"
                        className="block w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      The base address of your college Moodle or LMS portal.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Username / Roll No
                      </label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. 21BCE045 or student ID"
                        className="block w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="block w-full px-3 pr-10 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-medium">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      Remember credentials on this browser
                    </label>
                  </div>

                  {scanError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-700">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                      <div>
                        <p className="font-bold">Sync Error</p>
                        <p className="mt-0.5">{scanError}</p>
                        <p className="mt-1 text-slate-500">
                          Tip: If your college has disabled external Web Services or uses single sign-on, use the <b>1-Click Bookmarklet</b> tab above!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Progress Indicator */}
                  {isScanning && (
                    <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
                        <span className="flex items-center gap-2">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                          {scanStep}
                        </span>
                        <span>{scanProgress}%</span>
                      </div>
                      <div className="w-full bg-indigo-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-3">
                    <Button
                      type="submit"
                      disabled={isScanning}
                      className="w-full gap-2 bg-gradient-to-r from-orange-600 to-indigo-600 hover:from-orange-700 hover:to-indigo-700 text-white font-bold py-2.5 shadow-sm"
                    >
                      <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
                      {isScanning ? 'Scanning Moodle...' : 'Start Automatic Scan'}
                    </Button>
                  </div>
                </form>
              )}

              {/* Tab 2: 1-Click Bookmarklet */}
              {activeTab === 'bookmarklet' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/70 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-indigo-900 text-sm">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      Universal 1-Click Sync
                    </div>
                    <p className="text-xs text-indigo-800 leading-relaxed">
                      Works on <b>100% of Moodle sites</b> (including college VPNs, SSO logins, and instances with disabled mobile APIs).
                    </p>

                    <div className="p-3 bg-white rounded-xl border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Drag this button to your Bookmarks Bar:
                        </span>
                        <p className="text-xs font-semibold text-slate-700">CampusFlow Moodle Sync</p>
                      </div>
                      {/* Draggable bookmarklet link */}
                      <a
                        href={bookmarkletCode}
                        onClick={(e) => {
                          e.preventDefault();
                          alert('Drag this button to your browser bookmarks bar (Ctrl+Shift+B or Cmd+Shift+B to show bookmarks bar).');
                        }}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-grab active:cursor-grabbing inline-flex items-center gap-1.5 shrink-0"
                        title="Drag to bookmarks bar"
                      >
                        <Bookmark className="h-3.5 w-3.5" />
                        ⚡ CampusFlow Sync
                      </a>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <p className="font-bold text-slate-800">How to use:</p>
                    <ol className="list-decimal list-inside space-y-1.5 pl-1">
                      <li>Drag the blue <b>⚡ CampusFlow Sync</b> button above to your browser bookmarks bar.</li>
                      <li>Open your college Moodle in a new tab and go to your course/lab assignment page.</li>
                      <li>Click the bookmark! It reads all experiments and submission statuses, then opens CampusFlow ready to import.</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Tab 3: Paste JSON */}
              {activeTab === 'paste' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Paste Sync JSON from Bookmarklet
                    </label>
                    <textarea
                      rows={6}
                      value={pastedJson}
                      onChange={(e) => setPastedJson(e.target.value)}
                      placeholder='[{"title": "Experiment 1", "dueDate": "2026-10-25", "isSubmitted": true, ...}]'
                      className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50"
                    />
                  </div>

                  {scanError && (
                    <div className="p-3 rounded-xl bg-red-50 text-xs text-red-700 font-semibold">
                      {scanError}
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={handleParsePastedJson}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  >
                    Parse & Review Experiments
                  </Button>
                </div>
              )}
            </>
          )}

          {/* STEP 2: Experiments Scanned - Review & Confirmation Screen */}
          {scannedData && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">
                      {siteDetails?.siteName || 'Moodle'} • {scannedData.length} Experiments Found
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      {scannedData.filter((e) => e.isSubmitted).length} submitted on Moodle,{' '}
                      {scannedData.filter((e) => !e.isSubmitted).length} pending.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => selectAll(true)}
                    className="text-[11px] font-bold text-emerald-800 hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-emerald-300">•</span>
                  <button
                    type="button"
                    onClick={() => selectAll(false)}
                    className="text-[11px] font-bold text-emerald-800 hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Experiments List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {scannedData.map((exp) => (
                  <div
                    key={`${exp.courseId}-${exp.moodleAssignId}`}
                    onClick={() => toggleExperimentSelection(exp.moodleAssignId)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50 ${
                      exp.selected ? 'bg-white' : 'bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={exp.selected}
                      onChange={() => toggleExperimentSelection(exp.moodleAssignId)}
                      className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {exp.courseCode}
                        </span>
                        <span className="text-xs font-bold text-indigo-600">
                          Exp {exp.experimentNumber}
                        </span>
                        {exp.isSubmitted ? (
                          <Badge variant="success" className="text-[10px] px-1.5 py-0">
                            Submitted on Moodle
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                            Pending Submission
                          </Badge>
                        )}
                        {exp.isGraded && (
                          <Badge variant="indigo" className="text-[10px] px-1.5 py-0">
                            Graded
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-900 truncate">{exp.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          Due: {exp.dueDate}
                        </span>
                        <a
                          href={exp.moodleUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-indigo-600 hover:underline flex items-center gap-0.5"
                        >
                          View in Moodle <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3">
                <Button
                  variant="outline"
                  onClick={() => setScannedData(null)}
                  disabled={isApplying}
                >
                  Back to Settings
                </Button>
                <Button
                  onClick={handleApplySync}
                  disabled={isApplying || !scannedData.some((e) => e.selected)}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  <Check className="h-4 w-4" />
                  {isApplying ? 'Importing...' : `Import ${scannedData.filter((e) => e.selected).length} Experiments`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
