import {AlertTriangle, X} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {useEffect} from 'react';

interface ConfirmClearModalProps {
  isOpen: boolean;
  hasData: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmClearModal({
  isOpen,
  hasData,
  onClose,
  onConfirm,
}: ConfirmClearModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-clear-title"
          aria-describedby="confirm-clear-desc"
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
            className="relative z-10 w-full max-w-sm rounded-2xl border border-[#E7E3DC] bg-white p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#DC2626]">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2
                  id="confirm-clear-title"
                  className="text-base font-semibold text-[#1F1D26]"
                >
                  清除所有資料
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="關閉視窗"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#5A5566] transition-colors hover:bg-[#F3F1EC] hover:text-[#1F1D26]"
              >
                <X className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
            </div>

            <p
              id="confirm-clear-desc"
              className="mt-4 text-sm leading-relaxed text-[#5A5566]"
            >
              {hasData
                ? '確定要清除目前所有的學習科目、學習紀錄與每日讀書任務嗎？此操作無法復原。'
                : '目前畫面上已經沒有任何資料，仍可確認將本機暫存狀態歸零。'}
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-10 rounded-xl px-4 text-xs font-medium text-[#5A5566] transition-colors hover:bg-[#F3F1EC]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="h-10 rounded-xl bg-[#DC2626] px-4 text-xs font-medium text-white transition-colors hover:bg-[#B91C1C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DC2626]"
              >
                確定清除
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
