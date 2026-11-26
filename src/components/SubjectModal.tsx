import {X} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {useEffect, useState} from 'react';
import {SUBJECT_COLOR_OPTIONS} from '../data/initialData';
import type {Subject, SubjectColorKey} from '../types/study';
import {parsePositiveHours} from '../utils/number';

interface SubjectModalProps {
  isOpen: boolean;
  editingSubject: Subject | null;
  onClose: () => void;
  onSave: (payload: {
    id?: string;
    name: string;
    targetHours: number;
    completedHours: number;
    color: SubjectColorKey;
  }) => void;
}

export function SubjectModal({
  isOpen,
  editingSubject,
  onClose,
  onSave,
}: SubjectModalProps) {
  const [name, setName] = useState('');
  const [targetHours, setTargetHours] = useState('30');
  const [completedHours, setCompletedHours] = useState('0');
  const [color, setColor] = useState<SubjectColorKey>('violet');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingSubject) {
        setName(editingSubject.name);
        setTargetHours(String(editingSubject.targetHours));
        setCompletedHours(String(editingSubject.completedHours));
        setColor(editingSubject.color);
      } else {
        setName('');
        setTargetHours('30');
        setCompletedHours('0');
        setColor('violet');
      }
      setError('');
    }
  }, [isOpen, editingSubject]);

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
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('請輸入科目名稱');
      return;
    }
    const target = parsePositiveHours(targetHours);
    const completed = parsePositiveHours(completedHours);
    if (target === null || target <= 0 || target > 500) {
      setError('目標學習時數需大於 0 且不超過 500 小時');
      return;
    }
    if (completed === null || completed < 0 || completed > 500) {
      setError('目前已完成時數需介於 0 到 500 小時之間');
      return;
    }

    onSave({
      id: editingSubject?.id,
      name: trimmedName,
      targetHours: target,
      completedHours: completed,
      color,
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
          aria-labelledby="subject-modal-title"
        >
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.16}}
            onClick={onClose}
            className="fixed inset-0 bg-[#1F1D26]/30 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{opacity: 0, scale: 0.97, y: 8}}
            animate={{opacity: 1, scale: 1, y: 0}}
            exit={{opacity: 0, scale: 0.97, y: 8}}
            transition={{duration: 0.18, ease: [0.16, 1, 0.3, 1]}}
            className="relative z-10 w-full max-w-md rounded-2xl border border-[#E7E3DC] bg-white p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <h2
                id="subject-modal-title"
                className="text-lg font-semibold text-[#1F1D26]"
              >
                {editingSubject ? '編輯學習科目' : '新增學習科目'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="關閉視窗"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#5A5566] transition-colors hover:bg-[#F3F1EC] hover:text-[#1F1D26]"
              >
                <X className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="subject-name-input"
                  className="block text-xs font-medium text-[#5A5566]"
                >
                  科目名稱 <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  id="subject-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="例如：線性代數、作業系統"
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#DFD9CE] bg-[#FAF8F5] px-3 text-sm text-[#1F1D26] placeholder:text-[#A39DAE] focus:border-[#6D4AFF] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="subject-target-input"
                    className="block text-xs font-medium text-[#5A5566]"
                  >
                    目標學習時數（小時）
                  </label>
                  <input
                    id="subject-target-input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="500"
                    step="any"
                    value={targetHours}
                    onChange={(e) => {
                      setTargetHours(e.target.value);
                      if (error) setError('');
                    }}
                    className="font-num mt-1.5 h-10 w-full rounded-xl border border-[#DFD9CE] bg-[#FAF8F5] px-3 text-sm text-[#1F1D26] tabular-nums focus:border-[#6D4AFF] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject-completed-input"
                    className="block text-xs font-medium text-[#5A5566]"
                  >
                    目前已完成（小時）
                  </label>
                  <input
                    id="subject-completed-input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="500"
                    step="any"
                    value={completedHours}
                    onChange={(e) => {
                      setCompletedHours(e.target.value);
                      if (error) setError('');
                    }}
                    className="font-num mt-1.5 h-10 w-full rounded-xl border border-[#DFD9CE] bg-[#FAF8F5] px-3 text-sm text-[#1F1D26] tabular-nums focus:border-[#6D4AFF] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-[#5A5566]">
                  代表色系
                </span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {SUBJECT_COLOR_OPTIONS.map((opt) => {
                    const isSelected = color === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setColor(opt.key)}
                        className={`flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition-colors ${
                          isSelected
                            ? 'border-[#6D4AFF] bg-[#EFEBFD]/60 text-[#1F1D26]'
                            : 'border-[#E7E3DC] bg-white text-[#5A5566] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <span
                          className={`h-3 w-3 shrink-0 rounded-sm ${opt.swatchClass}`}
                          aria-hidden="true"
                        />
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
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
                  {editingSubject ? '儲存變更' : '新增科目'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
