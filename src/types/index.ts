export interface Employee {
  id: number;
  name: string;
  baseSalary: number;
  dailyRate: number;
  plusDays: number;
}

export interface Freelancer {
  id: number;
  name: string;
  embg: string;
  bankAccount: string;
  dailyRate: number;
  totalDays: number;
  isPaid: boolean;
}

export type TabType = "employees" | "freelancers";