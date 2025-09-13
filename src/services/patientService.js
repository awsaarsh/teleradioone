// services/patientService.js
import { mockPatients } from "../data/mockData";

// Simulate API calls with mock data
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const patientService = {
  // Get all patients
  getAllPatients: async () => {
    await delay(500); // Simulate network delay
    return mockPatients;
  },

  // Get patient by ID
  getPatientById: async (patientId) => {
    await delay(300);
    const patient = mockPatients.find((p) => p.patientId === patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }

    // Add detailed series and image data for the viewer
    const patientWithImages = {
      ...patient,
      series: [
        {
          seriesId: "series-1",
          seriesNumber: 1,
          description: `${patient.modality} ${patient.bodyPart} - Axial`,
          imageCount: 120,
          thumbnail: "/api/placeholder/60/60",
          images: Array.from({ length: 120 }, (_, i) => ({
            instanceNumber: i + 1,
            imageUrl: `/api/placeholder/512/512?text=Slice+${i + 1}`,
            pixelSpacing: "0.5\\0.5",
            sliceThickness: "2.0",
          })),
        },
        {
          seriesId: "series-2",
          seriesNumber: 2,
          description: `${patient.modality} ${patient.bodyPart} - Sagittal`,
          imageCount: 80,
          thumbnail: "/api/placeholder/60/60",
          images: Array.from({ length: 80 }, (_, i) => ({
            instanceNumber: i + 1,
            imageUrl: `/api/placeholder/512/512?text=Sag+${i + 1}`,
            pixelSpacing: "0.5\\0.5",
            sliceThickness: "2.0",
          })),
        },
      ],
    };

    return patientWithImages;
  },

  // Update patient status
  updatePatientStatus: async (patientId, status) => {
    await delay(200);
    const patient = mockPatients.find((p) => p.patientId === patientId);
    if (patient) {
      patient.status = status;
      return patient;
    }
    throw new Error("Patient not found");
  },

  // Search patients
  searchPatients: async (searchTerm) => {
    await delay(300);
    const term = searchTerm.toLowerCase();
    return mockPatients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(term) ||
        patient.patientId.toLowerCase().includes(term) ||
        patient.accessionNumber.toLowerCase().includes(term)
    );
  },

  // Get patients by status
  getPatientsByStatus: async (status) => {
    await delay(300);
    return mockPatients.filter((patient) => patient.status === status);
  },

  // Get urgent patients
  getUrgentPatients: async () => {
    await delay(300);
    return mockPatients.filter((patient) => patient.priority === "urgent");
  },
};
