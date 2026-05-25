import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/admin/Users";
import Logs from "./pages/admin/Logs";
import Override from "./pages/admin/Override";
import ProtectedRoute from "./components/ProtectedRoute";
import ApiKeys from "./pages/ApiKeys";
import Plans from "./pages/Plans";
import PaymentSuccess from "./pages/PaymentSuccess";
import Landing from "./pages/Landing";
import Suspicious from "./pages/admin/Suspicious";
import MyLogs from "./pages/MyLogs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plans"
          element={
            <ProtectedRoute>
              <Plans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-logs"
          element={
            <ProtectedRoute>
              <MyLogs />
            </ProtectedRoute>
          }
        />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route
          path="/api-keys"
          element={
            <ProtectedRoute>
              <ApiKeys />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly={true}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/logs"
          element={
            <ProtectedRoute adminOnly={true}>
              <Logs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/suspicious"
          element={
            <ProtectedRoute adminOnly={true}>
              <Suspicious />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/override"
          element={
            <ProtectedRoute adminOnly={true}>
              <Override />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
