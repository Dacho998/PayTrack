import React, { useState } from "react";
import type { Freelancer } from "../../types";
import { FreelancerRow } from "./FreelancerRow";
import { useAuth } from "../../context/AuthContext";

interface FreelancersTabProps {
  freelancers: Freelancer[];
  setFreelancers: React.Dispatch<React.SetStateAction<Freelancer[]>>;
}

export const FreelancersTab: React.FC<FreelancersTabProps> = ({ freelancers, setFreelancers }) => {
  const { isAdmin } = useAuth();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [embg, setEmbg] = useState<string>("");
  const [bankAccount, setBankAccount] = useState<string>("");
  const [dailyRate, setDailyRate] = useState<string>("");
  const [totalDays, setTotalDays] = useState<string>("");

  const sortedFreelancers = [...freelancers].sort(
    (a, b) => Number(a.totalDays === 0) - Number(b.totalDays === 0)
  );

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

  return (
    <div className="card-panel">
      <div className="panel-header">
        <h3>🤝 Табела за Хонорарци и Испомош</h3>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} className="btn-add">
            {showForm ? "Затвори" : "+ Додај Хонорарец"}
          </button>
        )}
      </div>

      {isAdmin && showForm && (
        <form onSubmit={handleAdd} className="form-box">
          <input type="text" placeholder="Име и Презиме" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="text" placeholder="ЕМБГ" value={embg} onChange={(e) => setEmbg(e.target.value)} maxLength={13} />
          <input type="text" placeholder="Трансакциска сметка" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} required maxLength={15} />
          <input type="number" placeholder="Дневница" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} required />
          <input type="number" placeholder="Денови" value={totalDays} onChange={(e) => setTotalDays(e.target.value)} required />
          <button type="submit" className="btn-save">Зачувај</button>
        </form>
      )}

      <div
        className="table-responsive table-responsive--freelancers"
        role="region"
        aria-label="Табела за хонорарци и испомош"
        tabIndex={0}
      >
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
            {sortedFreelancers.length === 0 ? (
              <tr>
                <td colSpan={8}>Нема внесено хонорарци.</td>
              </tr>
            ) : (
              sortedFreelancers.map((f) => (
                <FreelancerRow
                  key={f.id}
                  freelancer={f}
                  setFreelancers={setFreelancers}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};