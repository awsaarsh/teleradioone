import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PatientList from "../PatientList/PatientList";
import LoadingSpinner from "../Common/LoadingSpinner";
import { patientService } from "../../services/patientService";
import { Search, Filter, Calendar, User } from "lucide-react";
import "./Dashboard.css";

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, statusFilter, priorityFilter]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.getAllPatients();
      setPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
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

    setFilteredPatients(filtered);
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    navigate(`/study/${patient.patientId}`);
  };

  const getStatusCounts = () => {
    const counts = {
      pending: patients.filter((p) => p.status === "pending").length,
      inProgress: patients.filter((p) => p.status === "in-progress").length,
      completed: patients.filter((p) => p.status === "completed").length,
      urgent: patients.filter((p) => p.priority === "urgent").length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
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
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <PatientList
          patients={filteredPatients}
          onPatientSelect={handlePatientSelect}
          selectedPatient={selectedPatient}
        />
      </div>
    </div>
  );
};

export default Dashboard;
