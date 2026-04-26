function normalize(value: string): string {
  return value.toLowerCase().replace(/-/g, "_");
}

function translate(map: Record<string, string>, value: string): string {
  return map[normalize(value)] ?? value;
}

const EMPLOYMENT_TYPE: Record<string, string> = {
  full_time: "Полная занятость",
  fulltime: "Полная занятость",
  part_time: "Частичная занятость",
  parttime: "Частичная занятость",
  contract: "Контракт",
  internship: "Стажировка",
  freelance: "Фриланс",
  project: "Проектная работа",
  temporary: "Временная",
  permanent: "Постоянная",
};

const WORK_MODE: Record<string, string> = {
  remote: "Удалённо",
  office: "Офис",
  onsite: "Офис",
  on_site: "Офис",
  hybrid: "Гибрид",
};

const SCHEDULE: Record<string, string> = {
  fixed: "Фиксированный",
  flexible: "Гибкий",
  project_based: "По проектам",
};

const SALARY_PERIOD: Record<string, string> = {
  hour: "час",
  hourly: "час",
  day: "день",
  daily: "день",
  week: "неделя",
  weekly: "неделя",
  month: "мес",
  monthly: "мес",
  year: "год",
  yearly: "год",
  annual: "год",
  project: "проект",
};

const EVENT_TYPE: Record<string, string> = {
  conference: "Конференция",
  meetup: "Митап",
  workshop: "Воркшоп",
  festival: "Фестиваль",
  online_stream: "Онлайн-стрим",
  open_call: "Опен-колл",
  other: "Другое",
};

const EVENT_FORMAT: Record<string, string> = {
  offline: "Оффлайн",
  online: "Онлайн",
  hybrid: "Гибрид",
};

const COST_TYPE: Record<string, string> = {
  free: "Бесплатно",
  paid: "Платно",
};

const TARGET_AUDIENCE: Record<string, string> = {
  producers: "Продюсеры",
  editors: "Редакторы",
  hosts: "Ведущие",
  newcomers: "Новички индустрии",
  other: "Другое",
};

const DATE_TYPE: Record<string, string> = {
  single: "Одна дата",
  range: "Период (от/до)",
};

const ROLE: Record<string, string> = {};

export const t = {
  employmentType: (v: string) => translate(EMPLOYMENT_TYPE, v),
  workMode: (v: string) => translate(WORK_MODE, v),
  schedule: (v: string) => translate(SCHEDULE, v),
  salaryPeriod: (v: string) => translate(SALARY_PERIOD, v),
  eventType: (v: string) => translate(EVENT_TYPE, v),
  eventFormat: (v: string) => translate(EVENT_FORMAT, v),
  costType: (v: string) => translate(COST_TYPE, v),
  targetAudience: (v: string) => translate(TARGET_AUDIENCE, v),
  dateType: (v: string) => translate(DATE_TYPE, v),
  role: (v: string) => translate(ROLE, v),
};
