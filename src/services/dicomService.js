// services/dicomService.js
import { api } from "./api";

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock DICOM data for demonstration
const mockDicomData = {
  studies: [
    {
      studyInstanceUID: "1.2.840.113619.2.62.994044785528.20040119.093058.1",
      studyDate: "20240115",
      studyTime: "103000",
      accessionNumber: "ACC001234",
      studyDescription: "CT Chest with Contrast",
      patientName: "SMITH^JOHN",
      patientID: "PT001234",
      modality: "CT",
      seriesCount: 2,
      instanceCount: 200,
    },
  ],
  series: [
    {
      seriesInstanceUID: "1.2.840.113619.2.62.994044785528.20040119.093058.1.1",
      seriesNumber: 1,
      modality: "CT",
      seriesDescription: "Chest Axial",
      instanceCount: 120,
      bodyPart: "CHEST",
    },
  ],
};

export const dicomService = {
  // Search for studies
  searchStudies: async (searchParams = {}) => {
    await delay(800);

    try {
      // In real implementation:
      // const response = await api.get('/dicom/studies', { params: searchParams });

      // Mock study search
      const {
        patientName,
        patientID,
        studyDate,
        accessionNumber,
        modality,
        limit = 50,
        offset = 0,
      } = searchParams;

      let filteredStudies = [...mockDicomData.studies];

      // Apply filters
      if (patientName) {
        filteredStudies = filteredStudies.filter((study) =>
          study.patientName.toLowerCase().includes(patientName.toLowerCase())
        );
      }

      if (patientID) {
        filteredStudies = filteredStudies.filter((study) =>
          study.patientID.includes(patientID)
        );
      }

      if (accessionNumber) {
        filteredStudies = filteredStudies.filter((study) =>
          study.accessionNumber.includes(accessionNumber)
        );
      }

      if (modality) {
        filteredStudies = filteredStudies.filter(
          (study) => study.modality === modality
        );
      }

      // Pagination
      const totalCount = filteredStudies.length;
      const paginatedStudies = filteredStudies.slice(offset, offset + limit);

      return {
        studies: paginatedStudies,
        totalCount,
        offset,
        limit,
      };
    } catch (error) {
      console.error("Study search failed:", error);
      throw error;
    }
  },

  // Get study details
  getStudy: async (studyInstanceUID) => {
    await delay(600);

    try {
      // In real implementation:
      // const response = await api.get(`/dicom/studies/${studyInstanceUID}`);

      // Mock study retrieval
      const study = mockDicomData.studies.find(
        (s) => s.studyInstanceUID === studyInstanceUID
      );

      if (!study) {
        throw new Error("Study not found");
      }

      return study;
    } catch (error) {
      console.error("Get study failed:", error);
      throw error;
    }
  },

  // Get series for a study
  getSeries: async (studyInstanceUID) => {
    await delay(500);

    try {
      // In real implementation:
      // const response = await api.get(`/dicom/studies/${studyInstanceUID}/series`);

      // Mock series retrieval
      const seriesList = mockDicomData.series.map((series, index) => ({
        ...series,
        studyInstanceUID,
        seriesInstanceUID: `${studyInstanceUID}.${index + 1}`,
        thumbnail: `/api/placeholder/64/64?text=Series+${series.seriesNumber}`,
      }));

      return seriesList;
    } catch (error) {
      console.error("Get series failed:", error);
      throw error;
    }
  },

  // Get instances for a series
  getInstances: async (studyInstanceUID, seriesInstanceUID) => {
    await delay(400);

    try {
      // In real implementation:
      // const response = await api.get(`/dicom/studies/${studyInstanceUID}/series/${seriesInstanceUID}/instances`);

      // Mock instances retrieval
      const series = mockDicomData.series.find(
        (s) => s.seriesInstanceUID === seriesInstanceUID
      );

      if (!series) {
        throw new Error("Series not found");
      }

      const instances = Array.from(
        { length: series.instanceCount },
        (_, index) => ({
          sopInstanceUID: `${seriesInstanceUID}.${index + 1}`,
          instanceNumber: index + 1,
          imageUrl: `/api/placeholder/512/512?text=Image+${index + 1}`,
          rows: 512,
          columns: 512,
          pixelSpacing: [0.5, 0.5],
          sliceThickness: 2.0,
          sliceLocation: index * 2.0,
          windowCenter: 40,
          windowWidth: 400,
        })
      );

      return instances;
    } catch (error) {
      console.error("Get instances failed:", error);
      throw error;
    }
  },

  // Load DICOM image
  loadImage: async (studyInstanceUID, seriesInstanceUID, sopInstanceUID) => {
    await delay(300);

    try {
      // In real implementation with Cornerstone.js:
      // const imageId = `wadouri:${baseUrl}/studies/${studyInstanceUID}/series/${seriesInstanceUID}/instances/${sopInstanceUID}`;
      // const image = await cornerstone.loadImage(imageId);

      // Mock image loading
      const mockImage = {
        imageId: `mock:${sopInstanceUID}`,
        minPixelValue: 0,
        maxPixelValue: 4095,
        slope: 1,
        intercept: -1024,
        windowCenter: 40,
        windowWidth: 400,
        rows: 512,
        columns: 512,
        height: 512,
        width: 512,
        color: false,
        columnPixelSpacing: 0.5,
        rowPixelSpacing: 0.5,
        sizeInBytes: 512 * 512 * 2,
      };

      return mockImage;
    } catch (error) {
      console.error("Load image failed:", error);
      throw error;
    }
  },

  // Get DICOM tags/metadata
  getMetadata: async (studyInstanceUID, seriesInstanceUID, sopInstanceUID) => {
    await delay(200);

    try {
      // In real implementation:
      // const response = await api.get(`/dicom/studies/${studyInstanceUID}/series/${seriesInstanceUID}/instances/${sopInstanceUID}/metadata`);

      // Mock metadata
      const metadata = {
        "00100010": { vr: "PN", Value: ["SMITH^JOHN"] }, // Patient Name
        "00100020": { vr: "LO", Value: ["PT001234"] }, // Patient ID
        "0020000D": { vr: "UI", Value: [studyInstanceUID] }, // Study Instance UID
        "0020000E": { vr: "UI", Value: [seriesInstanceUID] }, // Series Instance UID
        "00080018": { vr: "UI", Value: [sopInstanceUID] }, // SOP Instance UID
        "00080060": { vr: "CS", Value: ["CT"] }, // Modality
        "00200013": { vr: "IS", Value: ["1"] }, // Instance Number
        "00280010": { vr: "US", Value: [512] }, // Rows
        "00280011": { vr: "US", Value: [512] }, // Columns
        "00281030": { vr: "LO", Value: ["Chest CT"] }, // Study Description
        "00280030": { vr: "DS", Value: ["0.5", "0.5"] }, // Pixel Spacing
        "00180050": { vr: "DS", Value: ["2.0"] }, // Slice Thickness
        "00281050": { vr: "DS", Value: ["40"] }, // Window Center
        "00281051": { vr: "DS", Value: ["400"] }, // Window Width
      };

      return metadata;
    } catch (error) {
      console.error("Get metadata failed:", error);
      throw error;
    }
  },

  // Download DICOM file
  downloadDicom: async (
    studyInstanceUID,
    seriesInstanceUID,
    sopInstanceUID
  ) => {
    await delay(1000);

    try {
      // In real implementation:
      // const response = await api.get(`/dicom/studies/${studyInstanceUID}/series/${seriesInstanceUID}/instances/${sopInstanceUID}`, {
      //   responseType: 'blob'
      // });

      // Mock download - create a blob with some data
      const mockDicomData = new Uint8Array(1024 * 1024); // 1MB mock file
      const blob = new Blob([mockDicomData], { type: "application/dicom" });

      return blob;
    } catch (error) {
      console.error("Download DICOM failed:", error);
      throw error;
    }
  },

  // Upload DICOM file
  uploadDicom: async (file, onProgress) => {
    await delay(2000);

    try {
      // In real implementation:
      // const formData = new FormData();
      // formData.append('dicom', file);
      // const response = await api.post('/dicom/upload', formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' },
      //   onUploadProgress: (progressEvent) => {
      //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      //     onProgress?.(percentCompleted);
      //   }
      // });

      // Mock upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await delay(100);
        onProgress?.(progress);
      }

      const mockResult = {
        studyInstanceUID: "1.2.840.113619.2.62.994044785528.20040119.093058.2",
        message: "DICOM file uploaded successfully",
        instanceCount: 1,
      };

      return mockResult;
    } catch (error) {
      console.error("Upload DICOM failed:", error);
      throw error;
    }
  },

  // Delete DICOM study
  deleteStudy: async (studyInstanceUID) => {
    await delay(800);

    try {
      // In real implementation:
      // await api.delete(`/dicom/studies/${studyInstanceUID}`);

      // Mock deletion
      return { message: "Study deleted successfully" };
    } catch (error) {
      console.error("Delete study failed:", error);
      throw error;
    }
  },

  // Get DICOM server status
  getServerStatus: async () => {
    await delay(300);

    try {
      // In real implementation:
      // const response = await api.get('/dicom/status');

      // Mock server status
      return {
        status: "online",
        version: "1.0.0",
        studyCount: 1250,
        seriesCount: 4800,
        instanceCount: 125000,
        totalSize: "2.4TB",
        lastBackup: "2024-01-15T08:00:00Z",
      };
    } catch (error) {
      console.error("Get server status failed:", error);
      throw error;
    }
  },
};
