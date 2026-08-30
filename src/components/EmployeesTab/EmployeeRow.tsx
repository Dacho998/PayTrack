import React, { useState } from "react";
import type { Employee } from "../../types";
import { useAuth } from "../../context/AuthContext";

interface EmployeeRowProps {
  employee: Employee;
  workingDays: number;
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

const formatMoney = (amount: number): string => {
  return Math.round(amount).toLocaleString("de-DE", { maximumFractionDigits: 0 });
};

export const EmployeeRow: React.FC<EmployeeRowProps> = ({
  employee: emp,
  workingDays,
  setEmployees,
}) => {
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(emp.name);
  const [editBaseSalary, setEditBaseSalary] = useState<string>(emp.baseSalary.toString());

  const dynamicDailyRate = Math.round(emp.baseSalary / workingDays);
  const totalExtra = Math.round(emp.plusDays * dynamicDailyRate);

  // 📝 Забелешката ја менуваат СИТЕ КОРИСНИЦИ директно
  const handleNoteChange = (newNote: string) => {
    setEmployees((prev) =>
      prev.map((item) => (item.id === emp.id ? { ...item, note: newNote } : item))
    );
  };

  // ➕/➖ Само АДМИН може да променува плус денови
  const updateDays = (delta: number) => {
    if (!isAdmin) return;
    setEmployees((prev) =>
      prev.map((item) => (item.id === emp.id ? { ...item, plusDays: Math.max(0, item.plusDays + delta) } : item))
    );
  };

  const handleDelete = () => {
    if (window.confirm(`Дали сте сигурни дека сакате да го избришете ${emp.name}?`)) {
      setEmployees((prev) => prev.filter((item) => item.id !== emp.id));
    }
  };

  const saveEdit = () => {
    if (!editName || !editBaseSalary) return;

    setEmployees((prev) =>
      prev.map((item) =>
        item.id === emp.id
          ? {
              ...item,
              name: editName,
              baseSalary: Number(editBaseSalary),
            }
          : item
      )
    );
    setIsEditing(false);
  };

  return (
    <tr>
      <td style={{ verticalAlign: "top" }}>
        {isAdmin && isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            style={{ padding: "4px", width: "100%", fontWeight: "bold", marginBottom: "4px" }}
          />
        ) : (
          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>👤 {emp.name}</div>
        )}

        {/* 📝 Директно поле за забелешка - отворено за сите */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
          <span style={{ fontSize: "0.8rem" }}>📝</span>
          <input
            type="text"
            placeholder="Внеси забелешка / каде се парите..."
            value={emp.note || ""}
            onChange={(e) => handleNoteChange(e.target.value)}
            style={{
              width: "100%",
              fontSize: "0.82rem",
              padding: "2px 6px",
              border: "1px solid #cbd5e1",
              borderRadius: "4px",
              backgroundColor: emp.note ? "#f8fafc" : "#fff",
              color: "#334155",
            }}
          />
        </div>
      </td>

      <td>
        {isAdmin && isEditing ? (
          <input
            type="number"
            value={editBaseSalary}
            onChange={(e) => setEditBaseSalary(e.target.value)}
            style={{ padding: "4px", width: "100px" }}
          />
        ) : (
          `${formatMoney(emp.baseSalary)} ден.`
        )}
      </td>

      <td style={{ color: "#64748b" }}>{formatMoney(dynamicDailyRate)} ден.</td>

      <td>
        <div className="counter-box">
          {isAdmin && (
            <button className="btn-counter" onClick={() => updateDays(-1)}>
              -
            </button>
          )}
          <span className="counter-value">{emp.plusDays}</span>
          {isAdmin && (
            <button className="btn-counter" onClick={() => updateDays(1)}>
              +
            </button>
          )}
        </div>
      </td>

      <td style={{ color: "#007bff", fontWeight: "bold" }}>+{formatMoney(totalExtra)} ден.</td>

      {isAdmin && (
        <td>
          {isEditing ? (
            <div style={{ display: "flex", gap: "4px" }}>
              <button onClick={saveEdit} className="btn-save" style={{ padding: "4px 8px" }}>
                💾
              </button>
              <button onClick={() => setIsEditing(false)} className="btn-delete" style={{ padding: "4px 8px" }}>
                ❌
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                className="btn-add"
                onClick={() => setIsEditing(true)}
                title="Измени"
                style={{ padding: "4px 8px" }}
              >
                ✏️
              </button>
              <button
                className="btn-delete"
                onClick={handleDelete}
                title="Избриши"
                style={{ padding: "4px 8px" }}
              >
                🗑️
              </button>
            </div>
          )}
        </td>
      )}
    </tr>
  );
};