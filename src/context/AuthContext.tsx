import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface AuthContextType {
  isAdmin: boolean;
  loginAsAdmin: () => void;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_PIN = "0508998";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const loginAsAdmin = () => {
    setPinInput("");
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAdmin(true);
      setIsModalOpen(false);
      setErrorMessage("");
    } else {
      setErrorMessage("Неточен ПИН код! Обидете се повторно.");
      setPinInput("");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPinInput("");
    setErrorMessage("");
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loginAsAdmin, logoutAdmin }}>
      {children}

      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ margin: "0 0 12px 0", color: "#1e293b", fontSize: "1.2rem" }}>
              🔐 Админ Најава
            </h3>
            <p style={{ margin: "0 0 16px 0", fontSize: "0.9rem", color: "#64748b" }}>
              Внесете го вашиот АДМИН ПИН код за пристап:
            </p>

            <form onSubmit={handleModalSubmit}>
              <input
                type="password"
                placeholder="Внеси ПИН..."
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                autoFocus
                style={inputStyle}
              />

              {errorMessage && (
                <div style={errorStyle}>
                  ⚠️ {errorMessage}
                </div>
              )}

              <div style={buttonContainerStyle}>
                <button type="button" onClick={closeModal} style={btnCancelStyle}>
                  Откажи
                </button>
                <button type="submit" style={btnSubmitStyle}>
                  Потврди
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth мора да се користи внатре во AuthProvider");
  }
  return context;
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(15, 23, 42, 0.65)",
  backdropFilter: "blur(4px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalBoxStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "24px",
  borderRadius: "12px",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  width: "90%",
  maxWidth: "360px",
  textAlign: "left",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: "1rem",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  outline: "none",
  boxSizing: "border-box",
  textAlign: "center",
  letterSpacing: "4px",
};

const errorStyle: React.CSSProperties = {
  marginTop: "10px",
  color: "#ef4444",
  fontSize: "0.85rem",
  fontWeight: "500",
  textAlign: "center",
};

const buttonContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "20px",
};

const btnCancelStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  backgroundColor: "#f8fafc",
  color: "#475569",
  cursor: "pointer",
  fontWeight: "600",
};

const btnSubmitStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#4f46e5",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: "600",
};