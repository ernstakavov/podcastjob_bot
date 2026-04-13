import type { Database } from "../database.types.js";
import { escapeHtml } from "../utils/escapeHtml.js";
import { formatDateTime } from "../utils/formatDate.js";
import { truncateMessage } from "../utils/truncate.js";

type Event = Database["public"]["Tables"]["event"]["Row"] & {
  status?: string;
};

export function formatEvent(e: Event): string {
  const title = escapeHtml(e.title);
  const location = escapeHtml(e.location);
  const contact = escapeHtml(e.contact);

  const lines: string[] = [
    `📅 <b>Новое мероприятие</b>`,
    ``,
    `<b>${title}</b>`,
    ``,
    `🗓 <b>${formatDateTime(e.date)}</b>`,
    `📍 ${location}`,
  ];

  if (e.program) {
    lines.push(``, `📝 <b>Программа:</b>`, escapeHtml(e.program));
  }

  if (e.conditions) {
    lines.push(``, `📋 <b>Условия участия:</b>`, escapeHtml(e.conditions));
  }

  lines.push(``, `📩 <b>Контакты:</b> ${contact}`);
  lines.push(``, `⏳ На модерации`);

  const message = lines.join("\n");
  return truncateMessage(message, e.program ? escapeHtml(e.program) : title);
}
