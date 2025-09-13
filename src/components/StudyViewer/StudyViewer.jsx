// components/StudyViewer/StudyViewer.jsx (Updated with Export)
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DicomViewer from "./DicomViewer";
import ReportPanel from "../ReportPanel/ReportPanel";
import LoadingSpinner from "../Common/LoadingSpinner";
import { patientService } from "../../services/patientService";
import { exportService } from "../../services/exportService";
import {
  ArrowLeft,
  Eye,
  FileText,
  Settings,
  Download,
  Image,
  FileDown,
  Printer,
} from "lucide-react";
import "./StudyViewer.css";

const StudyViewer = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("viewer"); // 'viewer', 'report', 'split'
  const [reportData, setReportData] = useState({
    findings: "",
    impression: "",
    recommendation: "",
  });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const data = await patientService.getPatientById(patientId);
      setPatient(data);

      // Select first series by default
      if (data.series && data.series.length > 0) {
        setSelectedSeries(data.series[0]);
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeriesSelect = (series) => {
    setSelectedSeries(series);
    setSelectedImage(0); // Reset to first image
  };

  const handleImageSelect = (imageIndex) => {
    setSelectedImage(imageIndex);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleReportSave = (report) => {
    setReportData(report);
    console.log("Saving report:", report);
  };

  // Export Functions
  const handleExportCurrentImage = async () => {
    try {
      setExportLoading(true);
      const canvas = document.querySelector(".dicom-canvas");

      if (!canvas) {
        alert("No image to export");
        return;
      }

      const filename = `${patient.name}_${patient.patientId}_Series${
        selectedSeries?.seriesNumber
      }_Image${selectedImage + 1}`;
      const result = exportService.exportCanvasAsImage(canvas, filename, "png");

      if (result.success) {
        alert("Image exported successfully!");
      } else {
        alert("Export failed: " + result.error);
      }
    } catch (error) {
      console.error("Export current image error:", error);
      alert("Export failed: " + error.message);
    } finally {
      setExportLoading(false);
      setShowExportMenu(false);
    }
  };

  const handleExportSeries = async () => {
    try {
      setExportLoading(true);

      if (!selectedSeries || !selectedSeries.images) {
        alert("No series to export");
        return;
      }

      const folderName = `${patient.name}_${patient.patientId}_Series${selectedSeries.seriesNumber}`;

      // Export first 10 images to avoid overwhelming the browser
      const imagesToExport = selectedSeries.images.slice(0, 10);

      for (let i = 0; i < imagesToExport.length; i++) {
        const image = imagesToExport[i];
        const filename = `${folderName}_Image${i + 1}`;

        await exportService.exportImageFromUrl(image.imageUrl, filename);

        // Small delay between exports
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      alert(`Exported ${imagesToExport.length} images from the series!`);
    } catch (error) {
      console.error("Export series error:", error);
      alert("Series export failed: " + error.message);
    } finally {
      setExportLoading(false);
      setShowExportMenu(false);
    }
  };

  const handleExportStudy = async () => {
    try {
      setExportLoading(true);

      const result = await exportService.exportStudyAsZip(patient, patient);

      if (result.success) {
        alert("Study export completed!");
      } else {
        alert("Study export failed: " + result.error);
      }
    } catch (error) {
      console.error("Export study error:", error);
      alert("Study export failed: " + error.message);
    } finally {
      setExportLoading(false);
      setShowExportMenu(false);
    }
  };

  const handleExportReport = () => {
    try {
      setExportLoading(true);

      const result = exportService.exportReportAsPDF(reportData, patient);

      if (result.success) {
        // Report is opened in new window for printing/saving
      } else {
        alert("Report export failed: " + result.error);
      }
    } catch (error) {
      console.error("Export report error:", error);
      alert("Report export failed: " + error.message);
    } finally {
      setExportLoading(false);
      setShowExportMenu(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!patient) {
    return (
      <div className="study-viewer-error">
        <h2>Patient not found</h2>
        <button onClick={handleBackToDashboard}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="study-viewer">
      <div className="study-viewer-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBackToDashboard}>
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="patient-header-info">
            <h2>{patient.name}</h2>
            <div className="patient-meta">
              <span>ID: {patient.patientId}</span>
              <span>
                {patient.age}Y, {patient.gender}
              </span>
              <span>
                {patient.modality} - {patient.bodyPart}
              </span>
              <span>Acc: {patient.accessionNumber}</span>
            </div>
          </div>
        </div>

        <div className="header-controls">
          <div className="view-mode-toggle">
            <button
              className={viewMode === "viewer" ? "active" : ""}
              onClick={() => setViewMode("viewer")}
            >
              <Eye size={16} />
              Viewer
            </button>
            <button
              className={viewMode === "report" ? "active" : ""}
              onClick={() => setViewMode("report")}
            >
              <FileText size={16} />
              Report
            </button>
            <button
              className={viewMode === "split" ? "active" : ""}
              onClick={() => setViewMode("split")}
            >
              <Settings size={16} />
              Split View
            </button>
          </div>

          <div className="export-dropdown">
            <button
              className="export-button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exportLoading}
            >
              <Download size={16} />
              {exportLoading ? "Exporting..." : "Export"}
            </button>

            {showExportMenu && (
              <div className="export-menu">
                <button
                  onClick={handleExportCurrentImage}
                  className="export-menu-item"
                >
                  <Image size={16} />
                  Export Current Image
                </button>
                <button
                  onClick={handleExportSeries}
                  className="export-menu-item"
                >
                  <FileDown size={16} />
                  Export Current Series
                </button>
                <button
                  onClick={handleExportStudy}
                  className="export-menu-item"
                >
                  <FileDown size={16} />
                  Export Entire Study
                </button>
                <hr className="export-menu-separator" />
                <button
                  onClick={handleExportReport}
                  className="export-menu-item"
                >
                  <Printer size={16} />
                  Export Report (PDF)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="study-viewer-content">
        <div className="series-panel">
          <h3>Series ({patient.series?.length || 0})</h3>
          <div className="series-list">
            {patient.series?.map((series, index) => (
              <div
                key={series.seriesId}
                className={`series-item ${
                  selectedSeries?.seriesId === series.seriesId ? "active" : ""
                }`}
                onClick={() => handleSeriesSelect(series)}
              >
                <div className="series-thumbnail">
                  <img
                    src={series.thumbnail || "/api/placeholder/60/60"}
                    alt={`Series ${series.seriesNumber}`}
                  />
                </div>
                <div className="series-info">
                  <div className="series-title">
                    Series {series.seriesNumber}
                  </div>
                  <div className="series-description">{series.description}</div>
                  <div className="series-details">
                    {series.imageCount} images
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`main-content ${viewMode}`}>
          {(viewMode === "viewer" || viewMode === "split") && (
            <div className="viewer-panel">
              <DicomViewer
                series={selectedSeries}
                selectedImage={selectedImage}
                onImageSelect={handleImageSelect}
                patient={patient}
              />
            </div>
          )}

          {(viewMode === "report" || viewMode === "split") && (
            <div className="report-panel">
              <ReportPanel
                patient={patient}
                reportData={reportData}
                onSave={handleReportSave}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyViewer;
