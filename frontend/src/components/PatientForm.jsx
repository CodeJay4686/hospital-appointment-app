import React, { useEffect, useState } from 'react';
import PatientTable from './PatientTable';

function PatientForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  const [patientData, setPatientData] = useState({
    name: '',
    date_of_birth: '',
    age: '',
    gender: '',
    contact_number: '',
    email: '',
  });

  /* =========================================
     CHECK CURRENT USER
     ========================================= */

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/checkSession', {
          credentials: 'include',
        });

        if (!response.ok) {
          setUserRole('');
          return;
        }

        const user = await response.json();

        setUserRole(user.role || '');

      } catch (error) {
        console.error('Unable to check session:', error);
        setUserRole('');
      } finally {
        setCheckingSession(false);
      }
    };

    checkUser();
  }, []);

  /* =========================================
     HANDLE INPUT
     ========================================= */

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setPatientData((currentData) => ({
      ...currentData,
      [name]: name === 'age'
        ? value === ''
          ? ''
          : parseInt(value, 10)
        : value,
    }));
  };

  /* =========================================
     SUBMIT PATIENT
     ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(patientData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Unable to add patient'
        );
      }

      setPatientData({
        name: '',
        date_of_birth: '',
        age: '',
        gender: '',
        contact_number: '',
        email: '',
      });

      // Refresh the page only after successful creation
      window.location.reload();

    } catch (error) {
      console.error('Error posting patient:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     SESSION CHECK LOADING
     ========================================= */

  if (checkingSession) {
    return (
      <div className="patient-page-loading">
        <div className="patient-loading-spinner"></div>
        <p>Loading patients...</p>
      </div>
    );
  }

  return (
    <div className="patient-management">

      {/* =====================================
          ADMIN PATIENT REGISTRATION
          ===================================== */}

      {userRole === 'Administrator' && (
        <section className="patient-registration-card">

          <div className="patient-registration-header">
            <div>
              <span className="patient-section-label">
                PATIENT MANAGEMENT
              </span>

              <h2>
                Register New Patient
              </h2>

              <p>
                Enter the patient's information below to
                create a new patient record.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="patient-registration-form"
          >

            {/* NAME */}

            <div className="patient-form-group">
              <label htmlFor="patient-name">
                Full Name
              </label>

              <input
                id="patient-name"
                type="text"
                name="name"
                value={patientData.name}
                onChange={handleInputChange}
                placeholder="Enter patient's full name"
                required
              />
            </div>

            {/* DATE OF BIRTH */}

            <div className="patient-form-group">
              <label htmlFor="patient-dob">
                Date of Birth
              </label>

              <input
                id="patient-dob"
                type="date"
                name="date_of_birth"
                value={patientData.date_of_birth}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* AGE */}

            <div className="patient-form-group">
              <label htmlFor="patient-age">
                Age
              </label>

              <input
                id="patient-age"
                type="number"
                name="age"
                min="0"
                value={patientData.age}
                onChange={handleInputChange}
                placeholder="Enter age"
                required
              />
            </div>

            {/* GENDER */}

            <div className="patient-form-group">
              <label htmlFor="patient-gender">
                Gender
              </label>

              <select
                id="patient-gender"
                name="gender"
                value={patientData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="">
                  Select gender
                </option>

                <option value="male">
                  Male
                </option>

                <option value="female">
                  Female
                </option>
              </select>
            </div>

            {/* PHONE */}

            <div className="patient-form-group">
              <label htmlFor="patient-phone">
                Phone Number
              </label>

              <input
                id="patient-phone"
                type="tel"
                name="contact_number"
                value={patientData.contact_number}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                required
              />
            </div>

            {/* EMAIL */}

            <div className="patient-form-group">
              <label htmlFor="patient-email">
                Email Address
              </label>

              <input
                id="patient-email"
                type="email"
                name="email"
                value={patientData.email}
                onChange={handleInputChange}
                placeholder="example@domain.com"
                required
              />
            </div>

            {error && (
              <div className="patient-form-error">
                {error}
              </div>
            )}

            <div className="patient-form-actions">
              <button
                type="submit"
                className="patient-add-button"
                disabled={loading}
              >
                {loading
                  ? 'Adding Patient...'
                  : 'Add Patient'}
              </button>
            </div>

          </form>

        </section>
      )}

      {/* =====================================
          DOCTOR INFORMATION
          ===================================== */}

      {userRole === 'Doctor' && (
        <div className="doctor-patient-info">
          <div>
            <span className="patient-section-label">
              PATIENT MANAGEMENT
            </span>

            <h2>
              My Patients
            </h2>

            <p>
              Patients who have appointments assigned
              to you are displayed below.
            </p>
          </div>
        </div>
      )}

      {/* =====================================
          PATIENT TABLE
          ===================================== */}

      <section className="patient-table-card">

        <div className="patient-table-header">
          <div>
            <h2>
              {userRole === 'Doctor'
                ? 'Assigned Patients'
                : 'Patient Records'}
            </h2>

            <p>
              {userRole === 'Doctor'
                ? 'View patients assigned to you through appointments.'
                : 'View and manage registered patient records.'}
            </p>
          </div>
        </div>

        <div className="patient-table-wrapper">
          <PatientTable />
        </div>

      </section>

    </div>
  );
}

export default PatientForm;