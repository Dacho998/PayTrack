import React, { useState } from "react";
import type { Employee } from "../../types";
import { EmployeeForm } from "./EmployeeFrom";
import { EmployeeRow } from "./EmployeeRow";

interface EmployeesTabProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
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

export const EmployeesTab: React.FC<EmployeesTabProps> = ({ employees, setEmployees }) => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const workingDays = getWorkingDaysInCurrentMonth();

  return (
    <div className="card-panel">
      <div className="panel-header">
        <div>
          <h3>👤 Табела за Редовно Вработени</h3>
          <small style={{ color: "#64748b" }}>
            📅 Овој месец има <strong>{workingDays} работни денови</strong> (пон - пет)
          </small>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-add">
          {showForm ? "Затвори" : "+ Додај Вработен"}
        </button>
      </div>

      {showForm && <EmployeeForm setEmployees={setEmployees} onClose={() => setShowForm(false)} />}

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Вработен</th>
              <th>Основна Плата</th>
              <th>Пресметана Дневница</th>
              <th>Плус Денови</th>
              <th>Вкупно Додаток</th>
              <th>Акција</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={6}>Нема внесено вработени. Кликни "+ Додај Вработен".</td>
              </tr>
            ) : (
              employees.map((emp) => (
                <EmployeeRow
                  key={emp.id}
                  employee={emp}
                  workingDays={workingDays}
                  setEmployees={setEmployees}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};