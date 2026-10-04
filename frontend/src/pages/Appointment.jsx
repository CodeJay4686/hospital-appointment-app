import React from 'react';
import Menu from '../components/Menu';
import AppointmentForm from '../components/AppointmentForm';
import AppointmentTable from '../components/AppointmentTable';
import Header from '../components/Header';

function Appointment() {
  return (
    <div className="dashboard-page">

      <Header />

      <Menu />

      <main className="app-content appointments-content">

        <div className="appointments-page-header">
          <span className="dashboard-eyebrow">
            APPOINTMENT MANAGEMENT
          </span>

          <h1>
            Appointments
          </h1>

          <p>
            Manage hospital appointments and scheduling.
          </p>
        </div>

        <div className="appointments-content-section">

          <AppointmentForm />

        </div>

        <div className="appointments-content-section">

          <AppointmentTable />

        </div>

      </main>

    </div>
  );
}

export default Appointment;