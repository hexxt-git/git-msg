export function getFilenameSafeTimestamp(date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, '-');
}
