import {Plus, X} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {useEffect, useState} from 'react';
import type {Subject} from '../types/study';
import {getTodayISO} from '../utils/date';
import {formatHours, parsePositiveHours} from '../utils/number';

interface AddStudyLogModalProps {
  isOpen: boolean;
  defaultDate?: string;
  subjects: Subject[];
  onClose: () => void;
  onSave: (payload: {
    date: string;
    subjectId: string;
    hours: number;
    note?: string;
  }) => void;
  onCreateSubject: () => void;
}

export function AddStudyLogModal({
  isOpen,
  defaultDate,
  subjects,
  onClose,
  onSave,
  onCreateSubject,
}: AddStudyLogModalProps) {
  const [date, setDate] = useState(defaultDate || getTodayISO());
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [hours, setHours] = useState('1.5');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDate(defaultDate || getTodayISO());
      setSubjectId((prev) =>
        prev && subjects.some((s) => s.id === prev)
          ? prev
          : (subjects[0]?.id ?? ''),
      );
      setHours('1.5');
      setNote('');
      setError('');
    }
  }, [isOpen, defaultDate, subjects]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError('請選擇學習日期');
      return;
    }
    if (!subjectId) {
      setError('請先建立或選擇一個學習科目');
      return;
    }
    const parsedHours = parsePositiveHours(hours);
    if (parsedHours === null || parsedHours <= 0 || parsedHours > 24) {
      setError('請輸入大於 0 且不超過 24 的有效學習時數（例如 0.5、1.2、1.5）');
      return;
    }

    onSave({
      date,
      subjectId,
      hours: parsedHours,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-log-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.16}}
            onClick={onClose}
            className="fixed inset-0 bg-[#1F1D26]/30 backdrop-blur-[2px]"
          />

          {/* Panel */}
          <motion.div
            initial={{opacity: 0, scale: 0.97, y: 8}}
            animate={{opacity: 1, scale: 1, y: 0}}
            exit={{opacity: 0, scale: 0.97, y: 8}}
            transition={{duration: 0.18, ease: [0.16, 1, 0.3, 1]}}
            className="relative z-10 w-full max-w-md rounded-2xl border border-[#E7E3DC] bg-white p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2
                  id="add-log-modal-title"
                  className="text-lg font-semibold text-[#1F1D26]"
                >
                  新增學習紀錄
                </h2>
                <p className="mt-0.5 text-xs text-[#847F90]">
                  送出後將同步更新每週圖表與對應科目的完成時數
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="關閉視窗"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#5A5566] transition-colors hover:bg-[#F3F1EC] hover:text-[#1F1D26]"
              >
                <X className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
            </div>

            {subjects.length === 0 ? (
              <div className="mt-5 rounded-xl bg-[#FAF8F5] p-5 text-center">
                <p className="text-sm font-medium text-[#1F1D26]">
                  尚未建立任何學習科目
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#847F90]">
                  請先新增至少一個學習科目，再記錄該科目的每日學習時數。
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-9 rounded-xl px-4 text-xs font-medium text-[#5A5566] transition-colors hover:bg-[#ECE9E2]"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onCreateSubject();
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#6D4AFF] px-4 text-xs font-medium text-white transition-colors hover:bg-[#5B38EC]"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    <span>前往新增科目</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="log-date"
                    className="block text-xs font-medium text-[#5A5566]"
                  >
                    日期
                  </label>
                  <input
                    id="log-date"
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      if (error) setError('');
                    }}
                    className="font-num mt-1.5 h-10 w-full rounded-xl border border-[#DFD9CE] bg-[#FAF8F5] px-3 text-sm text-[#1F1D26] focus:border-[#6D4AFF] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="log-subject"
                    className="block text-xs font-medium text-[#5A5566]"
                  >
                    學習科目
                  </label>
                  <select
                    id="log-subject"
                    value={subjectId}
                    onChange={(e) => {
                      setSubjectId(e.target.value);
                      if (error) setError('');
                    }}
                    className="mt-1.5 h-10 w-full rounded-xl border border-[#DFD9CE] bg-[#FAF8F5] px-3 text-sm text-[#1F1D26] focus:border-[#6D4AFF] focus:bg-white focus:outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}（目前 {formatHours(s.completedHours)}h）
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="log-hours"
                      className="block text-xs font-medium text-[#5A5566]"
                    >
                      學習時數（小時）
                    </label>
                    <div className="flex items-center gap-1">
                      {['0.5', '1', '1.5', '2', '3'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setHours(preset);
                            if (error) setError('');
                          }}
                          className={`font-num rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${
                            hours === preset
                              ? 'bg-[#EFEBFD] text-[#6D4AFF]'
                              : 'bg-[#F3F1EC] text-[#5A5566] hover:bg-[#E8E5DF]'
                          }`}
                        >
                          {preset}h
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    id="log-hours"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="24"
                    step="any"
                    value={hours}
                    onChange={(e) => {
                      setHours(e.target.value);
                      if (error) setError('');
                    }}
                    className="font-num mt-1.5 h-10 w-full rounded-xl border border-[#DFD9CE] bg-[#FAF8F5] px-3 text-sm text-[#1F1D26] tabular-nums focus:border-[#6D4AFF] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="log-note"
                    className="block text-xs font-medium text-[#5A5566]"
                  >
                    學習備註（選填）
                  </label>
                  <input
                    id="log-note"
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="例如：複習第四章演算法例題"
                    className="mt-1.5 h-10 w-full rounded-xl border border-[#DFD9CE] bg-[#FAF8F5] px-3 text-sm text-[#1F1D26] placeholder:text-[#A39DAE] focus:border-[#6D4AFF] focus:bg-white focus:outline-none"
                  />
                </div>

                {error && (
                  <p className="text-xs font-medium text-[#DC2626]" role="alert">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-10 rounded-xl px-4 text-xs font-medium text-[#5A5566] transition-colors hover:bg-[#F3F1EC]"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-xl bg-[#6D4AFF] px-5 text-xs font-medium text-white transition-colors hover:bg-[#5B38EC]"
                  >
                    儲存紀錄
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
