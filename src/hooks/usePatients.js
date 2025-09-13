// hooks/usePatients.js
import { useState, useEffect, useCallback } from "react";
import { patientService } from "../services/patientService";

export const usePatients = (initialFilters = {}) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Fetch patients with current filters
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await patientService.getAllPatients();

      // Apply client-side filtering (in real app, this would be server-side)
      let filteredData = data;

      if (filters.searchTerm) {
        filteredData = filteredData.filter(
          (patient) =>
            patient.name
              .toLowerCase()
              .includes(filters.searchTerm.toLowerCase()) ||
            patient.patientId
              .toLowerCase()
              .includes(filters.searchTerm.toLowerCase()) ||
            patient.accessionNumber
              .toLowerCase()
              .includes(filters.searchTerm.toLowerCase())
        );
      }

      if (filters.status && filters.status !== "all") {
        filteredData = filteredData.filter(
          (patient) => patient.status === filters.status
        );
      }

      if (filters.priority && filters.priority !== "all") {
        filteredData = filteredData.filter(
          (patient) => patient.priority === filters.priority
        );
      }

      if (filters.modality && filters.modality !== "all") {
        filteredData = filteredData.filter(
          (patient) => patient.modality === filters.modality
        );
      }

      // Pagination
      const startIndex = (currentPage - 1) * pageSize;
      const paginatedData = filteredData.slice(
        startIndex,
        startIndex + pageSize
      );

      setPatients(paginatedData);
      setTotalCount(filteredData.length);
    } catch (err) {
      setError(err.message);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Get patient by ID
  const getPatient = useCallback(async (patientId) => {
    try {
      setLoading(true);
      const patient = await patientService.getPatientById(patientId);
      return patient;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update patient status
  const updatePatientStatus = useCallback(async (patientId, status) => {
    try {
      const updatedPatient = await patientService.updatePatientStatus(
        patientId,
        status
      );
      setPatients((prev) =>
        prev.map((patient) =>
          patient.patientId === patientId ? { ...patient, status } : patient
        )
      );
      return updatedPatient;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return {
    patients,
    loading,
    error,
    filters,
    totalCount,
    currentPage,
    pageSize,
    updateFilters,
    setCurrentPage,
    setPageSize,
    getPatient,
    updatePatientStatus,
    refresh,
    clearError,
  };
};
