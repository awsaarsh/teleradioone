// components/PatientList/PatientList.jsx - Fixed Status & Priority Alignment
import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronUp,
  ChevronDown,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  Clock,
  Circle,
} from "lucide-react";
import "./PatientList.css";

const PatientList = ({ patients, onPatientSelect, selectedPatient }) => {
  const [sortBy, setSortBy] = useState("studyDate");
  const [sortOrder, setSortOrder] = useState("desc");

  // Handle sorting
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Sort patients
  const sortedPatients = [...patients].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle date sorting
    if (sortBy === "studyDate") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    // Handle string sorting
    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Unknown";
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "#d97706",
        bg: "#fef3c7",
        text: "Pending",
        border: "#f59e0b",
      },
      "in-progress": {
        color: "#2563eb",
        bg: "#dbeafe",
        text: "In Progress",
        border: "#3b82f6",
      },
      completed: {
        color: "#059669",
        bg: "#d1fae5",
        text: "Completed",
        border: "#10b981",
      },
      cancelled: {
        color: "#dc2626",
        bg: "#fee2e2",
        text: "Cancelled",
        border: "#ef4444",
      },
    };

    const config = statusConfig[status] || statusConfig["pending"];

    return (
      <span
        className="status-badge"
        style={{
          backgroundColor: config.bg,
          color: config.color,
          borderColor: config.border,
        }}
      >
        {config.text}
      </span>
    );
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "urgent":
        return (
          <AlertTriangle
            size={14}
            className="priority-urgent"
            title="Urgent Priority"
          />
        );
      case "high":
        return (
          <Clock size={14} className="priority-high" title="High Priority" />
        );
      case "normal":
        return (
          <Circle
            size={12}
            className="priority-normal"
            title="Normal Priority"
          />
        );
      case "low":
        return (
          <Circle size={10} className="priority-low" title="Low Priority" />
        );
      default:
        return null;
    }
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) {
      return <span className="sort-icon inactive">⇅</span>;
    }
    return sortOrder === "asc" ? (
      <ChevronUp size={16} className="sort-icon active" />
    ) : (
      <ChevronDown size={16} className="sort-icon active" />
    );
  };

  if (patients.length === 0) {
    return (
      <div className="patient-list-empty">
        <FileText size={48} />
        <h3>No patients found</h3>
        <p>Try adjusting your search criteria or import some DICOM files.</p>
      </div>
    );
  }

  return (
    <div className="patient-table-container">
      <div className="patient-table-header">
        <h2>Patient Studies ({patients.length})</h2>
      </div>

      <div className="patient-table-wrapper">
        <table className="patient-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort("name")}>
                <div className="th-content">
                  <User size={16} />
                  Patient
                  <SortIcon column="name" />
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort("patientId")}>
                <div className="th-content">
                  Patient ID
                  <SortIcon column="patientId" />
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort("studyDate")}>
                <div className="th-content">
                  <Calendar size={16} />
                  Study Date
                  <SortIcon column="studyDate" />
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort("modality")}>
                <div className="th-content">
                  Modality
                  <SortIcon column="modality" />
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort("bodyPart")}>
                <div className="th-content">
                  Body Part
                  <SortIcon column="bodyPart" />
                </div>
              </th>
              <th>Study Description</th>
              <th className="sortable" onClick={() => handleSort("status")}>
                <div className="th-content">
                  Status
                  <SortIcon column="status" />
                </div>
              </th>
              <th>Images</th>
              <th>Physician</th>
            </tr>
          </thead>
          <tbody>
            {sortedPatients.map((patient) => (
              <tr
                key={patient.patientId}
                className={`patient-row ${
                  selectedPatient?.patientId === patient.patientId
                    ? "selected"
                    : ""
                }`}
                onClick={() => onPatientSelect(patient)}
              >
                <td className="patient-name-cell">
                  <div className="patient-info">
                    <div className="name-priority">
                      <span className="patient-name">{patient.name}</span>
                      {getPriorityIcon(patient.priority)}
                    </div>
                    <div className="patient-demographics">
                      {patient.age}Y, {patient.gender}
                    </div>
                  </div>
                </td>
                <td className="patient-id-cell">
                  <span className="patient-id">{patient.patientId}</span>
                </td>
                <td className="study-date-cell">
                  <div className="date-info">
                    <span className="date-relative">
                      {formatDate(patient.studyDate)}
                    </span>
                    <span className="date-absolute">
                      {new Date(patient.studyDate).toLocaleDateString()}
                    </span>
                  </div>
                </td>
                <td className="modality-cell">
                  <span className="modality-badge">{patient.modality}</span>
                </td>
                <td className="body-part-cell">{patient.bodyPart}</td>
                <td className="study-description-cell">
                  <span
                    className="study-description"
                    title={patient.studyDescription}
                  >
                    {patient.studyDescription}
                  </span>
                </td>
                <td className="status-cell">
                  {getStatusBadge(patient.status)}
                </td>
                <td className="images-cell">
                  <div className="image-count">
                    <span className="series-count">
                      {patient.seriesCount} series
                    </span>
                    <span className="image-count-number">
                      {patient.imageCount} images
                    </span>
                  </div>
                </td>
                <td className="physician-cell">
                  {patient.referringPhysician || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientList;
