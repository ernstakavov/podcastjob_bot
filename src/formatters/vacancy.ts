import type { Database } from "../database.types.js";
import { escapeHtml } from "../utils/escapeHtml.js";
import { formatDate } from "../utils/formatDate.js";
import { t } from "../utils/translations.js";
import { truncateMessage } from "../utils/truncate.js";

type Vacancy = Database["public"]["Tables"]["vacancy"]["Row"];

function formatBulletList(items: string[]): string {
  return items.map((item) => `• ${escapeHtml(item)}`).join("\n");
}

function formatSalary(
  fixed: number | null,
  min: number | null,
  max: number | null,
  period: string
): string {
  const suffix = period ? ` / ${escapeHtml(t.salaryPeriod(period))}` : "";
  if (fixed != null) return `${fixed} ₽${suffix}`;
  if (min != null && max != null) return `${min} – ${max} ₽${suffix}`;
  if (min != null) return `от ${min} ₽${suffix}`;
  if (max != null) return `до ${max} ₽${suffix}`;
  return "По договорённости";
}

export function formatVacancy(v: Vacancy): string {
  const title = escapeHtml(v.title);
  const role = escapeHtml(t.role(v.role));
  const employer = escapeHtml(v.employer);
  const employmentType = escapeHtml(t.employmentType(v.employment_type));
  const workMode = escapeHtml(t.workMode(v.work_mode));
  const schedule = escapeHtml(t.schedule(v.schedule));
  const description = escapeHtml(v.description);
  const responsibilities = formatBulletList(v.responsibilities);
  const requirements = formatBulletList(v.requirements);
  const workingConditions = formatBulletList(v.working_conditions);
  const contact = escapeHtml(v.contact);
  const salary = formatSalary(
    v.salary_fixed,
    v.salary_min,
    v.salary_max,
    v.salary_period
  );

  const lines: string[] = [
    `🏢 <b>Новая вакансия</b>`,
    ``,
    `<b>${title}</b> (${role})`,
    `${employer} ∙ ${employmentType}`,
    ``,
    `💰 <b>${salary}</b>`,
    `📍 ${workMode}`,
  ];

  if (v.city) {
    lines.push(`🏙 ${escapeHtml(v.city)}`);
  }
  lines.push(`🕐 ${schedule}`);

  lines.push(``, `📝 <b>Описание:</b>`, description);

  if (v.responsibilities.length > 0) {
    lines.push(``, `📋 <b>Обязанности:</b>`, responsibilities);
  }
  if (v.requirements.length > 0) {
    lines.push(``, `📌 <b>Требования:</b>`, requirements);
  }
  if (v.working_conditions.length > 0) {
    lines.push(``, `🎁 <b>Условия:</b>`, workingConditions);
  }

  if (v.attachments_info) {
    lines.push(``, `📎 <b>Вложения:</b>`, escapeHtml(v.attachments_info));
  }

  lines.push(``, `📩 <b>Откликнуться:</b> ${contact}`);

  if (v.close_date) {
    lines.push(``, `📅 Вакансия активна до: ${formatDate(v.close_date)}`);
  }

  lines.push(``, `⏳ На модерации`);

  const message = lines.join("\n");
  return truncateMessage(message, description);
}
