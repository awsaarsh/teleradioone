// services/exportService.js

export const exportService = {
  // Export canvas as image
  exportCanvasAsImage: (
    canvasElement,
    filename = "dicom-image",
    format = "png"
  ) => {
    try {
      if (!canvasElement) {
        throw new Error("Canvas element not found");
      }

      // Create download link
      const link = document.createElement("a");
      link.download = `${filename}.${format}`;

      // Convert canvas to blob and create URL
      canvasElement.toBlob(
        (blob) => {
          const url = URL.createObjectURL(blob);
          link.href = url;

          // Trigger download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up
          URL.revokeObjectURL(url);
        },
        `image/${format}`,
        0.95
      );

      return { success: true, message: "Image exported successfully" };
    } catch (error) {
      console.error("Export canvas error:", error);
      return { success: false, error: error.message };
    }
  },

  // Export study as ZIP
  exportStudyAsZip: async (studyData, patientInfo) => {
    try {
      // This would require a ZIP library like JSZip
      // For now, we'll export individual images
      console.log("Exporting study:", studyData);

      // Create a folder-like structure by prefixing filenames
      const folderName = `${patientInfo.name}_${patientInfo.patientId}_${
        new Date().toISOString().split("T")[0]
      }`;

      if (studyData.series && studyData.series.length > 0) {
        for (const series of studyData.series) {
          if (series.images && series.images.length > 0) {
            for (let i = 0; i < Math.min(series.images.length, 10); i++) {
              // Limit to first 10 images
              const image = series.images[i];
              const filename = `${folderName}_Series${
                series.seriesNumber
              }_Image${i + 1}`;

              // For demo purposes, we'll export placeholder images
              await exportService.exportImageFromUrl(image.imageUrl, filename);

              // Add small delay to prevent overwhelming the browser
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          }
        }
      }

      return { success: true, message: "Study exported successfully" };
    } catch (error) {
      console.error("Export study error:", error);
      return { success: false, error: error.message };
    }
  },

  // Export image from URL
  exportImageFromUrl: async (imageUrl, filename = "image") => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error("Export image from URL error:", error);
      return { success: false, error: error.message };
    }
  },

  // Export report as PDF (requires jsPDF library)
  exportReportAsPDF: (reportData, patientInfo) => {
    try {
      // Create PDF content
      const pdfContent = exportService.generateReportHTML(
        reportData,
        patientInfo
      );

      // For now, open in new window for printing/saving
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Radiology Report - ${patientInfo.name}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                line-height: 1.6;
              }
              .header { 
                border-bottom: 2px solid #333; 
                padding-bottom: 20px; 
                margin-bottom: 20px; 
              }
              .patient-info { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 20px; 
                margin-bottom: 30px; 
              }
              .section { 
                margin-bottom: 30px; 
              }
              .section h3 { 
                color: #333; 
                border-bottom: 1px solid #ddd; 
                padding-bottom: 5px; 
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${pdfContent}
            <div class="no-print" style="margin-top: 30px; text-align: center;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Print / Save as PDF</button>
              <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">Close</button>
            </div>
          </body>
          </html>
        `);
      printWindow.document.close();

      return { success: true, message: "Report opened for printing/export" };
    } catch (error) {
      console.error("Export PDF error:", error);
      return { success: false, error: error.message };
    }
  },

  // Generate HTML for report
  generateReportHTML: (reportData, patientInfo) => {
    const currentDate = new Date().toLocaleDateString();
    const studyDate = new Date(patientInfo.studyDate).toLocaleDateString();

    return `
        <div class="header">
          <h1>RADIOLOGY REPORT</h1>
          <p><strong>Report Date:</strong> ${currentDate}</p>
        </div>
        
        <div class="patient-info">
          <div>
            <h3>Patient Information</h3>
            <p><strong>Name:</strong> ${patientInfo.name}</p>
            <p><strong>Patient ID:</strong> ${patientInfo.patientId}</p>
            <p><strong>Age:</strong> ${patientInfo.age}</p>
            <p><strong>Gender:</strong> ${patientInfo.gender}</p>
          </div>
          <div>
            <h3>Study Information</h3>
            <p><strong>Study Date:</strong> ${studyDate}</p>
            <p><strong>Modality:</strong> ${patientInfo.modality}</p>
            <p><strong>Body Part:</strong> ${patientInfo.bodyPart}</p>
            <p><strong>Accession Number:</strong> ${
              patientInfo.accessionNumber
            }</p>
          </div>
        </div>
        
        ${
          reportData.clinicalHistory
            ? `
        <div class="section">
          <h3>Clinical History</h3>
          <p>${reportData.clinicalHistory}</p>
        </div>
        `
            : ""
        }
        
        ${
          reportData.technique
            ? `
        <div class="section">
          <h3>Technique</h3>
          <p>${reportData.technique}</p>
        </div>
        `
            : ""
        }
        
        <div class="section">
          <h3>Findings</h3>
          <div>${reportData.findings || "No findings documented."}</div>
        </div>
        
        <div class="section">
          <h3>Impression</h3>
          <div>${reportData.impression || "No impression documented."}</div>
        </div>
        
        ${
          reportData.recommendation
            ? `
        <div class="section">
          <h3>Recommendations</h3>
          <p>${reportData.recommendation}</p>
        </div>
        `
            : ""
        }
        
        <div class="section" style="margin-top: 50px;">
          <p><strong>Electronically signed by:</strong></p>
          <p>Dr. Current User, MD</p>
          <p>Date: ${currentDate}</p>
        </div>
      `;
  },

  // Export measurements/annotations
  exportMeasurements: (measurements, filename = "measurements") => {
    try {
      const csvContent = exportService.measurementsToCSV(measurements);
      const blob = new Blob([csvContent], { type: "text/csv" });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      return { success: true, message: "Measurements exported successfully" };
    } catch (error) {
      console.error("Export measurements error:", error);
      return { success: false, error: error.message };
    }
  },

  // Convert measurements to CSV
  measurementsToCSV: (measurements) => {
    const headers = ["Type", "Value", "Unit", "Image", "Coordinates", "Date"];
    const rows = measurements.map((m) => [
      m.type || "Unknown",
      m.value || "",
      m.unit || "px",
      m.imageIndex || "",
      `"${m.coordinates ? JSON.stringify(m.coordinates) : ""}"`,
      m.date || new Date().toISOString(),
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  },

  // Batch export utility
  batchExport: async (items, exportFunction, progressCallback) => {
    const results = [];
    const total = items.length;

    for (let i = 0; i < items.length; i++) {
      try {
        const result = await exportFunction(items[i]);
        results.push({ index: i, success: true, result });
      } catch (error) {
        results.push({ index: i, success: false, error: error.message });
      }

      if (progressCallback) {
        progressCallback(i + 1, total);
      }

      // Small delay to prevent overwhelming the browser
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    return results;
  },
};
