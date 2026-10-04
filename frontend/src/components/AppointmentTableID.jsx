import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Menu from './Menu';
import Header from './Header';

function AppointmentTableID() {
  const { id } = useParams();

  const [appointment, setAppointment] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  fetchAppointment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const fetchAppointment = async () => {
    setLoading(true);
    setError('');

    try {
      /* =====================================
         CHECK SESSION
         ===================================== */

      const sessionResponse = await fetch(
        '/checkSession',
        {
          credentials: 'include',
        }
      );

      if (!sessionResponse.ok) {
        throw new Error(
          'Unable to verify your session'
        );
      }

      const currentUser =
        await sessionResponse.json();

      setUserRole(currentUser.role || '');

      /* =====================================
         GET APPOINTMENT
         ===================================== */

      const response = await fetch(
        `/appointments/${id}`,
        {
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          'Unable to load appointment'
        );
      }

      setAppointment(data);

    } catch (error) {
      console.error(
        'Appointment details error:',
        error
      );

      setError(
        error.message ||
        'Unable to load appointment details.'
      );

    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     LOADING
     ========================================= */

  if (loading) {
    return (
      <div className="dashboard-page">
        <Header />
        <Menu />

        <main className="app-content appointment-details-content">
          <div className="appointment-details-message">
            Loading appointment details...
          </div>
        </main>
      </div>
    );
  }

  /* =========================================
     ERROR
     ========================================= */

  if (error) {
    return (
      <div className="dashboard-page">
        <Header />
        <Menu />

        <main className="app-content appointment-details-content">

          <div className="appointment-details-error">
            {error}
          </div>

          <Link
            to="/appointments"
            className="appointment-back-link"
          >
            ← Back to Appointments
          </Link>

        </main>
      </div>
    );
  }

  /* =========================================
     NO APPOINTMENT
     ========================================= */

  if (!appointment) {
    return (
      <div className="dashboard-page">
        <Header />
        <Menu />

        <main className="app-content appointment-details-content">

          <div className="appointment-details-message">
            Appointment not found.
          </div>

          <Link
            to="/appointments"
            className="appointment-back-link"
          >
            ← Back to Appointments
          </Link>

        </main>
      </div>
    );
  }

  /* =========================================
     STATUS CLASS
     ========================================= */

  const statusClass = (
    appointment.status || 'Pending'
  )
    .toLowerCase()
    .replace(/\s+/g, '-');

  /* =========================================
     PAGE
     ========================================= */

  return (
    <div className="dashboard-page">

      <Header />

      <Menu />

      <main className="app-content appointment-details-content">

        {/* HEADER */}

        <div className="appointment-details-header">

          <div>

            <span className="dashboard-eyebrow">
              APPOINTMENT DETAILS
            </span>

            <h1>
              Appointment #{appointment.id}
            </h1>

            <p>
              View the details of this hospital
              appointment.
            </p>

          </div>

          <Link
            to="/appointments"
            className="appointment-back-link"
          >
            ← Back to Appointments
          </Link>

        </div>

        {/* DETAILS CARD */}

        <div className="appointment-details-card">

          <div className="appointment-details-card-header">

            <div>
              <span className="appointment-section-label">
                APPOINTMENT RECORD
              </span>

              <h2>
                {appointment.appointment_type ||
                  'Appointment'}
              </h2>
            </div>

            <span
              className={`appointment-status ${statusClass}`}
            >
              {appointment.status || 'Pending'}
            </span>

          </div>

          <div className="appointment-details-grid">

            {/* APPOINTMENT ID */}

            <div className="appointment-detail-item">

              <span>
                Appointment ID
              </span>

              <strong>
                #{appointment.id}
              </strong>

            </div>

            {/* TYPE */}

            <div className="appointment-detail-item">

              <span>
                Appointment Type
              </span>

              <strong>
                {appointment.appointment_type ||
                  '-'}
              </strong>

            </div>

            {/* DATE */}

            <div className="appointment-detail-item">

              <span>
                Appointment Date
              </span>

              <strong>
                {appointment.appointment_date ||
                  '-'}
              </strong>

            </div>

            {/* TIME */}

            <div className="appointment-detail-item">

              <span>
                Appointment Time
              </span>

              <strong>
                {appointment.appointment_time ||
                  '-'}
              </strong>

            </div>

            {/* PATIENT */}

            <div className="appointment-detail-item">

              <span>
                Patient
              </span>

              <strong>
                {appointment.patient?.name ||
                  '-'}
              </strong>

            </div>

            {/* AGE */}

            <div className="appointment-detail-item">

              <span>
                Patient Age
              </span>

              <strong>
                {appointment.patient?.age ||
                  '-'}
              </strong>

            </div>

            {/* DOCTOR */}

            <div className="appointment-detail-item">

              <span>
                Doctor
              </span>

              <strong>
                {appointment.staff?.name ||
                  '-'}
              </strong>

            </div>

            {/* SPECIALISATION */}

            <div className="appointment-detail-item">

              <span>
                Specialisation
              </span>

              <strong>
                {appointment.staff?.specialisation ||
                  '-'}
              </strong>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="appointment-details-actions">

            {userRole === 'Administrator' && (
              <Link
                to={`/appointments/${appointment.id}/edit`}
                className="appointment-edit-button"
              >
                Update Appointment
              </Link>
            )}

            <Link
              to="/appointments"
              className="appointment-secondary-button"
            >
              Back to Appointments
            </Link>

          </div>

        </div>

      </main>

    </div>
  );
}

export default AppointmentTableID;