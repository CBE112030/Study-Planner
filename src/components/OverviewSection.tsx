import {CheckCircle2, Clock, Target} from 'lucide-react';
import {motion} from 'motion/react';
import {formatHours} from '../utils/number';

interface OverviewSectionProps {
  todayHours: number;
  weekTotalHours: number;
  weekLogCount: number;
  completedTaskCount: number;
  totalTaskCount: number;
  overallProgressPct: number;
  totalCompletedHours: number;
  totalTargetHours: number;
  subjectCount: number;
}

export function OverviewSection({
  todayHours,
  weekTotalHours,
  weekLogCount,
  completedTaskCount,
  totalTaskCount,
  overallProgressPct,
  totalCompletedHours,
  totalTargetHours,
  subjectCount,
}: OverviewSectionProps) {
  const taskCompletionPct =
    totalTaskCount > 0
      ? Math.round((completedTaskCount / totalTaskCount) * 100)
      : 0;

  return (
    <section
      id="overview"
      aria-label="學習資訊總覽"
      className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5"
    >
      {/* Card 1: 今日學習時數 */}
      <motion.div
        initial={{opacity: 0, y: 8}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.22, ease: [0.16, 1, 0.3, 1]}}
        className="flex flex-col justify-between rounded-2xl border border-[#E7E3DC] bg-white p-5 sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-[#5A5566]">
            今日學習時數
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFEBFD] text-[#6D4AFF]">
            <Clock className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-num text-3xl font-semibold tracking-tight text-[#1F1D26] tabular-nums">
            {formatHours(todayHours)}
          </span>
          <span className="text-sm font-medium text-[#5A5566]">小時</span>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-[#F0EDE6] pt-3 text-xs text-[#847F90] tabular-nums">
          <span>本週累計 {formatHours(weekTotalHours)} 小時</span>
          <span aria-hidden="true">·</span>
          <span>{weekLogCount} 筆紀錄</span>
        </div>
      </motion.div>

      {/* Card 2: 已完成任務數量 */}
      <motion.div
        initial={{opacity: 0, y: 8}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.22, delay: 0.04, ease: [0.16, 1, 0.3, 1]}}
        className="flex flex-col justify-between rounded-2xl border border-[#E7E3DC] bg-white p-5 sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-[#5A5566]">
            已完成任務數量
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFEBFD] text-[#6D4AFF]">
            <CheckCircle2 className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-num text-3xl font-semibold tracking-tight text-[#1F1D26] tabular-nums">
            {completedTaskCount}
            <span className="mx-1 text-xl font-normal text-[#9D97AA]">/</span>
            {totalTaskCount}
          </span>
          <span className="text-sm font-medium text-[#5A5566]">項任務</span>
        </div>

        <div className="mt-4 space-y-2 border-t border-[#F0EDE6] pt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EFEBFD]">
            <motion.div
              className="h-full w-full origin-left rounded-full bg-[#7C5DFA]"
              initial={{scaleX: 0}}
              animate={{scaleX: taskCompletionPct / 100}}
              transition={{duration: 0.35, ease: [0.16, 1, 0.3, 1]}}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[#847F90] tabular-nums">
            <span>今日計畫達成率</span>
            <span className="font-num font-medium text-[#5A5566]">
              {taskCompletionPct}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Card 3: 整體學習進度 */}
      <motion.div
        initial={{opacity: 0, y: 8}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.22, delay: 0.08, ease: [0.16, 1, 0.3, 1]}}
        className="flex flex-col justify-between rounded-2xl border border-[#E7E3DC] bg-white p-5 sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-[#5A5566]">
            整體學習進度
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFEBFD] text-[#6D4AFF]">
            <Target className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-num text-3xl font-semibold tracking-tight text-[#1F1D26] tabular-nums">
            {overallProgressPct}%
          </span>
          <span className="text-sm font-medium text-[#5A5566]">目標達成</span>
        </div>

        <div className="mt-4 space-y-2 border-t border-[#F0EDE6] pt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EFEBFD]">
            <motion.div
              className="h-full w-full origin-left rounded-full bg-[#6D4AFF]"
              initial={{scaleX: 0}}
              animate={{scaleX: Math.min(overallProgressPct, 100) / 100}}
              transition={{duration: 0.35, ease: [0.16, 1, 0.3, 1]}}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[#847F90] tabular-nums">
            <span>
              {formatHours(totalCompletedHours)} / {formatHours(totalTargetHours)} 小時
            </span>
            <span>{subjectCount} 個科目</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
