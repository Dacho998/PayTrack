import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./styles.css";
import type { Employee, Freelancer, TabType } from "./types";
import { Navbar } from "./components/navBar/NavBar";
import { EmployeesTab } from "./components/EmployeesTab/EmployeesTab";
import { FreelancersTab } from "./components/freelancersTab/FreelancersTab";
import { SummaryCards } from "./components/summaryCards/SummaryCards";

// Firebase увоз
import { db } from "./firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("employees");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Синхронизација со Firebase во реално време
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "paytrack", "data"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEmployees(data.employees || []);
        setFreelancers(data.freelancers || []);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 💾 Зачувување во база при секоја промена
  const saveDataToCloud = async (newEmployees: Employee[], newFreelancers: Freelancer[]) => {
    try {
      await setDoc(doc(db, "paytrack", "data"), {
        employees: newEmployees,
        freelancers: newFreelancers,
      });
    } catch (error) {
      console.error("Грешка при зачувување во Cloud:", error);
    }
  };

  const handleSetEmployees = (newEmployees: Employee[] | ((prev: Employee[]) => Employee[])) => {
    const updated = typeof newEmployees === "function" ? newEmployees(employees) : newEmployees;
    setEmployees(updated);
    saveDataToCloud(updated, freelancers);
  };

  const handleSetFreelancers = (newFreelancers: Freelancer[] | ((prev: Freelancer[]) => Freelancer[])) => {
    const updated = typeof newFreelancers === "function" ? newFreelancers(freelancers) : newFreelancers;
    setFreelancers(updated);
    saveDataToCloud(employees, updated);
  };

  // 🔄 Ресет за Нов Месец
  const handleResetMonth = () => {
    if (window.confirm("Дали сте сигурни дека сакате да ги ресетирате сите денови за новиот месец?")) {
      const resetEmp = employees.map((e) => ({ ...e, plusDays: 0 }));
      const resetFree = freelancers.map((f) => ({ ...f, totalDays: 0, isPaid: false }));
      
      setEmployees(resetEmp);
      setFreelancers(resetFree);
      saveDataToCloud(resetEmp, resetFree);
      alert("Деновите се ресетирани!");
    }
  };

  // 📊 Експорт во Excel
  const handleExportToExcel = () => {
    const workingDays = getWorkingDaysInCurrentMonth();

    const employeesData = employees.map((emp) => {
      const dailyRate = Math.round(emp.baseSalary / workingDays);
      const bonus = Math.round(emp.plusDays * dailyRate);
      return {
        "Име и Презиме": emp.name,
        "Основна Плата (ден)": emp.baseSalary,
        "Дневница за Месецот (ден)": dailyRate,
        "Плус Денови": emp.plusDays,
        "Вкупно Додаток (ден)": bonus,
      };
    });

    const freelancersData = freelancers.map((f) => ({
      "Име и Презиме": f.name,
      "ЕМБГ": f.embg || "-",
      "Трансакциска Сметка": f.bankAccount,
      "Дневница (ден)": f.dailyRate,
      "Работени Денови": f.totalDays,
      "Вкупно за Исплата (ден)": Math.round(f.totalDays * f.dailyRate),
      "Статус": f.isPaid ? "Исплатено" : "Во чекање",
    }));

    const workbook = XLSX.utils.book_new();
    const empSheet = XLSX.utils.json_to_sheet(employeesData);
    const freeSheet = XLSX.utils.json_to_sheet(freelancersData);

    XLSX.utils.book_append_sheet(workbook, empSheet, "Редовно Вработени");
    XLSX.utils.book_append_sheet(workbook, freeSheet, "Хонорарци");

    const now = new Date();
    const fileName = `Izvestaj_Plati_${now.getMonth() + 1}_${now.getFullYear()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Вчитување на податоци...</div>;
  }

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "employees" ? (
        <EmployeesTab employees={employees} setEmployees={handleSetEmployees} />
      ) : (
        <FreelancersTab freelancers={freelancers} setFreelancers={handleSetFreelancers} />
      )}

      <div className="action-buttons-container" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginBottom: "20px" }}>
        <button onClick={handleResetMonth} className="btn-save" style={{ backgroundColor: "#dc3545" }}>
          🔄 Нов Месец
        </button>
        <button onClick={handleExportToExcel} className="btn-save" style={{ backgroundColor: "#198754" }}>
          📊 Преземи Excel (.xlsx)
        </button>
      </div>

      <SummaryCards employees={employees} freelancers={freelancers} />
    </div>
  );
}