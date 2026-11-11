import type { Employee, Freelancer } from "../../types";
import { getMonthKey, getNextMonthKey, isValidMonthKey } from "../../payrollHistory";
import type { PayrollState } from "./types";

export const getWorkingDaysForMonthKey = (monthKey: string): number => {
  const [year, month] = monthKey.split("-").map(Number);
  if (!isValidMonthKey(monthKey)) return getWorkingDaysForMonthKey(getMonthKey());
  const totalDaysInMonth = new Date(year, month, 0).getDate();

  let workingDays = 0;
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dayOfWeek = new Date(year, month - 1, day).getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  return workingDays;
};

export const getWorkingDaysInCurrentMonth = (): number =>
  getWorkingDaysForMonthKey(getMonthKey());

export const getNextPayrollMonthKey = (activeMonthKey: string): string => {
  const calendarMonthKey = getMonthKey();
  return calendarMonthKey > activeMonthKey
    ? calendarMonthKey
    : getNextMonthKey(activeMonthKey);
};

const sanitizeNumber = (value: unknown, fallback = 0): number => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : fallback;
};

export const sanitizePayrollState = (state: PayrollState): PayrollState => {
  const workingDays = Number.isFinite(state.workingDays)
    ? Math.max(1, Math.floor(state.workingDays))
    : getWorkingDaysInCurrentMonth();

  return {
    employees: state.employees.map((employee: Employee) => ({
      ...employee,
      name: String(employee.name ?? "").trim(),
      note: employee.note ? String(employee.note).trim() : "",
      baseSalary: sanitizeNumber(employee.baseSalary),
      dailyRate: sanitizeNumber(employee.dailyRate),
      plusDays: sanitizeNumber(employee.plusDays),
    })),
    freelancers: state.freelancers.map((freelancer: Freelancer) => ({
      ...freelancer,
      name: String(freelancer.name ?? "").trim(),
      embg: String(freelancer.embg ?? "").trim(),
      bankAccount: String(freelancer.bankAccount ?? "").trim(),
      note: freelancer.note ? String(freelancer.note).trim() : "",
      dailyRate: sanitizeNumber(freelancer.dailyRate),
      totalDays: sanitizeNumber(freelancer.totalDays),
      isPaid: Boolean(freelancer.isPaid),
    })),
    workingDays,
    activeMonthKey: isValidMonthKey(state.activeMonthKey)
      ? state.activeMonthKey
      : getMonthKey(),
  };
};
