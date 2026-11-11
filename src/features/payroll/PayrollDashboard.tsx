import { useState } from "react";
import { EmployeesTab } from "../../components/EmployeesTab/EmployeesTab";
import { FreelancersTab } from "../../components/freelancersTab/FreelancersTab";
import { Navbar } from "../../components/navBar/NavBar";
import { SummaryCards } from "../../components/summaryCards/SummaryCards";
import { MonthHistoryControls } from "../../payrollHistory";
import type { TabType } from "../../types";
import type { usePayroll } from "./usePayroll";
import { exportPayrollToExcel } from "./exportPayrollToExcel";

type PayrollDashboardProps = ReturnType<typeof usePayroll> & {
  isAdmin: boolean;
  onAdminToggle: () => void;
};

export function PayrollDashboard({
  isAdmin,
  onAdminToggle,
  activeMonthKey,
  monthHistory,
  selectedMonthKey,
  setSelectedMonthKey,
  saveError,
  loading,
  isViewingHistoricalMonth,
  visibleEmployees,
  visibleFreelancers,
  visibleWorkingDays,
  visibleMonthKey,
  handleSetEmployees,
  handleSetFreelancers,
  handleResetMonth,
}: PayrollDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("employees");

  const handleExportToExcel = () => {
    exportPayrollToExcel(
      visibleEmployees,
      visibleFreelancers,
      visibleWorkingDays,
      visibleMonthKey
    );
  };

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Вчитување на податоци...</div>;
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <button
          onClick={onAdminToggle}
          className={`admin-toggle ${isAdmin ? "is-admin" : ""}`}
        >
          {isAdmin ? "🔒 Напушти Админ" : "🔓 Админ Најава"}
        </button>
      </div>

      <section className="dashboard-intro">
        <div>
          <span className="eyebrow">PAYROLL OVERVIEW</span>
          <h2>Преглед на исплати</h2>
          <p>Вработени, работни денови и исплати — прегледно на едно место.</p>
        </div>
        <div className="intro-seal" aria-hidden="true">PT</div>
      </section>

      {saveError && (
        <div
          role="alert"
          style={{
            margin: "0 0 16px",
            padding: "12px 16px",
            borderRadius: "8px",
            background: "#fff3f3",
            border: "1px solid #f5b8b8",
            color: "#8a1f1f",
          }}
        >
          {saveError}
        </div>
      )}

      {isAdmin && (
        <>
          <MonthHistoryControls
            activeMonthKey={activeMonthKey}
            selectedMonthKey={selectedMonthKey}
            history={monthHistory}
            onSelectMonth={setSelectedMonthKey}
          />

          {isViewingHistoricalMonth && (
            <div
              style={{
                margin: "0 0 16px",
                padding: "12px 16px",
                borderRadius: "8px",
                background: "#f5f7ff",
                border: "1px solid #dfe7ff",
                color: "#2b3b8b",
              }}
            >
              Гледате архивски податоци за {selectedMonthKey}. За да изменувате тековен месец, врати се на тековен.
            </div>
          )}
        </>
      )}

      {activeTab === "employees" ? (
        <EmployeesTab
          employees={visibleEmployees}
          setEmployees={isViewingHistoricalMonth ? () => undefined : handleSetEmployees}
          workingDays={visibleWorkingDays}
        />
      ) : (
        <FreelancersTab
          freelancers={visibleFreelancers}
          setFreelancers={isViewingHistoricalMonth ? () => undefined : handleSetFreelancers}
        />
      )}

      <div className="action-buttons-container">
        {isAdmin && (
          <button
            onClick={handleResetMonth}
            className="btn-save btn-danger"
            disabled={isViewingHistoricalMonth}
            title={isViewingHistoricalMonth ? "Врати се на активниот месец за да започнеш нов период." : undefined}
          >
            🔄 Нов Месец
          </button>
        )}
        <button onClick={handleExportToExcel} className="btn-save btn-export">
          📊 Преземи Excel (.xlsx)
        </button>
      </div>

      <SummaryCards
        employees={visibleEmployees}
        freelancers={visibleFreelancers}
        workingDays={visibleWorkingDays}
      />
    </div>
  );
}
