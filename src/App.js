import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Dashboard from "./components/Dashboard/Dashboard";
import StudyViewer from "./components/StudyViewer/StudyViewer";
import Navbar from "./components/Navigation/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { PatientProvider } from "./context/PatientContext";

function App() {
  return (
    <AuthProvider>
      <PatientProvider>
        <div className="App">
          <Router>
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/study/:patientId" element={<StudyViewer />} />
              </Routes>
            </main>
          </Router>
        </div>
      </PatientProvider>
    </AuthProvider>
  );
}

export default App;
