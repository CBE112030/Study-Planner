import {ChevronLeft, ChevronRight, Plus, Trash2} from 'lucide-react';
import {motion} from 'motion/react';
import {useMemo, useState} from 'react';
import {SUBJECT_COLOR_MAP} from '../data/initialData';
import type {StudyLog, Subject} from '../types/study';
import {formatShortDateZH, getWeekDaysMondayToSunday} from '../utils/date';
import {formatHours} from '../utils/number';

interface WeeklyChartSectionProps {
  logs: StudyLog[];
  subjects: Subject[];
  onOpenAddLog: (defaultDate?: string) => void;
  onDeleteLog: (logId: string) => void;
}

export function WeeklyChartSection({
  logs,
  subjects,
  onOpenAddLog,
  onDeleteLog,
}: WeeklyChartSectionProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayISO, setSelectedDayISO] = useState<string | null>(null);
  const [showAllLogs, setShowAllLogs] = useState(false);

  const weekDays = useMemo(
    () => getWeekDaysMondayToSunday(weekOffset),
    [weekOffset],
  );

  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    for (const s of subjects) {
      map.set(s.id, s);
    }
    return map;
  }, [subjects]);

  const dailyTotals = useMemo(() => {
    return weekDays.map((day) => {
      const dayLogs = logs.filter((l) => l.date === day.iso);
      const totalHours = dayLogs.reduce((acc, cur) => acc + cur.hours, 0);
      return {
        ...day,
        totalHours,
        logs: dayLogs,
      };
    });
  }, [weekDays, logs]);

  const maxDayHours = useMemo(() => {
    const highest = Math.max(...dailyTotals.map((d) => d.totalHours), 0);
    if (highest <= 4) return 4;
    return Math.ceil(highest / 2) * 2;
  }, [dailyTotals]);

  const weekSumHours = useMemo(
    () => dailyTotals.reduce((acc, d) => acc + d.totalHours, 0),
    [dailyTotals],
  );

  const activeDay = useMemo(() => {
    if (selectedDayISO) {
      return dailyTotals.find((d) => d.iso === selectedDayISO) ?? null;
    }
    return dailyTotals.find((d) => d.isToday) ?? dailyTotals[0] ?? null;
  }, [dailyTotals, selectedDayISO]);

  const visibleLogs = useMemo(() => {
    const weekISOSet = new Set(weekDays.map((d) => d.iso));
    const filtered = showAllLogs
      ? logs
      : logs.filter((l) => weekISOSet.has(l.date));
    return [...filtered]
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.createdAt - a.createdAt;
      })
      .slice(0, showAllLogs ? 12 : 6);
  }, [logs, weekDays, showAllLogs]);

  const weekRangeText =
    weekDays.length === 7
      ? `${weekDays[0].monthDay} – ${weekDays[6].monthDay}`
      : '';

  return (
    <section
      id="weekly-chart"
      aria-label="每週學習時數圖表"
      className="rounded-2xl border border-[#E7E3DC] bg-white p-5 sm:p-6"
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#1F1D26]">
            每週學習時數
          </h2>
          <p className="mt-1 text-xs text-[#847F90] tabular-nums">
            <span>{weekRangeText}</span>
            <span className="mx-1.5" aria-hidden="true">
              ·
            </span>
            <span>本週總計 {formatHours(weekSumHours)} 小時</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Week switcher */}
          <div className="flex items-center rounded-xl bg-[#F3F1EC] p-1">
            <button
              type="button"
              onClick={() => {
                setWeekOffset((prev) => prev - 1);
                setSelectedDayISO(null);
              }}
              aria-label="上一週"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5A5566] transition-colors hover:bg-white hover:text-[#1F1D26] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D4AFF]"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                setWeekOffset(0);
                setSelectedDayISO(null);
              }}
              className="whitespace-nowrap shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium text-[#1F1D26] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D4AFF]"
            >
              {weekOffset === 0 ? '本週' : '回到本週'}
            </button>
            <button
              type="button"
              onClick={() => {
                setWeekOffset((prev) => prev + 1);
                setSelectedDayISO(null);
              }}
              aria-label="下一週"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5A5566] transition-colors hover:bg-white hover:text-[#1F1D26] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D4AFF]"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onOpenAddLog(activeDay?.iso)}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#6D4AFF] px-4 text-xs font-medium text-white transition-colors hover:bg-[#5B38EC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D4AFF]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>新增學習紀錄</span>
          </button>
        </div>
      </div>

      {/* Bar Chart Area */}
      <div className="mt-6">
        <div className="flex items-end gap-2 sm:gap-4">
          {/* Y-axis labels */}
          <div className="flex h-48 flex-col justify-between pb-7 text-right text-[11px] font-medium text-[#847F90] font-num tabular-nums">
            <span>{maxDayHours}h</span>
            <span>{(maxDayHours / 2).toFixed(maxDayHours % 2 === 0 ? 0 : 1)}h</span>
            <span>0h</span>
          </div>

          {/* 7 Bars (Monday to Sunday) */}
          <div className="relative grid flex-1 grid-cols-7 gap-2 sm:gap-3">
            {/* Subtle horizontal reference grid lines */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 bottom-7 flex flex-col justify-between"
            >
              <div className="border-t border-dashed border-[#ECE9E2]" />
              <div className="border-t border-dashed border-[#ECE9E2]" />
              <div className="border-t border-[#E7E3DC]" />
            </div>

            {dailyTotals.map((day) => {
              const ratio =
                maxDayHours > 0 ? Math.min(day.totalHours / maxDayHours, 1) : 0;
              const isSelected = activeDay?.iso === day.iso;

              return (
                <button
                  key={day.iso}
                  type="button"
                  onClick={() => setSelectedDayISO(day.iso)}
                  aria-label={`${day.shortLabel} ${day.monthDay}，學習 ${formatHours(day.totalHours)} 小時`}
                  className="group relative z-10 flex h-48 flex-col items-center justify-end focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D4AFF]"
                >
                  {/* Hours readout above bar */}
                  <span
                    className={`mb-1.5 font-num text-[11px] font-medium tabular-nums transition-opacity ${
                      day.totalHours > 0
                        ? isSelected
                          ? 'text-[#6D4AFF] opacity-100'
                          : 'text-[#5A5566] opacity-85 group-hover:opacity-100'
                        : 'text-[#B4AFBF] opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {formatHours(day.totalHours)}h
                  </span>

                  {/* Bar track & animated bar */}
                  <div className="relative flex h-36 w-full max-w-[38px] items-end justify-center rounded-t-xl bg-[#F7F5F2]/70 transition-colors group-hover:bg-[#EFEBFD]/60">
                    {day.totalHours > 0 ? (
                      <motion.div
                        key={`${day.iso}-${day.totalHours}`}
                        initial={{scaleY: 0}}
                        animate={{scaleY: Math.max(ratio, 0.06)}}
                        transition={{duration: 0.32, ease: [0.16, 1, 0.3, 1]}}
                        style={{height: '100%', transformOrigin: 'bottom'}}
                        className={`w-full rounded-t-xl transition-colors ${
                          day.isToday
                            ? 'bg-[#6D4AFF]'
                            : isSelected
                              ? 'bg-[#866BFF]'
                              : 'bg-[#C4B5FD] group-hover:bg-[#A590FF]'
                        }`}
                      />
                    ) : (
                      <div className="h-1 w-full rounded-full bg-[#E7E3DC]" />
                    )}
                  </div>

                  {/* Weekday label */}
                  <div className="mt-2 flex h-5 items-center justify-center">
                    <span
                      className={`whitespace-nowrap text-xs font-medium ${
                        day.isToday
                          ? 'text-[#6D4AFF] font-semibold'
                          : isSelected
                            ? 'text-[#1F1D26]'
                            : 'text-[#5A5566]'
                      }`}
                    >
                      <span className="sm:hidden">{day.compactLabel}</span>
                      <span className="hidden sm:inline">
                        {day.shortLabel.replace('星期', '週')}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected day inline summary */}
        {activeDay && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#FAF8F5] px-4 py-2.5 text-xs text-[#5A5566]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-[#1F1D26]">
                {activeDay.shortLabel} ({activeDay.monthDay})
                {activeDay.isToday ? ' · 今日' : ''}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-num tabular-nums">
                合計 {formatHours(activeDay.totalHours)} 小時
              </span>
            </div>
            <span className="text-[#847F90]">
              {activeDay.logs.length > 0
                ? `${activeDay.logs.length} 筆學習紀錄`
                : '當天尚無學習紀錄'}
            </span>
          </div>
        )}
      </div>

      {/* Recent Study Logs List */}
      <div className="mt-6 border-t border-[#ECE9E2] pt-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-[#1F1D26]">
            {showAllLogs ? '近期學習紀錄' : '本週學習紀錄'}
          </h3>
          <div className="flex items-center gap-1 rounded-lg bg-[#F3F1EC] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setShowAllLogs(false)}
              className={`whitespace-nowrap shrink-0 rounded-md px-2.5 py-1 font-medium transition-colors ${
                !showAllLogs
                  ? 'bg-white text-[#1F1D26]'
                  : 'text-[#5A5566] hover:text-[#1F1D26]'
              }`}
            >
              本週
            </button>
            <button
              type="button"
              onClick={() => setShowAllLogs(true)}
              className={`whitespace-nowrap shrink-0 rounded-md px-2.5 py-1 font-medium transition-colors ${
                showAllLogs
                  ? 'bg-white text-[#1F1D26]'
                  : 'text-[#5A5566] hover:text-[#1F1D26]'
              }`}
            >
              全部
            </button>
          </div>
        </div>

        {visibleLogs.length === 0 ? (
          <div className="mt-4 rounded-xl bg-[#FAF8F5] px-4 py-7 text-center">
            <p className="text-sm font-medium text-[#1F1D26]">
              {showAllLogs ? '目前尚未建立任何學習紀錄' : '本週尚無學習紀錄'}
            </p>
            <p className="mt-1 text-xs text-[#847F90]">
              新增學習紀錄後，上方長條圖與科目累計時數將自動更新
            </p>
            <button
              type="button"
              onClick={() => onOpenAddLog(activeDay?.iso)}
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-[#EFEBFD] px-3.5 py-2 text-xs font-medium text-[#6D4AFF] transition-colors hover:bg-[#E4DDFC]"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>新增第一筆紀錄</span>
            </button>
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-[#F0EDE6]">
            {visibleLogs.map((log) => {
              const subject = subjectMap.get(log.subjectId);
              const colorStyle = subject
                ? SUBJECT_COLOR_MAP[subject.color]
                : SUBJECT_COLOR_MAP.slate;

              return (
                <li
                  key={log.id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-sm ${colorStyle.swatchClass}`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="truncate text-sm font-medium text-[#1F1D26]">
                          {subject ? subject.name : '已移除科目'}
                        </span>
                        <span className="text-xs text-[#847F90] tabular-nums">
                          {formatShortDateZH(log.date)}
                        </span>
                      </div>
                      {log.note && (
                        <p className="truncate text-xs text-[#5A5566]">
                          {log.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-num text-sm font-medium text-[#6D4AFF] tabular-nums">
                      +{formatHours(log.hours)}h
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteLog(log.id)}
                      aria-label={`刪除 ${subject?.name ?? ''} ${log.hours} 小時學習紀錄`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#847F90] transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D4AFF]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
