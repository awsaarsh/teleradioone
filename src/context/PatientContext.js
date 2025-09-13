// src/context/PatientContext.js - Add this to the same file for simplicity
import { createContext, useContext, useState } from "react";

const PatientContext = createContext();

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error("usePatient must be used within a PatientProvider");
  }
  return context;
};

export const PatientProvider = ({ children }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentStudy, setCurrentStudy] = useState(null);

  const value = {
    selectedPatient,
    setSelectedPatient,
    currentStudy,
    setCurrentStudy,
  };

  return (
    <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
  );
};
