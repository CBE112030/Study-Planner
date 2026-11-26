const WEEKDAY_SHORT_ZH = ['日', '一', '二', '三', '四', '五', '六'];
const WEEKDAY_FULL_ZH = [
  '星期日',
  '星期一',
  '星期二',
  '星期三',
  '星期四',
  '星期五',
  '星期六',
];

export function formatLocalDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseLocalDateISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function getTodayISO(): string {
  return formatLocalDateISO(new Date());
}

export function addDaysISO(iso: string, offsetDays: number): string {
  const d = parseLocalDateISO(iso);
  d.setDate(d.getDate() + offsetDays);
  return formatLocalDateISO(d);
}

export function getMondayOfWeekISO(baseISO: string, weekOffset = 0): string {
  const date = parseLocalDateISO(baseISO);
  const day = date.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diffToMonday + weekOffset * 7);
  return formatLocalDateISO(date);
}

export interface WeekDayInfo {
  iso: string;
  shortLabel: string; // 星期一 ... 星期日
  compactLabel: string; // 一 ... 日
  monthDay: string; // MM/DD
  isToday: boolean;
}

export function getWeekDaysMondayToSunday(weekOffset = 0): WeekDayInfo[] {
  const todayISO = getTodayISO();
  const mondayISO = getMondayOfWeekISO(todayISO, weekOffset);

  return Array.from({length: 7}, (_, idx) => {
    const iso = addDaysISO(mondayISO, idx);
    const date = parseLocalDateISO(iso);
    const dayIdx = date.getDay();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayNum = String(date.getDate()).padStart(2, '0');

    return {
      iso,
      shortLabel: WEEKDAY_FULL_ZH[dayIdx],
      compactLabel: WEEKDAY_SHORT_ZH[dayIdx],
      monthDay: `${month}/${dayNum}`,
      isToday: iso === todayISO,
    };
  });
}

export function formatTodayHeaderZH(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const w = WEEKDAY_FULL_ZH[now.getDay()];
  return `${y} 年 ${m} 月 ${d} 日 ${w}`;
}

export function formatShortDateZH(iso: string): string {
  const d = parseLocalDateISO(iso);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const w = WEEKDAY_SHORT_ZH[d.getDay()];
  return `${m}/${day} (${w})`;
}
