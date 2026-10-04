import React from 'react';
import Menu from './Menu';
import Footer from './Footer';
import Header from './Header';

function Home() {
  return (
    <div className="home-page">
      <Header />

      <Menu />

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <h1>Hospital Appointment Management System</h1>

            <p>
              Manage hospital appointments, patient records,
              healthcare providers and medical information
              through one centralized platform.
            </p>

            <div className="hero-buttons">
              <a href="/login" className="btn btn-primary">
                Login
              </a>

              <a href="/signup" className="btn btn-outline-primary">
                Create Account
              </a>
            </div>
          </div>
        </section>

        <section className="features-section">
          <h2>H.A.M.S.</h2>

          <p className="section-description">
            A web-based hospital management platform designed
            to make healthcare services easier to manage.
          </p>

          <div className="feature-grid">

            <div className="feature-card">
              <div className="feature-icon">
                🩺
              </div>

              <h3>Patient Management</h3>

              <p>
                Manage patient information and access authorized
                medical records in one place.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                📅
              </div>

              <h3>Appointment Scheduling</h3>

              <p>
                Patients can book appointments while doctors
                manage their schedules and availability.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                📋
              </div>

              <h3>Medical Records</h3>

              <p>
                Doctors can create patient medical records and
                authorized patients can view their records.
              </p>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;