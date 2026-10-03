export function getCurrentDate(): string {
  return new Date().toISOString();
}

export function formatDate(
  date: string,
): string {
  return new Date(date).toLocaleDateString("en-IN");
}