import React, { useState, useEffect } from "react";
import { Save, Send, Eye, Mic, FileText, Clock } from "lucide-react";
import "./ReportPanel.css";

const ReportPanel = ({ patient, reportData, onSave }) => {
  const [report, setReport] = useState({
    findings: "",
    impression: "",
    recommendation: "",
    ...reportData,
  });
  const [isRecording, setIsRecording] = useState(false);
  const [reportStatus, setReportStatus] = useState("draft"); // draft, preliminary, final
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  useEffect(() => {
    // Load common report templates
    setTemplates([
      {
        id: "chest_ct",
        name: "Chest CT",
        content: "TECHNIQUE:\nCONTRAST:\nFINDINGS:\nIMPRESSION:",
      },
      {
        id: "brain_mri",
        name: "Brain MRI",
        content: "CLINICAL INDICATION:\nTECHNIQUE:\nFINDINGS:\nIMPRESSION:",
      },
      {
        id: "abdominal_ct",
        name: "Abdominal CT",
        content: "TECHNIQUE:\nCONTRAST:\nFINDINGS:\nIMPRESSION:",
      },
      {
        id: "normal_study",
        name: "Normal Study",
        content:
          "FINDINGS:\nNo acute abnormalities identified.\n\nIMPRESSION:\nNormal study.",
      },
    ]);
  }, []);

  const handleInputChange = (field, value) => {
    setReport((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave({
      ...report,
      status: reportStatus,
      timestamp: new Date().toISOString(),
      radiologist: "Dr. Current User", // This would come from auth context
    });
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setReport((prev) => ({
        ...prev,
        findings: template.content,
      }));
    }
    setSelectedTemplate(templateId);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Implement speech-to-text functionality here
  };

  const handleStatusChange = (status) => {
    setReportStatus(status);
  };

  return (
    <div className="report-panel">
      <div className="report-header">
        <div className="report-title">
          <FileText size={20} />
          <h3>Radiology Report</h3>
        </div>

        <div className="report-actions">
          <div className="status-selector">
            <select
              value={reportStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="preliminary">Preliminary</option>
              <option value="final">Final</option>
            </select>
          </div>

          <button className="voice-button" onClick={toggleRecording}>
            <Mic size={16} className={isRecording ? "recording" : ""} />
            {isRecording ? "Stop" : "Voice"}
          </button>

          <button className="save-button" onClick={handleSave}>
            <Save size={16} />
            Save
          </button>

          <button className="send-button">
            <Send size={16} />
            Submit
          </button>
        </div>
      </div>

      <div className="patient-info-summary">
        <div className="info-row">
          <span className="label">Patient:</span>
          <span>
            {patient?.name} ({patient?.age}Y, {patient?.gender})
          </span>
        </div>
        <div className="info-row">
          <span className="label">Study:</span>
          <span>
            {patient?.modality} {patient?.bodyPart}
          </span>
        </div>
        <div className="info-row">
          <span className="label">Date:</span>
          <span>{new Date(patient?.studyDate).toLocaleDateString()}</span>
        </div>
        <div className="info-row">
          <span className="label">Accession:</span>
          <span>{patient?.accessionNumber}</span>
        </div>
      </div>

      <div className="template-selector">
        <label>Quick Templates:</label>
        <select
          value={selectedTemplate}
          onChange={(e) => handleTemplateSelect(e.target.value)}
        >
          <option value="">Select a template...</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      <div className="report-content">
        <div className="report-section">
          <label htmlFor="clinical-history">
            Clinical History / Indication:
          </label>
          <textarea
            id="clinical-history"
            placeholder="Enter clinical history and indication for the study..."
            value={report.clinicalHistory || ""}
            onChange={(e) =>
              handleInputChange("clinicalHistory", e.target.value)
            }
            rows="2"
          />
        </div>

        <div className="report-section">
          <label htmlFor="technique">Technique:</label>
          <textarea
            id="technique"
            placeholder="Describe imaging technique, contrast use, etc..."
            value={report.technique || ""}
            onChange={(e) => handleInputChange("technique", e.target.value)}
            rows="2"
          />
        </div>

        <div className="report-section">
          <label htmlFor="findings">Findings:</label>
          <textarea
            id="findings"
            placeholder="Describe detailed findings..."
            value={report.findings}
            onChange={(e) => handleInputChange("findings", e.target.value)}
            rows="8"
            className="main-textarea"
          />
        </div>

        <div className="report-section">
          <label htmlFor="impression">Impression:</label>
          <textarea
            id="impression"
            placeholder="Summarize key findings and diagnosis..."
            value={report.impression}
            onChange={(e) => handleInputChange("impression", e.target.value)}
            rows="4"
            className="main-textarea"
          />
        </div>

        <div className="report-section">
          <label htmlFor="recommendation">Recommendation:</label>
          <textarea
            id="recommendation"
            placeholder="Clinical recommendations and follow-up..."
            value={report.recommendation}
            onChange={(e) =>
              handleInputChange("recommendation", e.target.value)
            }
            rows="3"
          />
        </div>
      </div>

      <div className="report-footer">
        <div className="report-metadata">
          <div className="metadata-item">
            <Clock size={14} />
            <span>Last saved: {new Date().toLocaleString()}</span>
          </div>
          <div className="metadata-item">
            <span>Status: {reportStatus}</span>
          </div>
        </div>

        <div className="report-signatures">
          <div className="signature-section">
            <label>Radiologist:</label>
            <input
              type="text"
              placeholder="Dr. [Name]"
              readOnly
              value="Dr. Current User"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPanel;
