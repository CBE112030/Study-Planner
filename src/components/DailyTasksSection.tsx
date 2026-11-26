import {
  Check,
  ChevronDown,
  ClipboardList,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {useMemo, useState} from 'react';
import {SUBJECT_COLOR_MAP} from '../data/initialData';
import type {StudyTask, Subject} from '../types/study';
import {formatHours, parsePositiveHours} from '../utils/number';

type TaskFilter = 'all' | 'pending' | 'completed';

interface DailyTasksSectionProps {
  tasks: StudyTask[];
  subjects: Subject[];
  onAddTask: (task: Omit<StudyTask, 'id' | 'completed' | 'createdAt'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export function DailyTasksSection({
  tasks,
  subjects,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: DailyTasksSectionProps) {
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(
    tasks[2]?.id ?? tasks[0]?.id ?? null,
  );
  const [isAdding, setIsAdding] = useState(false);

  // Add task form state
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [plannedHours, setPlannedHours] = useState('1.5');
  const [timeSlot, setTimeSlot] = useState('');
  const [details, setDetails] = useState('');
  const [formError, setFormError] = useState('');

  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    for (const s of subjects) {
      map.set(s.id, s);
    }
    return map;
  }, [subjects]);

  const counts = useMemo(() => {
    const completed = tasks.filter((t) => t.completed).length;
    return {
      all: tasks.length,
      pending: tasks.length - completed,
      completed,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (filter === 'pending') return tasks.filter((t) => !t.completed);
    if (filter === 'completed') return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  const handleOpenAdd = () => {
    setSubjectId((prev) =>
      prev && subjects.some((s) => s.id === prev)
        ? prev
        : (subjects[0]?.id ?? ''),
    );
    setFormError('');
    setIsAdding((prev) => !prev);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError('請輸入讀書任務名稱');
      return;
    }
    const parsedHours = parsePositiveHours(plannedHours);
    if (parsedHours === null || parsedHours <= 0 || parsedHours > 24) {
      setFormError('預計時數需大於 0 且不超過 24 小時');
      return;
    }

    onAddTask({
      title: trimmedTitle,
      subjectId,
      plannedHours: parsedHours,
      timeSlot: timeSlot.trim() || undefined,
      details: details.trim(),
    });

    setTitle('');
    setTimeSlot('');
    setDetails('');
    setPlannedHours('1.5');
    setFormError('');
    setIsAdding(false);
  };

  const progressRatio =
    counts.all > 0 ? counts.completed / counts.all : 0;

  return (
    <section
      id="daily-plan"
      aria-label="每日讀書計畫"
      className="flex flex-col rounded-2xl border border-[#E7E3DC] bg-white p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#1F1D26]">
            每日讀書計畫
          </h2>
          <p className="mt-1 text-xs text-[#847F90] tabular-nums">
            已完成 {counts.completed} / {counts.all} 項任務 · 點擊項目可展開詳情
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#EFEBFD] px-3.5 text-xs font-medium text-[#6D4AFF] transition-colors hover:bg-[#E4DDFC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D4AFF]"
        >
          {isAdding ? (
            <>
              <X className="h-4 w-4" aria-hidden="true" />
              <span>收合表單</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>新增任務</span>
            </>
          )}
        </button>
      </div>

      {/* Task progress strip */}
      <div className="mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EFEBFD]">
          <motion.div
            className="h-full w-full origin-left rounded-full bg-[#6D4AFF]"
            initial={{scaleX: 0}}
            animate={{scaleX: progressRatio}}
            transition={{duration: 0.3, ease: [0.16, 1, 0.3, 1]}}
          />
        </div>
      </div>

      {/* Collapsible Add Task Form */}
      <AnimatePresence initial={false}>
        {isAdding && (
          <motion.form
            initial={{opacity: 0, y: -6}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -6}}
            transition={{duration: 0.18, ease: [0.16, 1, 0.3, 1]}}
            onSubmit={handleSubmit}
            noValidate
            className="mt-4 space-y-3 rounded-xl border border-[#E7E3DC] bg-[#FAF8F5] p-4"
          >
            <div>
              <label
                htmlFor="task-title-input"
                className="block text-xs font-medium text-[#5A5566]"
              >
                任務名稱 <span className="text-[#DC2626]">*</span>
              </label>
              <input
                id="task-title-input"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (formError) setFormError('');
                }}
                placeholder="例如：完成線性代數第三章習題"
                className="mt-1.5 h-10 w-full rounded-xl border border-[#DFD9CE] bg-white px-3 text-sm text-[#1F1D26] placeholder:text-[#A39DAE] focus:border-[#6D4AFF] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="task-subject-select"
                  className="block text-xs font-medium text-[#5A5566]"
                >
                  關聯科目
                </label>
                <select
                  id="task-subject-select"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#DFD9CE] bg-white px-3 text-sm text-[#1F1D26] focus:border-[#6D4AFF] focus:outline-none"
                >
                  <option value="">一般自習（不指定科目）</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    htmlFor="task-hours-input"
                    className="block text-xs font-medium text-[#5A5566]"
                  >
                    預計時數
                  </label>
                  <input
                    id="task-hours-input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="24"
                    step="any"
                    value={plannedHours}
                    onChange={(e) => {
                      setPlannedHours(e.target.value);
                      if (formError) setFormError('');
                    }}
                    className="font-num mt-1.5 h-10 w-full rounded-xl border border-[#DFD9CE] bg-white px-3 text-sm text-[#1F1D26] tabular-nums focus:border-[#6D4AFF] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="task-slot-input"
                    className="block text-xs font-medium text-[#5A5566]"
                  >
                    預計時段
                  </label>
                  <input
                    id="task-slot-input"
                    type="text"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    placeholder="19:00-20:30"
                    className="mt-1.5 h-10 w-full rounded-xl border border-[#DFD9CE] bg-white px-3 text-sm text-[#1F1D26] placeholder:text-[#A39DAE] focus:border-[#6D4AFF] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="task-details-input"
                className="block text-xs font-medium text-[#5A5566]"
              >
                詳細內容 / 學習重點
              </label>
              <textarea
                id="task-details-input"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="記錄需要完成的章節、頁數、習題編號或重點備忘..."
                className="mt-1.5 w-full resize-none rounded-xl border border-[#DFD9CE] bg-white px-3 py-2 text-sm text-[#1F1D26] placeholder:text-[#A39DAE] focus:border-[#6D4AFF] focus:outline-none"
              />
            </div>

            {formError && (
              <p className="text-xs font-medium text-[#DC2626]" role="alert">
                {formError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="h-9 rounded-lg px-3 text-xs font-medium text-[#5A5566] transition-colors hover:bg-[#ECE9E2]"
              >
                取消
              </button>
              <button
                type="submit"
                className="h-9 rounded-lg bg-[#6D4AFF] px-4 text-xs font-medium text-white transition-colors hover:bg-[#5B38EC]"
              >
                加入讀書計畫
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div
        role="tablist"
        aria-label="篩選讀書任務狀態"
        className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-[#F3F1EC] p-1"
      >
        {(
          [
            {key: 'all', label: `全部 (${counts.all})`},
            {key: 'pending', label: `待完成 (${counts.pending})`},
            {key: 'completed', label: `已完成 (${counts.completed})`},
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            role="tab"
            type="button"
            aria-selected={filter === tab.key}
            onClick={() => setFilter(tab.key)}
            className={`whitespace-nowrap shrink-0 rounded-lg py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D4AFF] ${
              filter === tab.key
                ? 'bg-white text-[#1F1D26]'
                : 'text-[#5A5566] hover:text-[#1F1D26]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="mt-5 flex flex-col items-center justify-center rounded-xl bg-[#FAF8F5] px-4 py-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFEBFD] text-[#6D4AFF]">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm font-medium text-[#1F1D26]">
            {filter === 'completed'
              ? '目前還沒有已完成的任務'
              : filter === 'pending'
                ? '太棒了！待完成任務都已清空'
                : '尚未建立任何讀書任務'}
          </p>
          <p className="mt-1 text-xs text-[#847F90]">
            點擊右上方「新增任務」來規劃今天的讀書行程
          </p>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-[#F0EDE6]">
          {filteredTasks.map((task) => {
            const subject = task.subjectId
              ? subjectMap.get(task.subjectId)
              : undefined;
            const colorStyle = subject
              ? SUBJECT_COLOR_MAP[subject.color]
              : SUBJECT_COLOR_MAP.slate;
            const isExpanded = expandedId === task.id;

            return (
              <li key={task.id} className="py-3 first:pt-2 last:pb-1">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    aria-label={
                      task.completed
                        ? `將「${task.title}」標記為未完成`
                        : `將「${task.title}」標記為已完成`
                    }
                    aria-pressed={task.completed}
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D4AFF] ${
                      task.completed
                        ? 'border-[#6D4AFF] bg-[#6D4AFF] text-white'
                        : 'border-[#CFC9BE] bg-white text-transparent hover:border-[#6D4AFF]'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
                  </button>

                  {/* Clickable title & metadata to expand details */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId((prev) =>
                        prev === task.id ? null : task.id,
                      )
                    }
                    aria-expanded={isExpanded}
                    className="min-w-0 flex-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D4AFF]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-sm font-medium leading-snug transition-colors ${
                          task.completed
                            ? 'text-[#847F90] line-through'
                            : 'text-[#1F1D26]'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#847F90]">
                      <span className="inline-flex items-center gap-1.5 text-[#5A5566]">
                        <span
                          className={`h-2 w-2 rounded-sm ${colorStyle.swatchClass}`}
                          aria-hidden="true"
                        />
                        <span>{subject ? subject.name : '一般自習'}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-num tabular-nums">
                        {formatHours(task.plannedHours)} 小時
                      </span>
                      {task.timeSlot && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-num tabular-nums">
                            {task.timeSlot}
                          </span>
                        </>
                      )}
                    </div>
                  </button>

                  {/* Expand chevron + Delete */}
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId((prev) =>
                          prev === task.id ? null : task.id,
                        )
                      }
                      aria-label={isExpanded ? '收合詳細內容' : '展開詳細內容'}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#847F90] transition-colors hover:bg-[#F3F1EC] hover:text-[#1F1D26] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D4AFF]"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-[#6D4AFF]' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      aria-label={`刪除任務「${task.title}」`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#847F90] transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D4AFF]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Expanded details drawer */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{opacity: 0, y: -4}}
                      animate={{opacity: 1, y: 0}}
                      exit={{opacity: 0, y: -4}}
                      transition={{duration: 0.16, ease: [0.16, 1, 0.3, 1]}}
                      className="mt-2.5 ml-9 rounded-xl bg-[#FAF8F5] px-3.5 py-3 text-xs leading-relaxed text-[#5A5566]"
                    >
                      <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-[#847F90]">
                        <span>詳細內容</span>
                        <span>{task.completed ? '狀態：已完成' : '狀態：待完成'}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-[#464152]">
                        {task.details
                          ? task.details
                          : '此任務尚未填寫詳細學習備註。'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
