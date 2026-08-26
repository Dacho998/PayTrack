import React, { useState } from "react";
import type { Freelancer } from "../../types";

interface FreelancersTabProps {
  freelancers: Freelancer[];
  setFreelancers: React.Dispatch<React.SetStateAction<Freelancer[]>>;
}

export const FreelancersTab: React.FC<FreelancersTabProps> = ({ freelancers, setFreelancers }) => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [embg, setEmbg] = useState<string>("");
  const [bankAccount, setBankAccount] = useState<string>("");
  const [dailyRate, setDailyRate] = useState<string>("");
  const [totalDays, setTotalDays] = useState<string>("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !bankAccount) return;

    const newFree: Freelancer = {
      id: Date.now(),
      name,
      embg,
      bankAccount,
      dailyRate: Number(dailyRate) || 1000,
      totalDays: Number(totalDays) || 0,
      isPaid: false,
    };

    setFreelancers((prev) => [...prev, newFree]);
    setName("");
    setEmbg("");
    setBankAccount("");
    setDailyRate("");
    setTotalDays("");
    setShowForm(false);
  };

  // 🗑️ Бришење на хонорарец
  const handleDelete = (id: number, freeName: string) => {
    if (window.confirm(`Дали сте сигурни дека сакате да го избришете ${freeName}?`)) {
      setFreelancers((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Копирана сметка: ${text}`);
  };

  return (
    <div className="card-panel">
      <div className="panel-header">
        <h3>🤝 Табела за Хонорарци и Испомош</h3>
        <button onClick={() => setShowForm(!showForm)} className="btn-add">
          {showForm ? "Затвори" : "+ Додај Хонорарец"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="form-box">
          <input type="text" placeholder="Име и Презиме" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="text" placeholder="ЕМБГ" value={embg} onChange={(e) => setEmbg(e.target.value)} maxLength={13} />
          <input type="text" placeholder="Трансакциска сметка" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} required maxLength={15} />
          <input type="number" placeholder="Дневница" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} required />
          <input type="number" placeholder="Денови" value={totalDays} onChange={(e) => setTotalDays(e.target.value)} required />
          <button type="submit" className="btn-save">Зачувај</button>
        </form>
      )}

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Име и Презиме</th>
              <th>Матичен Број (ЕМБГ)</th>
              <th>Трансакциска Сметка</th>
              <th>Дневница</th>
              <th>Работени Денови</th>
              <th>За Исплата</th>
              <th>Статус</th>
              <th>Акција</th>
            </tr>
          </thead>
          <tbody>
            {freelancers.length === 0 ? (
              <tr><td colSpan={8}>Нема внесено хонорарци. Кликни "+ Додај Хонорарец".</td></tr>
            ) : (
              freelancers.map((f) => (
                <tr key={f.id}>
                  <td style={{ fontWeight: "bold" }}>👤 {f.name}</td>
                  <td>{f.embg || "-"}</td>
                  <td>
                    {f.bankAccount}
                    <button className="btn-copy" onClick={() => copyToClipboard(f.bankAccount)}>📋 Копирај</button>
                  </td>
                  <td>{Math.round(f.dailyRate).toLocaleString('de-DE')} ден.</td>
                  <td>
                    <input
                      type="number"
                      value={f.totalDays}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        setFreelancers((prev) => prev.map((item) => (item.id === f.id ? { ...item, totalDays: val } : item)));
                      }}
                      style={{ width: "50px", textAlign: "center", padding: "4px" }}
                    /> дена
                  </td>
                  <td style={{ color: "#28a745", fontWeight: "bold" }}>{Math.round(f.totalDays * f.dailyRate).toLocaleString('de-DE')} ден.</td>
                  <td>
                    <button
                      onClick={() => setFreelancers((prev) => prev.map((item) => (item.id === f.id ? { ...item, isPaid: !item.isPaid } : item)))}
                      className={`status-badge ${f.isPaid ? "paid" : "pending"}`}
                    >
                      {f.isPaid ? "✔ Исплатено" : "✖ Во чекање"}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(f.id, f.name)}
                      title="Избриши"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};