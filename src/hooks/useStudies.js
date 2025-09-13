// hooks/useStudies.js
import { useState, useEffect, useCallback } from "react";
import { dicomService } from "../services/dicomService";

export const useStudies = (patientId) => {
  const [studies, setStudies] = useState([]);
  const [series, setSeries] = useState([]);
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStudy, setCurrentStudy] = useState(null);
  const [currentSeries, setCurrentSeries] = useState(null);

  // Fetch studies for patient
  const fetchStudies = useCallback(
    async (searchParams = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response = await dicomService.searchStudies({
          patientID: patientId,
          ...searchParams,
        });

        setStudies(response.studies);
        return response;
      } catch (err) {
        setError(err.message);
        setStudies([]);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [patientId]
  );

  // Get study details
  const getStudy = useCallback(async (studyInstanceUID) => {
    try {
      setLoading(true);
      const study = await dicomService.getStudy(studyInstanceUID);
      setCurrentStudy(study);
      return study;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get series for study
  const getSeries = useCallback(async (studyInstanceUID) => {
    try {
      setLoading(true);
      const seriesList = await dicomService.getSeries(studyInstanceUID);
      setSeries(seriesList);
      return seriesList;
    } catch (err) {
      setError(err.message);
      setSeries([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get instances for series
  const getInstances = useCallback(
    async (studyInstanceUID, seriesInstanceUID) => {
      try {
        setLoading(true);
        const instancesList = await dicomService.getInstances(
          studyInstanceUID,
          seriesInstanceUID
        );
        setInstances(instancesList);
        setCurrentSeries(seriesInstanceUID);
        return instancesList;
      } catch (err) {
        setError(err.message);
        setInstances([]);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load DICOM image
  const loadImage = useCallback(
    async (studyInstanceUID, seriesInstanceUID, sopInstanceUID) => {
      try {
        const image = await dicomService.loadImage(
          studyInstanceUID,
          seriesInstanceUID,
          sopInstanceUID
        );
        return image;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    []
  );

  // Download study
  const downloadStudy = useCallback(async (studyInstanceUID) => {
    try {
      setLoading(true);
      // In real implementation, this would trigger a study download
      console.log("Downloading study:", studyInstanceUID);
      return { success: true, message: "Study download initiated" };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (patientId) {
      fetchStudies();
    }
  }, [patientId, fetchStudies]);

  return {
    studies,
    series,
    instances,
    loading,
    error,
    currentStudy,
    currentSeries,
    fetchStudies,
    getStudy,
    getSeries,
    getInstances,
    loadImage,
    downloadStudy,
    clearError,
  };
};
