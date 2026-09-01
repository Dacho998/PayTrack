import React, { useState } from "react";
import type { Employee } from "../../types";
import { EmployeeForm } from "./EmployeeFrom";
import { EmployeeRow } from "./EmployeeRow";

interface EmployeesTabProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  workingDays?: number; 
}

export const EmployeesTab: React.FC<EmployeesTabProps> = ({
  employees,
  setEmployees,
  workingDays = 22, 
}) => {
  const [showForm, setShowForm] = useState<boolean>(false);

  const safeWorkingDays = workingDays && !isNaN(workingDays) && workingDays > 0 ? workingDays : 22;

  // 🔽 СОРТИРАЊЕ: Прво оние што имаат плус денови (> 0), најдолу оние со 0
  const sortedEmployees = [...employees].sort((a, b) => b.plusDays - a.plusDays);

  return (
    <div className="card-panel">
      <div className="panel-header">
        <div>
          <h3>👤 Табела за Редовно Вработени</h3>
          <small style={{ color: "#64748b" }}>
            📅 Избраниот месец има <strong>{safeWorkingDays} работни денови</strong> (пон - пет)
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
            {sortedEmployees.length === 0 ? (
              <tr>
                <td colSpan={6}>Нема внесено вработени. Кликни "+ Додај Вработен".</td>
              </tr>
            ) : (
              sortedEmployees.map((emp) => (
                <EmployeeRow
                  key={emp.id}
                  employee={emp}
                  workingDays={safeWorkingDays}
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