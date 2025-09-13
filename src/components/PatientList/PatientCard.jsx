import React from "react";
import { Calendar, Clock, User, AlertTriangle, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const PatientCard = ({ patient, onSelect, isSelected }) => {
  const {
    patientId,
    name,
    age,
    gender,
    studyDate,
    modality,
    bodyPart,
    status,
    priority,
    accessionNumber,
    studyDescription,
    seriesCount,
    imageCount,
  } = patient;

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "in-progress":
        return "status-in-progress";
      case "completed":
        return "status-completed";
      default:
        return "status-pending";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "urgent":
        return "priority-urgent";
      case "high":
        return "priority-high";
      case "normal":
        return "priority-normal";
      case "low":
        return "priority-low";
      default:
        return "priority-normal";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div
      className={`patient-card ${isSelected ? "selected" : ""}`}
      onClick={onSelect}
    >
      <div className="patient-card-header">
        <div className="patient-info">
          <div className="patient-name">
            <User size={16} />
            <span>{name}</span>
          </div>
          <div className="patient-details">
            <span className="patient-id">ID: {patientId}</span>
            <span className="patient-demographics">
              {age}Y, {gender}
            </span>
          </div>
        </div>

        <div className="patient-status">
          <div className={`status-badge ${getStatusClass(status)}`}>
            {status.replace("-", " ")}
          </div>
          {priority === "urgent" && (
            <div className={`priority-badge ${getPriorityClass(priority)}`}>
              <AlertTriangle size={12} />
              {priority}
            </div>
          )}
        </div>
      </div>

      <div className="patient-card-body">
        <div className="study-info">
          <div className="study-detail">
            <strong>Study:</strong>{" "}
            {studyDescription || `${modality} ${bodyPart}`}
          </div>
          <div className="study-detail">
            <strong>Modality:</strong> {modality}
          </div>
          <div className="study-detail">
            <strong>Body Part:</strong> {bodyPart}
          </div>
          <div className="study-detail">
            <strong>Accession:</strong> {accessionNumber}
          </div>
        </div>

        <div className="study-metrics">
          <div className="metric">
            <FileText size={14} />
            <span>{seriesCount} Series</span>
          </div>
          <div className="metric">
            <span>{imageCount} Images</span>
          </div>
        </div>
      </div>

      <div className="patient-card-footer">
        <div className="study-date">
          <Calendar size={14} />
          <span>{formatDate(studyDate)}</span>
        </div>

        <div className="action-hint">Click to view study</div>
      </div>
    </div>
  );
};

export default PatientCard;
