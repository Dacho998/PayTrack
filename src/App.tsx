import { useAuth } from "./context/AuthContext";
import { PayrollDashboard } from "./features/payroll/PayrollDashboard";
import { usePayroll } from "./features/payroll/usePayroll";

export default function App() {
  const { isAdmin, loginAsAdmin, logoutAdmin } = useAuth();
  const payroll = usePayroll(isAdmin);

  const handleAdminToggle = () => {
    if (isAdmin) {
      payroll.setSelectedMonthKey(null);
      logoutAdmin();
      return;
    }

    loginAsAdmin();
  };

  return (
    <PayrollDashboard
      {...payroll}
      isAdmin={isAdmin}
      onAdminToggle={handleAdminToggle}
    />
  );
}
