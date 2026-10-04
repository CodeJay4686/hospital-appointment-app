import React from 'react';
import PatientForm from '../components/PatientForm';
import Menu from '../components/Menu';
import Header from '../components/Header';

function Patients() {
  return (
    <div className="dashboard-page">

      <Header />

      <Menu />

      <main className="app-content patients-content">

        <div className="patients-page-header">
          <span className="dashboard-eyebrow">
            PATIENT MANAGEMENT
          </span>

          <h1>
            Patients
          </h1>

          <p>
            View and manage patients assigned to you.
          </p>
        </div>

        <div className="patients-panel">
          <PatientForm />
        </div>

      </main>

    </div>
  );
}

export default Patients;