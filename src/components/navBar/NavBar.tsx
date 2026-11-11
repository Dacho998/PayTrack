import React from "react";
import type { TabType } from "../../types";

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="navbar">
      <div className="brand">
        <img className="brand-logo" src="/logo.png" alt="PayTrack logo" />
        <div>
          <h1>PayTrack</h1>
          <p>Евиденција на плати и денови</p>
        </div>
      </div>
      <div className="tab-list">
        <button
          onClick={() => setActiveTab("employees")}
          className={`tab-btn ${activeTab === "employees" ? "active-emp" : ""}`}
          aria-pressed={activeTab === "employees"}
        >
          👤 Редовно Вработени
        </button>
        <button
          onClick={() => setActiveTab("freelancers")}
          className={`tab-btn ${activeTab === "freelancers" ? "active-free" : ""}`}
          aria-pressed={activeTab === "freelancers"}
        >
          🤝 Хонорарци / Испомош
        </button>
      </div>
    </div>
  );
};