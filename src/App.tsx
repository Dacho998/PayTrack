import { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./context/AuthContext";
import { EmployeesTab } from "./components/EmployeesTab/EmployeesTab";
import { FreelancersTab } from "./components/freelancersTab/FreelancersTab";
import { Navbar } from "./components/navBar/NavBar";
import { SummaryCards } from "./components/summaryCards/SummaryCards";
import * as XLSX from "xlsx";
import type { Employee, Freelancer, TabType } from "./types";

// 📅 Функција за пресметка на работни денови (Пон - Пет) за тековниот месец
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
  const { isAdmin, loginAsAdmin, logoutAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("employees");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [workingDays, setWorkingDays] = useState<number>(getWorkingDaysInCurrentMonth());
  const [loading, setLoading] = useState(true);

  // 🔄 Синхронизација со Firebase во реално време
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "paytrack", "data"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEmployees(data.employees || []);
        setFreelancers(data.freelancers || []);
        if (Number.isFinite(data.workingDays) && data.workingDays > 0) {
          setWorkingDays(data.workingDays); // Ги вчитуваме зачуваните работни денови од база
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 💾 Зачувување во Cloud (вклучувајќи ги и workingDays)
  const saveDataToCloud = async (
    newEmployees: Employee[], 
    newFreelancers: Freelancer[], 
    days: number = workingDays
  ) => {
    try {
      await setDoc(doc(db, "paytrack", "data"), {
        employees: newEmployees,
        freelancers: newFreelancers,
        workingDays: days,
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

  // 🔄 Ресет за Нов Месец (Тогаш се пресметуваат новите работни денови за тековниот месец)
  const handleResetMonth = () => {
    if (!isAdmin) return;
    if (window.confirm("Дали сте сигурни дека сакате да започнете нов месец? Сите денови ќе се ресетираат и ќе се пресметаат новите работни денови.")) {
      const newWorkingDays = getWorkingDaysInCurrentMonth(); // 👈 Пресметка на деновите за тековниот месец
      const resetEmp = employees.map((e) => ({ ...e, plusDays: 0 }));
      const resetFree = freelancers.map((f) => ({ ...f, totalDays: 0, isPaid: false }));

      setEmployees(resetEmp);
      setFreelancers(resetFree);
      setWorkingDays(newWorkingDays);

      // Зачувај сѐ во Firebase
      saveDataToCloud(resetEmp, resetFree, newWorkingDays);
      alert(`Новиот месец е започнат! Избрани се ${newWorkingDays} работни денови.`);
    }
  };

  const handleExportToExcel = () => {
    const employeesData = employees.map((emp) => {
      const dailyRate = Math.round(emp.baseSalary / workingDays);
      const bonus = Math.round(emp.plusDays * dailyRate);
      return {
        "Име и Презиме": emp.name,
        "Забелешка / Пари": emp.note || "-",
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
      <div className="app-header">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <button
          onClick={isAdmin ? logoutAdmin : loginAsAdmin}
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

      {activeTab === "employees" ? (
        <EmployeesTab 
          employees={employees} 
          setEmployees={handleSetEmployees} 
          workingDays={workingDays} 
        />
      ) : (
        <FreelancersTab freelancers={freelancers} setFreelancers={handleSetFreelancers} />
      )}

      <div className="action-buttons-container">
        {isAdmin && (
          <button onClick={handleResetMonth} className="btn-save btn-danger">
            🔄 Нов Месец
          </button>
        )}
        <button onClick={handleExportToExcel} className="btn-save btn-export">
          📊 Преземи Excel (.xlsx)
        </button>
      </div>

      <SummaryCards employees={employees} freelancers={freelancers} workingDays={workingDays} />
    </div>
  );
}