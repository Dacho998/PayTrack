import React, { useState } from "react";
import type { Freelancer } from "../../types";
import { useAuth } from "../../context/AuthContext";

interface FreelancerRowProps {
  freelancer: Freelancer;
  setFreelancers: React.Dispatch<React.SetStateAction<Freelancer[]>>;
}

export const FreelancerRow: React.FC<FreelancerRowProps> = ({
  freelancer: f,
  setFreelancers,
}) => {
  const { isAdmin } = useAuth();
  
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(f.name);
  const [editEmbg, setEditEmbg] = useState<string>(f.embg || "");
  const [editBankAccount, setEditBankAccount] = useState<string>(f.bankAccount);
  const [editDailyRate, setEditDailyRate] = useState<string>(f.dailyRate.toString());

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Копирана сметка: ${text}`);
  };

  const handleDelete = (id: number | string, freeName: string) => {
    if (window.confirm(`Дали сте сигурни дека сакате да го избришете ${freeName}?`)) {
      setFreelancers((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const saveEdit = (id: number | string) => {
    if (!editName || !editBankAccount || !editDailyRate) return;

    setFreelancers((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              name: editName,
              embg: editEmbg,
              bankAccount: editBankAccount,
              dailyRate: Number(editDailyRate),
            }
          : item
      )
    );
    setIsEditing(false);
  };

  return (
    <tr>
      <td style={{ fontWeight: "bold" }}>
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            style={{ padding: "4px", width: "100%" }}
          />
        ) : (
          `👤 ${f.name}`
        )}
      </td>
      <td>
        {isEditing ? (
          <input
            type="text"
            value={editEmbg}
            onChange={(e) => setEditEmbg(e.target.value)}
            maxLength={13}
            style={{ padding: "4px", width: "110px" }}
          />
        ) : (
          f.embg || "-"
        )}
      </td>
      <td>
        {isEditing ? (
          <input
            type="text"
            value={editBankAccount}
            onChange={(e) => setEditBankAccount(e.target.value)}
            maxLength={15}
            style={{ padding: "4px", width: "120px" }}
          />
        ) : (
          <>
            {f.bankAccount}
            <button className="btn-copy" onClick={() => copyToClipboard(f.bankAccount)}>
              📋 Копирај
            </button>
          </>
        )}
      </td>
      <td>
        {isEditing ? (
          <input
            type="number"
            value={editDailyRate}
            onChange={(e) => setEditDailyRate(e.target.value)}
            style={{ padding: "4px", width: "80px" }}
          />
        ) : (
          `${Math.round(f.dailyRate).toLocaleString("de-DE")} ден.`
        )}
      </td>
      <td>
        {/* 🔒 Само Админ може да менува денови */}
        <input
          type="number"
          value={f.totalDays}
          disabled={!isAdmin}
          onChange={(e) => {
            const val = Math.max(0, Number(e.target.value));
            setFreelancers((prev) =>
              prev.map((item) => (item.id === f.id ? { ...item, totalDays: val } : item))
            );
          }}
          style={{
            width: "50px",
            textAlign: "center",
            padding: "4px",
            cursor: isAdmin ? "text" : "not-allowed",
            backgroundColor: isAdmin ? "#fff" : "#f0f0f0",
          }}
        />{" "}
        дена
      </td>
      <td style={{ color: "#28a745", fontWeight: "bold" }}>
        {Math.round(f.totalDays * f.dailyRate).toLocaleString("de-DE")} ден.
      </td>
      <td>
        {/* ✅ Достапно за сите да кликнат и сменат статус */}
        <button
          onClick={() => {
            setFreelancers((prev) =>
              prev.map((item) => (item.id === f.id ? { ...item, isPaid: !item.isPaid } : item))
            );
          }}
          className={`status-badge ${f.isPaid ? "paid" : "pending"}`}
          style={{ cursor: "pointer", border: "none", outline: "none" }}
          title="Кликни за промена на статус"
        >
          {f.isPaid ? "✔ Исплатено" : "✖ Во чекање"}
        </button>
      </td>
      <td>
        {/* 🔒 Само Админ ги гледа опциите за уредување/бришење */}
        {isAdmin ? (
          isEditing ? (
            <div style={{ display: "flex", gap: "4px" }}>
              <button onClick={() => saveEdit(f.id)} className="btn-save" style={{ padding: "4px 8px" }}>
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
                onClick={() => handleDelete(f.id, f.name)}
                title="Избриши"
                style={{ padding: "4px 8px" }}
              >
                🗑️
              </button>
            </div>
          )
        ) : (
          <span style={{ fontSize: "0.8em", color: "#888" }}>-</span>
        )}
      </td>
    </tr>
  );
};