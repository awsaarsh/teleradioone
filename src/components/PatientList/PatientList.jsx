import React from "react";
import PatientCard from "./PatientCard";
import "./PatientList.css";

const PatientList = ({ patients, onPatientSelect, selectedPatient }) => {
  if (patients.length === 0) {
    return (
      <div className="patient-list-empty">
        <h3>No patients found</h3>
        <p>Try adjusting your search criteria or filters.</p>
      </div>
    );
  }

  return (
    <div className="patient-list">
      <div className="patient-list-header">
        <h2>Patient Studies ({patients.length})</h2>
      </div>

      <div className="patient-cards-container">
        {patients.map((patient) => (
          <PatientCard
            key={patient.patientId}
            patient={patient}
            onSelect={() => onPatientSelect(patient)}
            isSelected={selectedPatient?.patientId === patient.patientId}
          />
        ))}
      </div>
    </div>
  );
};

export default PatientList;
