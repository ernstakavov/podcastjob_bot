import type { Database } from "../database.types.js";
import { escapeHtml } from "../utils/escapeHtml.js";
import { t } from "../utils/translations.js";
import { truncateMessage } from "../utils/truncate.js";

type Resume = Database["public"]["Tables"]["resume"]["Row"];

function formatInline(
  items: string[],
  translator?: (v: string) => string
): string {
  return items
    .map((item) => escapeHtml(translator ? translator(item) : item))
    .join(", ");
}

function formatSalary(
  fixed: number | null,
  from: number | null,
  to: number | null,
  period: string
): string {
  const suffix = period ? ` / ${escapeHtml(t.salaryPeriod(period))}` : "";
  if (fixed != null) return `${fixed} ₽${suffix}`;
  if (from != null && to != null) return `${from} – ${to} ₽${suffix}`;
  if (from != null) return `от ${from} ₽${suffix}`;
  if (to != null) return `до ${to} ₽${suffix}`;
  return "По договорённости";
}

function formatContacts(r: Resume): string {
  const parts: string[] = [`📧 ${escapeHtml(r.contact_email)}`];
  if (r.contact_phone) parts.push(`📞 ${escapeHtml(r.contact_phone)}`);
  if (r.contact_telegram) parts.push(`✈️ ${escapeHtml(r.contact_telegram)}`);
  if (r.contact_website) parts.push(`🌐 ${escapeHtml(r.contact_website)}`);
  return parts.join("\n");
}

export function formatResume(r: Resume): string {
  const position = escapeHtml(r.position);
  const experience = escapeHtml(r.experience);
  const skills = escapeHtml(r.skills);
  const employmentType = formatInline(r.employment_type, t.employmentType);
  const workFormat = escapeHtml(t.workMode(r.work_format));
  const salary = formatSalary(
    r.salary_fixed,
    r.salary_from,
    r.salary_to,
    r.salary_period
  );

  const lines: string[] = [
    `📄 <b>Новое резюме</b>`,
    ``,
    `<b>${position}</b>`,
  ];

  if (r.roles.length > 0) {
    lines.push(`🎯 ${formatInline(r.roles, t.role)}`);
  }

  const meta: string[] = [];
  if (employmentType) meta.push(employmentType);
  if (workFormat) meta.push(workFormat);
  if (meta.length > 0) {
    lines.push(meta.join(" ∙ "));
  }

  if (r.city) {
    lines.push(`🏙 ${escapeHtml(r.city)}`);
  }

  lines.push(``, `💰 <b>${salary}</b>`);

  lines.push(``, `💼 <b>Опыт:</b>`, experience);
  lines.push(``, `🛠 <b>Навыки:</b>`, skills);

  if (r.achievements) {
    lines.push(``, `🏆 <b>Ключевые достижения:</b>`, escapeHtml(r.achievements));
  }

  lines.push(``, `📩 <b>Контакты:</b>`, formatContacts(r));
  lines.push(``, `⏳ На модерации`);

  const message = lines.join("\n");
  return truncateMessage(message, experience);
}
