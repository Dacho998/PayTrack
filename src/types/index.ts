export interface Employee {
  id: number;
  name: string;
  baseSalary: number;
  dailyRate: number;
  plusDays: number;
  note?: string;
}

export interface Freelancer {
  id: number;
  name: string;
  embg: string;
  bankAccount: string;
  dailyRate: number;
  totalDays: number;
  isPaid: boolean;
  note?: string;
}

export type TabType = "employees" | "freelancers";