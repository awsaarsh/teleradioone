// components/Dashboard/Dashboard.jsx - Fixed React Hooks
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PatientList from "../PatientList/PatientList";
import LoadingSpinner from "../Common/LoadingSpinner";
import DicomImport from "../DicomImport/DicomImport";
import { patientService } from "../../services/patientService";
import { Search, Filter, Calendar, Upload } from "lucide-react";
import "./Dashboard.css";

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const navigate = useNavigate();

  // Memoized filtered patients to prevent unnecessary recalculations
  const filteredPatients = useMemo(() => {
    let filtered = patients;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.accessionNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((patient) => patient.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(
        (patient) => patient.priority === priorityFilter
      );
    }

    return filtered;
  }, [patients, searchTerm, statusFilter, priorityFilter]);

  // Memoized status counts to prevent unnecessary recalculations
  const statusCounts = useMemo(() => {
    return {
      pending: patients.filter((p) => p.status === "pending").length,
      inProgress: patients.filter((p) => p.status === "in-progress").length,
      completed: patients.filter((p) => p.status === "completed").length,
      urgent: patients.filter((p) => p.priority === "urgent").length,
    };
  }, [patients]);

  // Fetch patients function with useCallback to prevent recreation
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await patientService.getAllPatients();
      setPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle patient selection with useCallback
  const handlePatientSelect = useCallback(
    (patient) => {
      setSelectedPatient(patient);
      navigate(`/study/${patient.patientId}`);
    },
    [navigate]
  );

  // Handle import click with useCallback
  const handleImportClick = useCallback(() => {
    setShowImportModal(true);
  }, []);

  // Handle files processed with useCallback
  const handleFilesProcessed = useCallback((processedFiles) => {
    console.log("Files processed:", processedFiles);

    // Convert to patient format and add to list
    const newPatients = processedFiles.map((file) => ({
      patientId: file.patientId,
      name: file.patientName,
      age: file.age,
      gender: file.gender,
      studyDate: file.studyDate,
      modality: file.modality,
      bodyPart: file.bodyPart,
      status: file.status,
      priority: file.priority,
      accessionNumber: file.accessionNumber,
      studyDescription: file.studyDescription,
      seriesCount: 1,
      imageCount: 1,
      referringPhysician: file.referringPhysician,
      series: file.series,
    }));

    // Add to beginning of patient list
    setPatients((prev) => [...newPatients, ...prev]);
    setShowImportModal(false);

    // Show success message
    alert(
      `Successfully imported ${newPatients.length} file${
        newPatients.length !== 1 ? "s" : ""
      }!`
    );
  }, []);

  // Close import modal with useCallback
  const handleCloseImport = useCallback(() => {
    setShowImportModal(false);
  }, []);

  // Search term change handler with useCallback
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Status filter change handler with useCallback
  const handleStatusFilterChange = useCallback((e) => {
    setStatusFilter(e.target.value);
  }, []);

  // Priority filter change handler with useCallback
  const handlePriorityFilterChange = useCallback((e) => {
    setPriorityFilter(e.target.value);
  }, []);

  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Teleradiology Dashboard</h1>
          <p>Manage and review patient studies</p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card pending">
            <div className="stat-number">{statusCounts.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card in-progress">
            <div className="stat-number">{statusCounts.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card completed">
            <div className="stat-number">{statusCounts.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card urgent">
            <div className="stat-number">{statusCounts.urgent}</div>
            <div className="stat-label">Urgent</div>
          </div>
        </div>
      </div>

      <div className="dashboard-filters">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by patient name, ID, or accession number..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={16} />
            <select value={statusFilter} onChange={handleStatusFilterChange}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="filter-group">
            <Calendar size={16} />
            <select
              value={priorityFilter}
              onChange={handlePriorityFilterChange}
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>

          <button className="import-btn" onClick={handleImportClick}>
            <Upload size={16} />
            Import Files
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <PatientList
          patients={filteredPatients}
          onPatientSelect={handlePatientSelect}
          selectedPatient={selectedPatient}
        />
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <DicomImport
          onFileProcessed={handleFilesProcessed}
          onClose={handleCloseImport}
        />
      )}
    </div>
  );
};

export default Dashboard;
