import React from "react";
import type { Employee, Freelancer } from "../../types";

interface SummaryCardsProps {
  employees: Employee[];
  freelancers: Freelancer[];
  workingDays: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ employees, freelancers, workingDays }) => {
  const totalEmployeeAdditions = employees.reduce((sum, e) => {
    const dynamicDailyRate = Math.round(e.baseSalary / workingDays);
    return sum + e.plusDays * dynamicDailyRate;
  }, 0);

  const totalFreelancerCost = freelancers.reduce(
    (sum, f) => sum + f.totalDays * f.dailyRate,
    0
  );

  return (
    <section className="financial-overview">
      <div className="overview-heading">
        <div>
          <span className="eyebrow">ОВОЈ ПЕРИОД</span>
          <h2>Финансиски преглед</h2>
        </div>
        <span className="overview-count">
          {employees.length} вработени <span aria-hidden="true">·</span> {freelancers.length} хонорарци
        </span>
      </div>
      <div className="summary-grid">
        <div className="summary-card card-green">
          <small>Додатоци за вработени</small>
          <small>{workingDays} работни денови</small>
          <h3>+{totalEmployeeAdditions.toLocaleString()} <span>ден.</span></h3>
        </div>
        <div className="summary-card card-yellow">
          <small>Исплати за хонорарци</small>
          <small>{freelancers.length} лица</small>
          <h3>{totalFreelancerCost.toLocaleString()} <span>ден.</span></h3>
        </div>
        <div className="summary-card card-teal">
          <small>Вкупен трошок</small>
          <small>Вработени + хонорарци</small>
          <h3>{(totalEmployeeAdditions + totalFreelancerCost).toLocaleString()} <span>ден.</span></h3>
        </div>
      </div>
    </section>
  );
};