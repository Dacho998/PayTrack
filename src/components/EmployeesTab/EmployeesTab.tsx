import React, { useState } from "react";
import type { Employee } from "../../types";

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

const formatMoney = (amount: number): string => {
  return Math.round(amount).toLocaleString('de-DE', { maximumFractionDigits: 0 });
};

export const EmployeesTab: React.FC<EmployeesTabProps> = ({ employees, setEmployees }) => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [baseSalary, setBaseSalary] = useState<string>("");

  const workingDays = getWorkingDaysInCurrentMonth();

  const updateDays = (id: number, delta: number) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, plusDays: Math.max(0, emp.plusDays + delta) } : emp))
    );
  };

  
  const handleDelete = (id: number, empName: string) => {
    if (window.confirm(`Дали сте сигурни дека сакате да го избришете ${empName}?`)) {
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !baseSalary) return;

    const newEmp: Employee = {
      id: Date.now(),
      name,
      baseSalary: Number(baseSalary),
      dailyRate: 0,
      plusDays: 0,
    };

    setEmployees((prev) => [...prev, newEmp]);
    setName("");
    setBaseSalary("");
    setShowForm(false);
  };

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

      {showForm && (
        <form onSubmit={handleAdd} className="form-box">
          <input
            type="text"
            placeholder="Име и Презиме"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Основна Плата (пр. 46000)"
            value={baseSalary}
            onChange={(e) => setBaseSalary(e.target.value)}
            required
          />
          <button type="submit" className="btn-save">
            Зачувај
          </button>
        </form>
      )}

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
              employees.map((emp) => {
                const dynamicDailyRate = Math.round(emp.baseSalary / workingDays);
                const totalExtra = Math.round(emp.plusDays * dynamicDailyRate);

                return (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: "bold" }}>👤 {emp.name}</td>
                    <td>{formatMoney(emp.baseSalary)} ден.</td>
                    <td style={{ color: "#64748b" }}>
                      {formatMoney(dynamicDailyRate)} ден.
                    </td>
                    <td>
                      <div className="counter-box">
                        <button className="btn-counter" onClick={() => updateDays(emp.id, -1)}>-</button>
                        <span className="counter-value">{emp.plusDays}</span>
                        <button className="btn-counter" onClick={() => updateDays(emp.id, 1)}>+</button>
                      </div>
                    </td>
                    <td style={{ color: "#007bff", fontWeight: "bold" }}>
                      +{formatMoney(totalExtra)} ден.
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(emp.id, emp.name)}
                        title="Избриши"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};