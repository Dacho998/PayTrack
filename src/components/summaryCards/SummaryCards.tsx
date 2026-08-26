import React from "react";
import type { Employee, Freelancer } from "../../types";

interface SummaryCardsProps {
  employees: Employee[];
  freelancers: Freelancer[];
}

const getWorkingDaysInCurrentMonth = (): number => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  let workingDays = 0;
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dayOfWeek = new Date(year, month, day).getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  return workingDays;
};

export const SummaryCards: React.FC<SummaryCardsProps> = ({ employees, freelancers }) => {
  const workingDays = getWorkingDaysInCurrentMonth();

  const totalEmployeeAdditions = employees.reduce((sum, e) => {
    const dynamicDailyRate = Math.round(e.baseSalary / workingDays);
    return sum + e.plusDays * dynamicDailyRate;
  }, 0);

  const totalFreelancerCost = freelancers.reduce(
    (sum, f) => sum + f.totalDays * f.dailyRate,
    0
  );

  return (
    <div className="summary-grid">
      <div className="summary-card card-green">
        <small>Вкупно Додатоци (+ Денови)</small>
        <h3>+{totalEmployeeAdditions.toLocaleString()} ден.</h3>
      </div>
      <div className="summary-card card-yellow">
        <small>Вкупно за Хонорарци</small>
        <h3>{totalFreelancerCost.toLocaleString()} ден.</h3>
      </div>
      <div className="summary-card card-teal">
        <small>ВКУПЕН ТРОШОК</small>
        <h3>{(totalEmployeeAdditions + totalFreelancerCost).toLocaleString()} ден.</h3>
      </div>
    </div>
  );
};