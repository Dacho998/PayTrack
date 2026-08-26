import React from "react";
import type { TabType } from "../../types";

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="navbar">
      <h2>📊 Евиденција на Плати и Денови</h2>
      <div>
        <button
          onClick={() => setActiveTab("employees")}
          className={`tab-btn ${activeTab === "employees" ? "active-emp" : ""}`}
        >
          👤 Редовно Вработени
        </button>
        <button
          onClick={() => setActiveTab("freelancers")}
          className={`tab-btn ${activeTab === "freelancers" ? "active-free" : ""}`}
        >
          🤝 Хонорарци / Испомош
        </button>
      </div>
    </div>
  );
};