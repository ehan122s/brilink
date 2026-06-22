import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { TransactionsPage } from "./pages/transactions/TransactionsPage";
import { ReportsPage } from "./pages/reports/ReportsPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { CashflowPage } from "./pages/cashflow/CashflowPage";
import { ExpensesPage } from "./pages/expenses/ExpensesPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/cashflow" element={<CashflowPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/activity" element={<Navigate to="/cashflow" replace />} />
        <Route path="/customers" element={<Navigate to="/expenses" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
