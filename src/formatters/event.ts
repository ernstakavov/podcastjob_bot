import type { Database } from "../database.types.js";
import { escapeHtml } from "../utils/escapeHtml.js";
import { formatDate, formatDateTime } from "../utils/formatDate.js";
import { t } from "../utils/translations.js";
import { truncateMessage } from "../utils/truncate.js";

type Event = Database["public"]["Tables"]["event"]["Row"];

function formatCost(type: string, amount: number | null): string {
  if (amount != null && amount > 0) return `${amount} ₽`;
  if (type === "free") return "Бесплатно";
  if (type) return t.costType(type);
  return "По запросу";
}

function formatDateRange(start: string, end: string | null): string {
  if (end && end !== start) {
    return `${formatDateTime(start)} — ${formatDateTime(end)}`;
  }
  return formatDateTime(start);
}

function formatContacts(e: Event): string {
  const parts: string[] = [];
  if (e.contact_email) parts.push(`📧 ${escapeHtml(e.contact_email)}`);
  if (e.contact_phone) parts.push(`📞 ${escapeHtml(e.contact_phone)}`);
  if (e.contact_telegram) parts.push(`✈️ ${escapeHtml(e.contact_telegram)}`);
  return parts.join("\n");
}

export function formatEvent(e: Event): string {
  const title = escapeHtml(e.title);
  const organizer = escapeHtml(e.organizer);
  const eventType = escapeHtml(t.eventType(e.event_type));
  const eventFormat = escapeHtml(t.eventFormat(e.event_format));
  const shortDescription = escapeHtml(e.short_description);
  const detailedDescription = e.detailed_description
    ? escapeHtml(e.detailed_description)
    : null;

  const lines: string[] = [
    `📅 <b>Новое мероприятие</b>`,
    ``,
    `<b>${title}</b>`,
    `${organizer} ∙ ${eventType} ∙ ${eventFormat}`,
    ``,
    `🗓 <b>${formatDateRange(e.date_start, e.date_end)}</b>`,
  ];

  if (e.location) {
    lines.push(`📍 ${escapeHtml(e.location)}`);
  }

  if (e.target_audience.length > 0) {
    const audience = e.target_audience
      .map((a) => escapeHtml(t.targetAudience(a)))
      .join(", ");
    lines.push(`👥 ${audience}`);
  }

  lines.push(`💰 ${formatCost(e.cost_type, e.cost_amount)}`);

  lines.push(``, `📝 <b>Описание:</b>`, shortDescription);

  if (detailedDescription) {
    lines.push(``, `📋 <b>Подробности:</b>`, detailedDescription);
  }

  if (e.registration_deadline) {
    lines.push(
      ``,
      `⏰ Регистрация до: ${formatDate(e.registration_deadline)}`
    );
  }

  if (e.website) {
    lines.push(``, `🌐 ${escapeHtml(e.website)}`);
  }

  const contacts = formatContacts(e);
  if (contacts) {
    lines.push(``, `📩 <b>Контакты:</b>`, contacts);
  }

  lines.push(``, `⏳ На модерации`);

  const truncatableField = detailedDescription ?? shortDescription;
  const message = lines.join("\n");
  return truncateMessage(message, truncatableField);
}
