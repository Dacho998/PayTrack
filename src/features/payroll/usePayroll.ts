import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import type { Employee, Freelancer } from "../../types";
import {
  getMonthKey,
  getMonthLabel,
  isValidMonthKey,
  normalizeMonthSnapshot,
  type PayrollMonthSnapshot,
} from "../../payrollHistory";
import {
  getNextPayrollMonthKey,
  getWorkingDaysForMonthKey,
  getWorkingDaysInCurrentMonth,
  sanitizePayrollState,
} from "./utils";
import type { PayrollState } from "./types";

export function usePayroll(isAdmin: boolean) {
  const [payroll, setPayroll] = useState<PayrollState>(() => ({
    employees: [],
    freelancers: [],
    workingDays: getWorkingDaysInCurrentMonth(),
    activeMonthKey: getMonthKey(),
  }));
  const payrollRef = useRef(payroll);
  const [monthHistory, setMonthHistory] = useState<PayrollMonthSnapshot[]>([]);
  const monthHistoryRef = useRef(monthHistory);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { employees, freelancers, workingDays, activeMonthKey } = payroll;
  const isViewingHistoricalMonth = Boolean(
    isAdmin && selectedMonthKey && selectedMonthKey !== activeMonthKey
  );
  const visibleMonthSnapshot = isViewingHistoricalMonth
    ? monthHistory.find((snapshot) => snapshot.monthKey === selectedMonthKey) ?? null
    : null;
  const visibleEmployees = visibleMonthSnapshot?.employees ?? employees;
  const visibleFreelancers = visibleMonthSnapshot?.freelancers ?? freelancers;
  const visibleWorkingDays = visibleMonthSnapshot?.workingDays ?? workingDays;
  const visibleMonthKey = visibleMonthSnapshot?.monthKey ?? activeMonthKey;

  const saveDataToCloud = async (
    nextState: PayrollState,
    nextHistory: PayrollMonthSnapshot[]
  ) => {
    const sanitizedState = sanitizePayrollState(nextState);
    setSaveError(null);

    try {
      await setDoc(
        doc(db, "paytrack", "data"),
        {
          employees: sanitizedState.employees,
          freelancers: sanitizedState.freelancers,
          workingDays: sanitizedState.workingDays,
          activeMonthKey: sanitizedState.activeMonthKey,
          history: nextHistory,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Грешка при зачувување во Cloud:", error);
      setSaveError("Промените не беа зачувани. Обидете се повторно.");
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "paytrack", "data"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const nextState: PayrollState = {
          employees: data.employees || [],
          freelancers: data.freelancers || [],
          workingDays:
            Number.isFinite(data.workingDays) && data.workingDays > 0
              ? data.workingDays
              : getWorkingDaysInCurrentMonth(),
          activeMonthKey: isValidMonthKey(data.activeMonthKey)
            ? data.activeMonthKey
            : getMonthKey(),
        };
        const history = Array.isArray(data.history)
          ? data.history
              .map((entry: unknown) =>
                normalizeMonthSnapshot(entry as Partial<PayrollMonthSnapshot>)
              )
              .filter((entry): entry is PayrollMonthSnapshot => entry !== null)
          : [];
        const sanitizedState = sanitizePayrollState(nextState);

        payrollRef.current = sanitizedState;
        monthHistoryRef.current = history;
        setPayroll(sanitizedState);
        setMonthHistory(history);
      } else {
        const initialState = sanitizePayrollState({
          employees: [],
          freelancers: [],
          workingDays: getWorkingDaysInCurrentMonth(),
          activeMonthKey: getMonthKey(),
        });

        payrollRef.current = initialState;
        monthHistoryRef.current = [];
        setPayroll(initialState);
        setMonthHistory([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSetEmployees = (
    newEmployees: Employee[] | ((prev: Employee[]) => Employee[])
  ) => {
    if (isViewingHistoricalMonth) return;

    const prev = payrollRef.current;
    const employees =
      typeof newEmployees === "function" ? newEmployees(prev.employees) : newEmployees;
    const nextState = sanitizePayrollState({ ...prev, employees });
    payrollRef.current = nextState;
    setPayroll(nextState);
    void saveDataToCloud(nextState, monthHistoryRef.current);
  };

  const handleSetFreelancers = (
    newFreelancers: Freelancer[] | ((prev: Freelancer[]) => Freelancer[])
  ) => {
    if (isViewingHistoricalMonth) return;

    const prev = payrollRef.current;
    const freelancers =
      typeof newFreelancers === "function" ? newFreelancers(prev.freelancers) : newFreelancers;
    const nextState = sanitizePayrollState({ ...prev, freelancers });
    payrollRef.current = nextState;
    setPayroll(nextState);
    void saveDataToCloud(nextState, monthHistoryRef.current);
  };

  const handleResetMonth = () => {
    if (!isAdmin || isViewingHistoricalMonth) return;
    if (
      !window.confirm(
        `Ќе се архивира ${getMonthLabel(activeMonthKey)} и ќе започне нов период. Деновите и статусите ќе се ресетираат. Дали продолжуваме?`
      )
    ) {
      return;
    }

    const prev = payrollRef.current;
    const nextActiveMonthKey = getNextPayrollMonthKey(prev.activeMonthKey);
    const archivedSnapshot: PayrollMonthSnapshot = {
      monthKey: prev.activeMonthKey,
      employees: prev.employees.map((employee) => ({ ...employee })),
      freelancers: prev.freelancers.map((freelancer) => ({ ...freelancer })),
      workingDays: prev.workingDays,
    };
    const nextHistory = [
      archivedSnapshot,
      ...monthHistoryRef.current.filter(
        (entry) => entry.monthKey !== archivedSnapshot.monthKey
      ),
    ];
    const nextState = sanitizePayrollState({
      ...prev,
      employees: prev.employees.map((employee) => ({
        ...employee,
        plusDays: 0,
        note: employee.note ?? "",
      })),
      freelancers: prev.freelancers.map((freelancer) => ({
        ...freelancer,
        totalDays: 0,
        isPaid: false,
        note: freelancer.note ?? "",
      })),
      workingDays: getWorkingDaysForMonthKey(nextActiveMonthKey),
      activeMonthKey: nextActiveMonthKey,
    });

    payrollRef.current = nextState;
    monthHistoryRef.current = nextHistory;
    setPayroll(nextState);
    setMonthHistory(nextHistory);
    setSelectedMonthKey(null);
    void saveDataToCloud(nextState, nextHistory);

    window.alert(`${getMonthLabel(nextActiveMonthKey)} започнува со ${nextState.workingDays} работни денови.`);
  };

  return {
    activeMonthKey,
    employees,
    freelancers,
    workingDays,
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
  };
}
