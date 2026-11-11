import type { Employee, Freelancer } from "../../types";

export type PayrollState = {
  employees: Employee[];
  freelancers: Freelancer[];
  workingDays: number;
  activeMonthKey: string;
};
