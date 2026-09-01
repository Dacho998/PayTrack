import React, { useState } from "react";
import type { Employee } from "../../types";

interface EmployeeFormProps {
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  onClose: () => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ setEmployees, onClose }) => {
  const [name, setName] = useState<string>("");
  const [baseSalary, setBaseSalary] = useState<string>("");
  const [note, setNote] = useState<string>(""); // 👈 Состојба за забелешка

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !baseSalary) return;

    const newEmp: Employee = {
      id: Date.now(),
      name,
      baseSalary: Number(baseSalary),
      dailyRate: 0,
      plusDays: 0,
      note, 
    };

    setEmployees((prev) => [...prev, newEmp]);
    setName("");
    setBaseSalary("");
    setNote("");
    onClose();
  };

  return (
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
        placeholder="Основна Плата"
        value={baseSalary}
        onChange={(e) => setBaseSalary(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Забелешка / Банка / За каде се пуштени парите"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button type="submit" className="btn-save">
        Зачувај
      </button>
    </form>
  );
};