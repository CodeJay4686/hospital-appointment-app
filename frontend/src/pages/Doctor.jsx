import React from 'react';
import DoctorForm from '../components/DoctorForm';
import DoctorTable from '../components/DoctorTable';
import Menu from '../components/Menu';
import Header from '../components/Header';

function Doctor() {
  return (
    <div className="dashboard-page">
      <Header />

      <Menu />

      <main className="app-content doctors-content">

        {/* PAGE HEADER */}

        <div className="doctors-page-header">

          <div>
            <span className="dashboard-eyebrow">
              DOCTOR MANAGEMENT
            </span>

            <h1>
              Doctors
            </h1>

            <p>
              Register and manage doctors in the
              hospital system.
            </p>
          </div>

        </div>

        {/* DOCTOR REGISTRATION */}

        <section className="doctors-content-section">
          <DoctorForm />
        </section>

        {/* DOCTOR LIST */}

        <section className="doctors-content-section">
          <DoctorTable />
        </section>

      </main>
    </div>
  );
}

export default Doctor;