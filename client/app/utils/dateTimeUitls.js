export function getDayComparisons(compareDate, now = new Date()) {
  const pageDay = new Date(compareDate);
  pageDay.setHours(0, 0, 0, 0);

  const currentDay = new Date(now);
  currentDay.setHours(0, 0, 0, 0);

  return {
    isToday:
      compareDate.getFullYear() === now.getFullYear() &&
      compareDate.getMonth() === now.getMonth() &&
      compareDate.getDate() === now.getDate(),
    isPast: pageDay.getTime() < currentDay.getTime(),
    isTomorrow: pageDay.getTime() === currentDay.getTime() + 86400000,
    isYesterday: pageDay.getTime() === currentDay.getTime() - 86400000,
  };
}
