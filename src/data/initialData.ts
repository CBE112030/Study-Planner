import type {SubjectColorKey} from '../types/study';

export interface SubjectColorStyle {
  key: SubjectColorKey;
  label: string;
  barHex: string;
  trackHex: string;
  swatchClass: string;
}

export const SUBJECT_COLOR_MAP: Record<SubjectColorKey, SubjectColorStyle> = {
  violet: {
    key: 'violet',
    label: '薰衣紫',
    barHex: '#7C5DFA',
    trackHex: '#EFEBFD',
    swatchClass: 'bg-[#7C5DFA]',
  },
  indigo: {
    key: 'indigo',
    label: '暮霧紫',
    barHex: '#6366F1',
    trackHex: '#ECEEFE',
    swatchClass: 'bg-[#6366F1]',
  },
  lilac: {
    key: 'lilac',
    label: '丁香粉紫',
    barHex: '#A78BFA',
    trackHex: '#F3EEFF',
    swatchClass: 'bg-[#A78BFA]',
  },
  slate: {
    key: 'slate',
    label: '灰藍調',
    barHex: '#64748B',
    trackHex: '#ECEFF3',
    swatchClass: 'bg-[#64748B]',
  },
  sage: {
    key: 'sage',
    label: '鼠尾草綠',
    barHex: '#4E9F76',
    trackHex: '#E8F4ED',
    swatchClass: 'bg-[#4E9F76]',
  },
  amber: {
    key: 'amber',
    label: '暖麥金',
    barHex: '#C98A3B',
    trackHex: '#F9F0E3',
    swatchClass: 'bg-[#C98A3B]',
  },
};

export const SUBJECT_COLOR_OPTIONS = Object.values(SUBJECT_COLOR_MAP);
