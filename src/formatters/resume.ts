import type { Database } from "../database.types.js";
import { escapeHtml } from "../utils/escapeHtml.js";
import { truncateMessage } from "../utils/truncate.js";

type Resume = Database["public"]["Tables"]["resume"]["Row"] & {
  status?: string;
};

export function formatResume(r: Resume): string {
  const position = escapeHtml(r.position);
  const employmentType = escapeHtml(r.employment_type);
  const experience = escapeHtml(r.experience);
  const skills = escapeHtml(r.skills);
  const contact = escapeHtml(r.contact);

  const lines: string[] = [
    `📄 <b>Новое резюме</b>`,
    ``,
    `<b>${position}</b>`,
    `${employmentType}`,
    ``,
    `💰 <b>${r.salary_expected} ₸</b>`,
    ``,
    `💼 <b>Опыт:</b>`,
    experience,
    ``,
    `🛠 <b>Навыки:</b>`,
    skills,
  ];

  if (r.achievements) {
    lines.push(``, `🏆 <b>Ключевые достижения:</b>`, escapeHtml(r.achievements));
  }

  lines.push(``, `📩 <b>Контакты:</b> ${contact}`);
  lines.push(``, `⏳ На модерации`);

  const message = lines.join("\n");
  return truncateMessage(message, experience);
}
