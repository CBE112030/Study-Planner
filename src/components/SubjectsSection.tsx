import {BookOpen, Pencil, Plus, Trash2} from 'lucide-react';
import {motion} from 'motion/react';
import {SUBJECT_COLOR_MAP} from '../data/initialData';
import type {Subject} from '../types/study';
import {formatHours} from '../utils/number';

interface SubjectsSectionProps {
  subjects: Subject[];
  onAddSubject: () => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
}

export function SubjectsSection({
  subjects,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
}: SubjectsSectionProps) {
  return (
    <section id="subjects" aria-label="科目學習進度" className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#1F1D26]">
            科目學習進度
          </h2>
          <p className="mt-0.5 text-xs text-[#847F90]">
            設定各科目標時數，並隨學習紀錄自動累計進度
          </p>
        </div>

        <button
          type="button"
          onClick={onAddSubject}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-[#DFD9CE] bg-white px-4 text-xs font-medium text-[#1F1D26] transition-colors hover:border-[#6D4AFF]/40 hover:bg-[#FAF8F5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D4AFF]"
        >
          <Plus className="h-4 w-4 text-[#6D4AFF]" aria-hidden="true" />
          <span>新增科目</span>
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E7E3DC] bg-white px-6 py-12 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFEBFD] text-[#6D4AFF]">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-[#1F1D26]">
            尚未建立學習科目
          </h3>
          <p className="mt-1 max-w-xs text-xs text-[#847F90]">
            新增這學期修習的課程或準備考試科目，開始追蹤目標時數與完成率。
          </p>
          <button
            type="button"
            onClick={onAddSubject}
            className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#6D4AFF] px-4 text-xs font-medium text-white transition-colors hover:bg-[#5B38EC]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>建立第一個科目</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {subjects.map((subject) => {
            const colorStyle =
              SUBJECT_COLOR_MAP[subject.color] ?? SUBJECT_COLOR_MAP.violet;
            const pct =
              subject.targetHours > 0
                ? Math.round(
                    (subject.completedHours / subject.targetHours) * 100,
                  )
                : 0;
            const clampedRatio =
              subject.targetHours > 0
                ? Math.min(subject.completedHours / subject.targetHours, 1)
                : 0;
            const remaining = Math.max(
              subject.targetHours - subject.completedHours,
              0,
            );

            return (
              <article
                key={subject.id}
                className="flex flex-col justify-between rounded-2xl border border-[#E7E3DC] bg-white p-5 transition-colors hover:border-[#D7D0C5]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5 pt-1">
                    <span
                      className={`h-3 w-3 shrink-0 rounded-sm ${colorStyle.swatchClass}`}
                      aria-hidden="true"
                    />
                    <h3 className="truncate text-base font-semibold text-[#1F1D26]">
                      {subject.name}
                    </h3>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditSubject(subject)}
                      aria-label={`編輯「${subject.name}」`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-[#5A5566] transition-colors hover:bg-[#F3F1EC] hover:text-[#1F1D26] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D4AFF]"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSubject(subject.id)}
                      aria-label={`刪除「${subject.name}」`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-[#847F90] transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D4AFF]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-baseline justify-between gap-2 text-xs tabular-nums">
                    <span className="text-[#5A5566]">
                      已完成{' '}
                      <strong className="font-num font-semibold text-[#1F1D26]">
                        {formatHours(subject.completedHours)}
                      </strong>{' '}
                      / {formatHours(subject.targetHours)} 小時
                    </span>
                    <span
                      className="font-num text-sm font-semibold"
                      style={{color: colorStyle.barHex}}
                    >
                      {pct}%
                    </span>
                  </div>

                  <div
                    className="mt-2 h-2.5 w-full overflow-hidden rounded-full"
                    style={{backgroundColor: colorStyle.trackHex}}
                    role="progressbar"
                    aria-valuenow={Math.min(pct, 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${subject.name} 完成進度 ${pct}%`}
                  >
                    <motion.div
                      className="h-full w-full origin-left rounded-full"
                      style={{backgroundColor: colorStyle.barHex}}
                      initial={{scaleX: 0}}
                      animate={{scaleX: clampedRatio}}
                      transition={{duration: 0.35, ease: [0.16, 1, 0.3, 1]}}
                    />
                  </div>

                  <p className="mt-2.5 text-xs text-[#847F90] tabular-nums">
                    {pct >= 100
                      ? '已達成目標學習時數'
                      : `距離目標還差 ${formatHours(remaining)} 小時`}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
