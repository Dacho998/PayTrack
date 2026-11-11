import * as XLSX from "xlsx";
import type { Employee, Freelancer } from "../../types";

export const exportPayrollToExcel = (
  employees: Employee[],
  freelancers: Freelancer[],
  workingDays: number,
  monthKey: string
) => {
  const employeesData = employees.map((employee) => {
    const dailyRate = Math.round(employee.baseSalary / workingDays);
    const bonus = Math.round(employee.plusDays * dailyRate);
    return {
      "Име и Презиме": employee.name,
      "Забелешка / Пари": employee.note || "-",
      "Основна Плата (ден)": employee.baseSalary,
      "Дневница за Месецот (ден)": dailyRate,
      "Плус Денови": employee.plusDays,
      "Вкупно Додаток (ден)": bonus,
    };
  });

  const freelancersData = freelancers.map((freelancer) => ({
    "Име и Презиме": freelancer.name,
    "ЕМБГ": freelancer.embg || "-",
    "Трансакциска Сметка": freelancer.bankAccount,
    "Дневница (ден)": freelancer.dailyRate,
    "Работени Денови": freelancer.totalDays,
    "Вкупно за Исплата (ден)": Math.round(freelancer.totalDays * freelancer.dailyRate),
    "Статус": freelancer.isPaid ? "Исплатено" : "Во чекање",
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(employeesData), "Редовно Вработени");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(freelancersData), "Хонорарци");

  XLSX.writeFile(
    workbook,
    `Izvestaj_Plati_${monthKey}.xlsx`
  );
};
