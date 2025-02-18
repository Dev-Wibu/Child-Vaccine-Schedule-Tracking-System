import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import Router và Routes
import App from "./App.jsx";
import "./index.css";
import Home from "./Home.jsx";
import LoginPage from "../pages/Login/LoginPage.jsx";
import Register from "../pages/Register/Register.jsx";
import ForgotPassword from "../pages/Login/ForgotPassword.jsx";
import TermsOfService from "../pages/Register/TermOfService.jsx";
import Policy from "../pages/Register/Policy.jsx";

import PaymentGateway from "../pages/Payment/Payment.jsx";
import PaymentGatewayOnline from "../pages/Payment/PaymentOnline.jsx";
import VaccineScheduling from "../pages/ReactionVaccine/BookSchedule.jsx";
import VaccinePage from "../pages/ReactionVaccine/ReactionVaccine.jsx";
import VaccinationSchedule from "../pages/ReactionVaccine/StatusSchedule.jsx";

// eslint-disable-next-line react-refresh/only-export-components
const Main = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<Policy />} />
        <Route path="/bookschedule-vaccine" element={<VaccineScheduling />} />
        <Route path="/payment" element={<PaymentGateway />} />
        <Route path="/payment-online" element={<PaymentGatewayOnline />} />
        <Route path="/vaccine-page" element={<VaccinePage />} />
        <Route path="/status-schedule" element={<VaccinationSchedule />} />
      </Routes>
    </Router>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Main />
  </StrictMode>
);
