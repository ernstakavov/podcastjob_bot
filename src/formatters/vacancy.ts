import type { Database } from "../database.types.js";
import { escapeHtml } from "../utils/escapeHtml.js";
import { formatDate } from "../utils/formatDate.js";
import { truncateMessage } from "../utils/truncate.js";

type Vacancy = Database["public"]["Tables"]["vacancy"]["Row"];

function formatList(value: unknown): string {
  const items = Array.isArray(value) ? value : [value];
  return items.map((item) => `• ${escapeHtml(item)}`).join("\n");
}

export function formatVacancy(v: Vacancy): string {
  const title = escapeHtml(v.title);
  const position = escapeHtml(v.position);
  const employer = escapeHtml(v.employer);
  const employmentType = escapeHtml(v.employment_type);
  const workMode = escapeHtml(v.work_mode);
  const schedule = escapeHtml(v.schedule);
  const salary = `${v.salary_min} – ${v.salary_max}`;
  const responsibilities = formatList(v.responsibilities);
  const requirements = formatList(v.requirements);
  const workingConditions = formatList(v.working_conditions);
  const contact = escapeHtml(v.contact);

  const lines: string[] = [
    `🏢 <b>Новая вакансия</b>`,
    ``,
    `<b>${title}</b> (${position})`,
    `${employer} ∙ ${employmentType}`,
    ``,
    `💰 <b>${salary} ₸</b>`,
    `📍 ${workMode}`,
    `🕐 ${schedule}`,
  ];

  if (v.experience) {
    lines.push(`💼 Опыт: ${escapeHtml(v.experience)}`);
  }

  lines.push(``, `📋 <b>Обязанности:</b>`, responsibilities);
  lines.push(``, `📌 <b>Требования:</b>`, requirements);

  if (v.additional_requirements) {
    lines.push(
      ``,
      `📌 <b>Дополнительные требования:</b>`,
      escapeHtml(v.additional_requirements)
    );
  }

  lines.push(``, `🎁 <b>Условия:</b>`, workingConditions);
  lines.push(``, `📩 <b>Откликнуться:</b> ${contact}`);

  if (v.close_date) {
    lines.push(``, `📅 Вакансия активна до: ${formatDate(v.close_date)}`);
  }

  lines.push(``, `⏳ На модерации`);

  const message = lines.join("\n");
  return truncateMessage(message, responsibilities);
}
