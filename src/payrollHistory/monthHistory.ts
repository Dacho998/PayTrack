import type { Employee, Freelancer } from "../types";
import type { PayrollMonthSnapshot } from "./types";

export const getMonthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const isValidMonthKey = (monthKey: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(monthKey);

export const getNextMonthKey = (monthKey: string) => {
  const [year, month] = monthKey.split("-").map(Number);
  return getMonthKey(new Date(year, month, 1));
};

export const getMonthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split("-");
  if (!year || !month) return monthKey;

  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("mk-MK", {
    month: "long",
    year: "numeric",
  }).format(date);
};

export const normalizeMonthSnapshot = (
  snapshot: Partial<PayrollMonthSnapshot> | null | undefined
): PayrollMonthSnapshot | null => {
  if (!snapshot) return null;

  const monthKey = typeof snapshot.monthKey === "string" && snapshot.monthKey ? snapshot.monthKey : getMonthKey();

  return {
    monthKey,
    employees: Array.isArray(snapshot.employees) ? (snapshot.employees as Employee[]) : [],
    freelancers: Array.isArray(snapshot.freelancers) ? (snapshot.freelancers as Freelancer[]) : [],
    workingDays: Number.isFinite(snapshot.workingDays) && Number(snapshot.workingDays) > 0 ? Number(snapshot.workingDays) : 1,
  };
};
