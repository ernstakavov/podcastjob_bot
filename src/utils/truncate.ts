const TELEGRAM_MESSAGE_LIMIT = 4096;

export function truncateMessage(
  message: string,
  truncatableField: string
): string {
  if (message.length <= TELEGRAM_MESSAGE_LIMIT) return message;

  const overflow = message.length - TELEGRAM_MESSAGE_LIMIT + 1; // +1 for "…"
  const fieldIndex = message.indexOf(truncatableField);

  if (fieldIndex === -1) {
    // Field not found, just truncate the end
    return message.slice(0, TELEGRAM_MESSAGE_LIMIT - 1) + "…";
  }

  const truncatedField =
    truncatableField.slice(0, truncatableField.length - overflow) + "…";
  return message.replace(truncatableField, truncatedField);
}
