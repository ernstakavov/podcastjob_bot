export function escapeHtml(text: unknown): string {
  if (text == null) return "";
  const str = typeof text === "string" ? text : String(text);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
