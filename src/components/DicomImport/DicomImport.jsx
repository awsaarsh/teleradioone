// components/DicomImport/DicomImport.jsx - Fixed Alignment & Local Import
import React, { useState, useRef } from "react";
import {
  Upload,
  File,
  X,
  Check,
  AlertCircle,
  FolderOpen,
  Image,
} from "lucide-react";

const DicomImport = ({ onFileProcessed, onClose }) => {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState([]);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Handle file selection from local machine
  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);

    // Accept all file types for testing (you can filter later)
    const validFiles = fileArray.filter((file) => {
      // Accept DICOM files and common image formats for testing
      const validExtensions = [
        ".dcm",
        ".dicom",
        ".jpg",
        ".jpeg",
        ".png",
        ".bmp",
        ".tiff",
      ];
      const hasValidExtension = validExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );
      const isDicomMime = file.type === "application/dicom";
      const isImageMime = file.type.startsWith("image/");

      return hasValidExtension || isDicomMime || isImageMime || file.size > 512; // Accept files > 512 bytes
    });

    if (validFiles.length === 0) {
      alert(
        "Please select valid DICOM files (.dcm, .dicom) or image files for testing"
      );
      return;
    }

    setFiles((prev) => [...prev, ...validFiles]);
    console.log("Selected files:", validFiles);
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  // Process files from local machine
  const processDicomFiles = async () => {
    if (files.length === 0) {
      alert("Please select files first");
      return;
    }

    setProcessing(true);
    const processedFiles = [];
    const errorFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        console.log(`Processing file ${i + 1}/${files.length}:`, file.name);

        // Create patient data from the file
        const patientData = await createPatientFromFile(file);
        processedFiles.push(patientData);

        console.log("Successfully processed:", file.name);
      } catch (error) {
        console.error("Error processing file:", file.name, error);
        errorFiles.push({ file, error: error.message });
      }
    }

    setProcessed(processedFiles);
    setErrors(errorFiles);
    setProcessing(false);

    // Notify parent component
    if (processedFiles.length > 0) {
      onFileProcessed(processedFiles);
    }
  };

  // Create patient data from uploaded file
  const createPatientFromFile = async (file) => {
    return new Promise((resolve, reject) => {
      try {
        // Create object URL for image display
        const imageUrl = URL.createObjectURL(file);

        // Generate patient data
        const timestamp = Date.now();
        const patientData = {
          fileName: file.name,
          fileSize: file.size,
          patientId: `PT${timestamp.toString().slice(-6)}`,
          patientName: extractPatientNameFromFile(file.name),
          age: Math.floor(Math.random() * 60) + 20,
          gender: Math.random() > 0.5 ? "M" : "F",
          studyDate: new Date().toISOString(),
          modality: detectModalityFromFilename(file.name),
          bodyPart: detectBodyPartFromFilename(file.name),
          studyDescription: `${detectModalityFromFilename(file.name)} Study - ${
            file.name
          }`,
          seriesDescription: `Imported ${detectModalityFromFilename(
            file.name
          )} Series`,
          accessionNumber: `ACC${timestamp.toString().slice(-8)}`,
          studyInstanceUID: generateUID(),
          seriesInstanceUID: generateUID(),
          sopInstanceUID: generateUID(),
          imageUrl: imageUrl,
          priority: "normal",
          status: "pending",
          referringPhysician: "Dr. Import",
          // Add series data for viewer
          series: [
            {
              seriesId: `series-${timestamp}`,
              seriesNumber: 1,
              description: `${detectModalityFromFilename(file.name)} - ${
                file.name
              }`,
              imageCount: 1,
              thumbnail: imageUrl,
              images: [
                {
                  instanceNumber: 1,
                  imageUrl: imageUrl,
                  pixelSpacing: "0.5\\0.5",
                  sliceThickness: "2.0",
                  windowCenter:
                    detectModalityFromFilename(file.name) === "CT" ? 40 : 128,
                  windowWidth:
                    detectModalityFromFilename(file.name) === "CT" ? 400 : 256,
                },
              ],
            },
          ],
        };

        // Simulate processing delay
        setTimeout(() => resolve(patientData), 500);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Helper functions
  const extractPatientNameFromFile = (filename) => {
    const baseName = filename.split(".")[0];
    const cleanName = baseName.replace(/[_-]/g, " ").replace(/\d+/g, "").trim();
    return cleanName || "Patient Import";
  };

  const detectModalityFromFilename = (filename) => {
    const name = filename.toLowerCase();
    if (name.includes("ct")) return "CT";
    if (name.includes("mr") || name.includes("mri")) return "MRI";
    if (name.includes("us") || name.includes("ultrasound")) return "US";
    if (name.includes("xr") || name.includes("xray") || name.includes("x-ray"))
      return "XR";
    if (name.includes("cr")) return "CR";
    if (name.includes("dx")) return "DX";
    if (name.includes("jpg") || name.includes("jpeg") || name.includes("png"))
      return "SC"; // Secondary Capture
    return "CT"; // Default
  };

  const detectBodyPartFromFilename = (filename) => {
    const name = filename.toLowerCase();
    if (name.includes("chest") || name.includes("thorax")) return "CHEST";
    if (
      name.includes("head") ||
      name.includes("brain") ||
      name.includes("skull")
    )
      return "HEAD";
    if (name.includes("abdomen") || name.includes("abdo")) return "ABDOMEN";
    if (name.includes("pelvis")) return "PELVIS";
    if (name.includes("spine") || name.includes("back")) return "SPINE";
    if (
      name.includes("arm") ||
      name.includes("leg") ||
      name.includes("hand") ||
      name.includes("foot")
    )
      return "EXTREMITY";
    return "CHEST"; // Default
  };

  const generateUID = () => {
    return `1.2.840.113619.2.62.${Date.now()}.${Math.floor(
      Math.random() * 1000000
    )}`;
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
    setProcessed([]);
    setErrors([]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="dicom-import-overlay">
      <div className="dicom-import-container">
        {/* Header */}
        <div className="import-header">
          <h2>Import Files</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="import-body">
          {/* Drop Zone */}
          <div
            className={`file-drop-zone ${dragOver ? "dragover" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="drop-content">
              <Upload size={40} />
              <h3>Drop files here</h3>
              <p>or</p>
              <button className="browse-btn" onClick={handleFileInputClick}>
                <FolderOpen size={18} />
                Browse Files
              </button>
              <p className="file-types">
                Supports: .dcm, .dicom, .jpg, .png, .bmp (for testing)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".dcm,.dicom,.jpg,.jpeg,.png,.bmp,.tiff,image/*,application/dicom"
              onChange={(e) => handleFileSelect(e.target.files)}
              style={{ display: "none" }}
            />
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="selected-files">
              <div className="files-header">
                <h4>Selected Files ({files.length})</h4>
                <button className="clear-all-btn" onClick={clearAll}>
                  Clear All
                </button>
              </div>

              <div className="files-list">
                {files.map((file, index) => (
                  <div key={index} className="file-row">
                    <div className="file-icon">
                      {file.type.startsWith("image/") ? (
                        <Image size={16} />
                      ) : (
                        <File size={16} />
                      )}
                    </div>
                    <div className="file-details">
                      <div className="file-name">{file.name}</div>
                      <div className="file-meta">
                        {formatFileSize(file.size)} •{" "}
                        {file.type || "Unknown type"}
                      </div>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => removeFile(index)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing Results */}
          {processed.length > 0 && (
            <div className="processing-results success">
              <h4>✅ Successfully Processed ({processed.length})</h4>
              {processed.map((item, index) => (
                <div key={index} className="result-item">
                  <Check size={16} />
                  <span>
                    {item.patientName} - {item.modality} {item.bodyPart}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="processing-results error">
              <h4>❌ Processing Errors ({errors.length})</h4>
              {errors.map((error, index) => (
                <div key={index} className="result-item">
                  <AlertCircle size={16} />
                  <span>
                    {error.file.name}: {error.error}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="import-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="process-btn"
            onClick={processDicomFiles}
            disabled={files.length === 0 || processing}
          >
            {processing
              ? "Processing..."
              : `Import ${files.length} File${files.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DicomImport;
