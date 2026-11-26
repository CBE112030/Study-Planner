/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {Plus, Trash2} from 'lucide-react';
import {MotionConfig} from 'motion/react';
import {useMemo, useState} from 'react';
import {AddStudyLogModal} from './components/AddStudyLogModal';
import {ConfirmClearModal} from './components/ConfirmClearModal';
import {DailyTasksSection} from './components/DailyTasksSection';
import {OverviewSection} from './components/OverviewSection';
import {SubjectModal} from './components/SubjectModal';
import {SubjectsSection} from './components/SubjectsSection';
import {WeeklyChartSection} from './components/WeeklyChartSection';
import {useLocalStorage} from './hooks/useLocalStorage';
import type {
  StudyLog,
  StudyTask,
  Subject,
  SubjectColorKey,
} from './types/study';
import {
  formatTodayHeaderZH,
  getTodayISO,
  getWeekDaysMondayToSunday,
} from './utils/date';

const LEGACY_KEYS = [
  'study_planner_subjects_v1',
  'study_planner_logs_v1',
  'study_planner_tasks_v1',
] as const;

const MIGRATION_KEY = 'study_planner_empty_init_v2';

const STORAGE_KEYS = {
  SUBJECTS: 'study_planner_subjects_v2',
  LOGS: 'study_planner_logs_v2',
  TASKS: 'study_planner_tasks_v2',
} as const;

// One-time cleanup of legacy sample-data keys so existing previews start blank
// without wiping user-created data on subsequent reloads.
if (typeof window !== 'undefined') {
  try {
    if (!window.localStorage.getItem(MIGRATION_KEY)) {
      for (const legacyKey of LEGACY_KEYS) {
        window.localStorage.removeItem(legacyKey);
      }
      window.localStorage.setItem(MIGRATION_KEY, '1');
    }
  } catch {
    // Ignore storage access errors in restricted browsing contexts
  }
}

const emptySubjects = (): Subject[] => [];
const emptyLogs = (): StudyLog[] => [];
const emptyTasks = (): StudyTask[] => [];

export default function App() {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>(
    STORAGE_KEYS.SUBJECTS,
    emptySubjects,
  );
  const [logs, setLogs] = useLocalStorage<StudyLog[]>(
    STORAGE_KEYS.LOGS,
    emptyLogs,
  );
  const [tasks, setTasks] = useLocalStorage<StudyTask[]>(
    STORAGE_KEYS.TASKS,
    emptyTasks,
  );

  // Modals & transient UI state
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);
  const [logDefaultDate, setLogDefaultDate] = useState<string | undefined>(
    undefined,
  );
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const todayISO = getTodayISO();
  const todayHeaderLabel = useMemo(() => formatTodayHeaderZH(), []);

  const hasAnyData =
    subjects.length > 0 || logs.length > 0 || tasks.length > 0;

  // Overview derived metrics (all default to 0 when empty)
  const overviewStats = useMemo(() => {
    const todayHours = logs
      .filter((l) => l.date === todayISO)
      .reduce((sum, l) => sum + l.hours, 0);

    const currentWeekISOSet = new Set(
      getWeekDaysMondayToSunday(0).map((d) => d.iso),
    );
    const weekLogs = logs.filter((l) => currentWeekISOSet.has(l.date));
    const weekTotalHours = weekLogs.reduce((sum, l) => sum + l.hours, 0);

    const completedTaskCount = tasks.filter((t) => t.completed).length;
    const totalTaskCount = tasks.length;

    const totalTargetHours = subjects.reduce(
      (sum, s) => sum + s.targetHours,
      0,
    );
    const totalCompletedHours = subjects.reduce(
      (sum, s) => sum + s.completedHours,
      0,
    );
    const overallProgressPct =
      totalTargetHours > 0
        ? Math.min(
            Math.round((totalCompletedHours / totalTargetHours) * 100),
            100,
          )
        : 0;

    return {
      todayHours,
      weekTotalHours,
      weekLogCount: weekLogs.length,
      completedTaskCount,
      totalTaskCount,
      overallProgressPct,
      totalCompletedHours,
      totalTargetHours,
      subjectCount: subjects.length,
    };
  }, [logs, tasks, subjects, todayISO]);

  // Handlers: Study Logs
  const handleOpenAddLog = (defaultDate?: string) => {
    setLogDefaultDate(defaultDate ?? todayISO);
    setIsAddLogOpen(true);
  };

  const handleSaveStudyLog = (payload: {
    date: string;
    subjectId: string;
    hours: number;
    note?: string;
  }) => {
    const newLog: StudyLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: payload.date,
      subjectId: payload.subjectId,
      hours: payload.hours,
      note: payload.note,
      createdAt: Date.now(),
    };

    setLogs((prev) => [newLog, ...prev]);
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === payload.subjectId
          ? {
              ...s,
              completedHours:
                Math.round((s.completedHours + payload.hours) * 100) / 100,
            }
          : s,
      ),
    );
  };

  const handleDeleteLog = (logId: string) => {
    const target = logs.find((l) => l.id === logId);
    setLogs((prev) => prev.filter((l) => l.id !== logId));
    if (target) {
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === target.subjectId
            ? {
                ...s,
                completedHours: Math.max(
                  0,
                  Math.round((s.completedHours - target.hours) * 100) / 100,
                ),
              }
            : s,
        ),
      );
    }
  };

  // Handlers: Subjects
  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (payload: {
    id?: string;
    name: string;
    targetHours: number;
    completedHours: number;
    color: SubjectColorKey;
  }) => {
    if (payload.id) {
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === payload.id
            ? {
                ...s,
                name: payload.name,
                targetHours: payload.targetHours,
                completedHours: payload.completedHours,
                color: payload.color,
              }
            : s,
        ),
      );
    } else {
      const newSubject: Subject = {
        id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: payload.name,
        targetHours: payload.targetHours,
        completedHours: payload.completedHours,
        color: payload.color,
      };
      setSubjects((prev) => [...prev, newSubject]);
    }
  };

  const handleDeleteSubject = (subjectId: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    setLogs((prev) => prev.filter((l) => l.subjectId !== subjectId));
    setTasks((prev) =>
      prev.map((t) =>
        t.subjectId === subjectId ? {...t, subjectId: ''} : t,
      ),
    );
  };

  // Handlers: Daily Study Tasks
  const handleAddTask = (
    payload: Omit<StudyTask, 'id' | 'completed' | 'createdAt'>,
  ) => {
    const newTask: StudyTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: payload.title,
      subjectId: payload.subjectId,
      details: payload.details,
      plannedHours: payload.plannedHours,
      timeSlot: payload.timeSlot,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? {...t, completed: !t.completed} : t,
      ),
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Clear all data
  const handleClearAllData = () => {
    setSubjects([]);
    setLogs([]);
    setTasks([]);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#FAF8F5] text-[#1F1D26]">
        {/* Top Bar Contract: 3 zones separated by gap-8 */}
        <header className="border-b border-[#E7E3DC] bg-white/85 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
            <a
              href="#overview"
              className="whitespace-nowrap shrink-0 text-lg font-bold tracking-tight text-[#1F1D26]"
            >
              Study Planner
            </a>

            <nav
              aria-label="頁面快速導覽"
              className="hidden items-center gap-7 text-sm font-medium text-[#5A5566] md:flex"
            >
              <a
                href="#overview"
                className="whitespace-nowrap shrink-0 transition-colors hover:text-[#6D4AFF] hover:underline hover:underline-offset-4"
              >
                學習總覽
              </a>
              <a
                href="#weekly-chart"
                className="whitespace-nowrap shrink-0 transition-colors hover:text-[#6D4AFF] hover:underline hover:underline-offset-4"
              >
                每週統計
              </a>
              <a
                href="#subjects"
                className="whitespace-nowrap shrink-0 transition-colors hover:text-[#6D4AFF] hover:underline hover:underline-offset-4"
              >
                科目進度
              </a>
              <a
                href="#daily-plan"
                className="whitespace-nowrap shrink-0 transition-colors hover:text-[#6D4AFF] hover:underline hover:underline-offset-4"
              >
                讀書計畫
              </a>
            </nav>

            <div className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={() => handleOpenAddLog(todayISO)}
                className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#6D4AFF] px-4 text-xs font-medium text-white transition-colors hover:bg-[#5B38EC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D4AFF]"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>記錄學習</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* Workspace Title Strip */}
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1F1D26] sm:text-[28px]">
                學習進度管理助手
              </h1>
              <p className="mt-1 text-sm text-[#5A5566]">
                <span>{todayHeaderLabel}</span>
                <span className="mx-2 text-[#C8C2B8]" aria-hidden="true">
                  ·
                </span>
                <span>大學生專屬讀書與時數追蹤工作台</span>
              </p>
            </div>

            {/* Clear all data control */}
            <div className="flex items-center self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(true)}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-[#E7E3DC] bg-white px-3.5 text-xs font-medium text-[#5A5566] transition-colors hover:border-[#FCA5A5] hover:bg-[#FEF2F2] hover:text-[#DC2626] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D4AFF]"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>清除所有資料</span>
              </button>
            </div>
          </div>

          {/* Section 1: 學習資訊總覽 */}
          <OverviewSection {...overviewStats} />

          {/* Main 2-Column Responsive Grid */}
          <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            {/* Left Column: 每週學習時數圖表 + 科目學習進度 */}
            <div className="space-y-6 lg:col-span-7">
              <WeeklyChartSection
                logs={logs}
                subjects={subjects}
                onOpenAddLog={handleOpenAddLog}
                onDeleteLog={handleDeleteLog}
              />

              <SubjectsSection
                subjects={subjects}
                onAddSubject={handleOpenAddSubject}
                onEditSubject={handleOpenEditSubject}
                onDeleteSubject={handleDeleteSubject}
              />
            </div>

            {/* Right Column: 每日讀書計畫 */}
            <div className="lg:col-span-5">
              <DailyTasksSection
                tasks={tasks}
                subjects={subjects}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
              />
            </div>
          </div>
        </main>

        <footer className="mt-10 border-t border-[#E7E3DC] bg-[#FAF8F5]">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-[#847F90] sm:flex-row sm:px-6 lg:px-8">
            <span>Study Planner 學習進度管理助手</span>
            <span>所有科目、學習紀錄與讀書任務皆自動儲存於本機瀏覽器</span>
          </div>
        </footer>

        {/* Modals */}
        <AddStudyLogModal
          isOpen={isAddLogOpen}
          defaultDate={logDefaultDate}
          subjects={subjects}
          onClose={() => setIsAddLogOpen(false)}
          onSave={handleSaveStudyLog}
          onCreateSubject={handleOpenAddSubject}
        />

        <SubjectModal
          isOpen={isSubjectModalOpen}
          editingSubject={editingSubject}
          onClose={() => setIsSubjectModalOpen(false)}
          onSave={handleSaveSubject}
        />

        <ConfirmClearModal
          isOpen={isClearModalOpen}
          hasData={hasAnyData}
          onClose={() => setIsClearModalOpen(false)}
          onConfirm={handleClearAllData}
        />
      </div>
    </MotionConfig>
  );
}
