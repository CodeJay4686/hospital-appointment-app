import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserDoctor } from 'react-icons/fa6';
import { MdSick } from 'react-icons/md';
import { FaCalendarCheck } from 'react-icons/fa';
import { FaHospitalUser } from 'react-icons/fa';
import { FaNotesMedical } from 'react-icons/fa';

import Menu from './Menu';
import Header from './Header';

function Home() {
  return (
    <div className="home-page">

      <Header />
      <Menu />

      <main className="app-content">

        {/* Welcome Section */}
        <section className="welcome-section">

          <div className="welcome-content">
            <span className="welcome-label">
              HOSPITAL MANAGEMENT SYSTEM
            </span>

            <h1>
              Welcome to <span>H.A.M.S.</span>
            </h1>

            <p>
              A centralized hospital management platform for
              appointments, patients, doctors and medical records.
            </p>

            <div className="welcome-buttons">
              <Link to="/login" className="home-primary-btn">
                Login to Your Account
              </Link>

              <Link to="/signup" className="home-secondary-btn">
                Create Account
              </Link>
            </div>
          </div>

          <div className="welcome-illustration">
            <div className="medical-circle">
              <FaHospitalUser />
            </div>
          </div>

        </section>


        {/* Quick Access */}
        <section className="quick-section">

          <div className="section-heading">
            <div>
              <h2>Quick Access</h2>
              <p>
                Access the main services available on H.A.M.S.
              </p>
            </div>
          </div>


          <div className="home-card-grid">

            <Link to="/appointments" className="home-service-card">

              <div className="service-icon appointment-icon">
                <FaCalendarCheck />
              </div>

              <div>
                <h3>Appointments</h3>
                <p>
                  Book and manage hospital appointments
                  with healthcare professionals.
                </p>
              </div>

              <span className="card-arrow">→</span>

            </Link>


            <Link to="/patients" className="home-service-card">

              <div className="service-icon patient-icon">
                <MdSick />
              </div>

              <div>
                <h3>Patients</h3>
                <p>
                  Manage patient information and
                  healthcare records.
                </p>
              </div>

              <span className="card-arrow">→</span>

            </Link>


            <Link to="/staffs" className="home-service-card">

              <div className="service-icon doctor-icon">
                <FaUserDoctor />
              </div>

              <div>
                <h3>Doctors</h3>
                <p>
                  View healthcare professionals and
                  their available services.
                </p>
              </div>

              <span className="card-arrow">→</span>

            </Link>


            <div className="home-service-card">

              <div className="service-icon records-icon">
                <FaNotesMedical />
              </div>

              <div>
                <h3>Medical Records</h3>
                <p>
                  Access and manage authorized patient
                  medical information.
                </p>
              </div>

              <span className="card-arrow">→</span>

            </div>

          </div>

        </section>


        {/* System Features */}
        <section className="home-features">

          <div className="section-heading">
            <div>
              <h2>Why Use H.A.M.S.?</h2>
              <p>
                Everything needed to manage hospital services
                from one centralized platform.
              </p>
            </div>
          </div>


          <div className="feature-row">

            <div className="small-feature">
              <div className="small-feature-icon">
                📅
              </div>

              <div>
                <h3>Easy Appointment Scheduling</h3>
                <p>
                  Patients can schedule appointments
                  without unnecessary paperwork.
                </p>
              </div>
            </div>


            <div className="small-feature">
              <div className="small-feature-icon">
                🔒
              </div>

              <div>
                <h3>Secure Access</h3>
                <p>
                  Users access information according
                  to their assigned role.
                </p>
              </div>
            </div>


            <div className="small-feature">
              <div className="small-feature-icon">
                📋
              </div>

              <div>
                <h3>Centralized Records</h3>
                <p>
                  Patient information and medical
                  records are organized in one system.
                </p>
              </div>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Home;