export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function formatDateTime(isoString: string): string {
  if (!isoString) {
    console.warn("formatDateTime called with empty value:", isoString);
    return "Дата не указана";
  }
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    console.warn("formatDateTime failed to parse date:", isoString);
    return String(isoString);
  }
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} в ${hours}:${minutes}`;
}
