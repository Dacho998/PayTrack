import type { Employee, Freelancer } from "../types";

export type PayrollMonthSnapshot = {
  monthKey: string;
  employees: Employee[];
  freelancers: Freelancer[];
  workingDays: number;
};
