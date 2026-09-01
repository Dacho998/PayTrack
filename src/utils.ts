// src/utils.ts
export const getPreviousMonthWorkingDays = (): number => {
  const today = new Date();
  const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const year = prevMonthDate.getFullYear();
  const month = prevMonthDate.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  
  let workingDays = 0;
  for (let day = 1; day <= totalDays; day++) {
    const dayOfWeek = new Date(year, month, day).getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  return workingDays;
};