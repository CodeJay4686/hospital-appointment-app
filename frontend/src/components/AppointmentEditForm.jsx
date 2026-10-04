import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Menu from './Menu';
import Header from './Header';

function AppointmentEditForm() {
  const { id } = useParams();
  const history = useHistory();

  const [appointment, setAppointment] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
  loadPage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id]);

  const loadPage = async () => {
    setLoading(true);
    setError('');

    try {
      /* =====================================
         CHECK ADMIN SESSION
         ===================================== */

      const sessionResponse = await fetch('/checkSession', {
        credentials: 'include',
      });

      if (!sessionResponse.ok) {
        throw new Error('Unable to verify your session.');
      }

      const currentUser = await sessionResponse.json();

      setUserRole(currentUser.role || '');

      if (currentUser.role !== 'Administrator') {
        throw new Error(
          'You are not authorized to update appointments.'
        );
      }

      /* =====================================
         LOAD APPOINTMENT
         ===================================== */

      const appointmentResponse = await fetch(
        `/appointments/${id}`,
        {
          credentials: 'include',
        }
      );

      const appointmentData = await appointmentResponse.json();

      if (!appointmentResponse.ok) {
        throw new Error(
          appointmentData.error ||
            'Unable to load appointment.'
        );
      }

      setAppointment(appointmentData);

      setPatientId(
        appointmentData.patient_id
          ? String(appointmentData.patient_id)
          : ''
      );

      setDoctorId(
        appointmentData.staff_id
          ? String(appointmentData.staff_id)
          : ''
      );

      setAppointmentType(
        appointmentData.appointment_type || ''
      );

      setAppointmentDate(
        appointmentData.appointment_date || ''
      );

      setAppointmentTime(
        appointmentData.appointment_time || ''
      );

      /* =====================================
         LOAD PATIENTS
         ===================================== */

      const patientsResponse = await fetch('/patients', {
        credentials: 'include',
      });

      const patientsData = await patientsResponse.json();

      if (!patientsResponse.ok) {
        throw new Error(
          patientsData.error ||
            'Unable to load patients.'
        );
      }

      setPatients(
        Array.isArray(patientsData)
          ? patientsData
          : []
      );

      /* =====================================
         LOAD DOCTORS
         ===================================== */

      const doctorsResponse = await fetch('/staffs', {
        credentials: 'include',
      });

      const doctorsData = await doctorsResponse.json();

      if (!doctorsResponse.ok) {
        throw new Error(
          doctorsData.error ||
            'Unable to load doctors.'
        );
      }

      setDoctors(
        Array.isArray(doctorsData)
          ? doctorsData
          : []
      );
    } catch (error) {
      console.error(
        'Appointment edit loading error:',
        error
      );

      setError(
        error.message ||
          'Unable to load appointment.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     SUBMIT UPDATE
     ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userRole !== 'Administrator') {
      setError(
        'You are not authorized to update appointments.'
      );
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `/appointments/${id}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patient_id: parseInt(patientId, 10),
            staff_id: parseInt(doctorId, 10),
            appointment_type: appointmentType,
            dbDate: appointmentDate,
            appointment_time: appointmentTime,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to update appointment.'
        );
      }

      setSuccess(
        'Appointment updated successfully.'
      );

      setAppointment((current) => ({
        ...current,
        patient_id: parseInt(patientId, 10),
        staff_id: parseInt(doctorId, 10),
        appointment_type: appointmentType,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
      }));

      setTimeout(() => {
        history.push('/appointments');
      }, 1000);
    } catch (error) {
      console.error(
        'Appointment update error:',
        error
      );

      setError(
        error.message ||
          'Unable to update appointment.'
      );
    } finally {
      setSubmitting(false);
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

        <main className="app-content appointment-edit-content">
          <div className="appointment-edit-message">
            Loading appointment...
          </div>
        </main>
      </div>
    );
  }

  /* =========================================
     ERROR
     ========================================= */

  if (error && !appointment) {
    return (
      <div className="dashboard-page">
        <Header />
        <Menu />

        <main className="app-content appointment-edit-content">

          <div className="appointment-edit-error">
            {error}
          </div>

          <button
            type="button"
            className="appointment-cancel-button"
            onClick={() => history.push('/appointments')}
          >
            ← Back to Appointments
          </button>

        </main>
      </div>
    );
  }

  /* =========================================
     FORM
     ========================================= */

  return (
    <div className="dashboard-page">

      <Header />

      <Menu />

      <main className="app-content appointment-edit-content">

        {/* PAGE HEADER */}

        <div className="appointment-edit-page-header">

          <div>

            <span className="dashboard-eyebrow">
              APPOINTMENT MANAGEMENT
            </span>

            <h1>
              Update Appointment
            </h1>

            <p>
              Reschedule or update the details
              of this appointment.
            </p>

          </div>

          <button
            type="button"
            className="appointment-back-button"
            onClick={() => history.push('/appointments')}
          >
            ← Back to Appointments
          </button>

        </div>

        {/* FORM CARD */}

        <div className="appointment-edit-card">

          <div className="appointment-edit-card-header">

            <div>

              <span className="appointment-section-label">
                APPOINTMENT #{id}
              </span>

              <h2>
                Reschedule Appointment
              </h2>

              <p>
                Update the patient, doctor, appointment
                type, date or time.
              </p>

            </div>

            {appointment?.status && (
              <span
                className={`appointment-status ${
                  appointment.status
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                }`}
              >
                {appointment.status}
              </span>
            )}

          </div>

          <form
            onSubmit={handleSubmit}
            className="appointment-edit-form"
          >

            {/* PATIENT */}

            <div className="appointment-edit-group">

              <label htmlFor="edit-patient">
                Patient
              </label>

              <select
                id="edit-patient"
                value={patientId}
                onChange={(e) =>
                  setPatientId(e.target.value)
                }
                required
              >
                <option value="">
                  Select patient
                </option>

                {patients.map((patient) => (
                  <option
                    key={patient.id}
                    value={patient.id}
                  >
                    {patient.name}
                  </option>
                ))}
              </select>

            </div>

            {/* DOCTOR */}

            <div className="appointment-edit-group">

              <label htmlFor="edit-doctor">
                Doctor
              </label>

              <select
                id="edit-doctor"
                value={doctorId}
                onChange={(e) =>
                  setDoctorId(e.target.value)
                }
                required
              >
                <option value="">
                  Select doctor
                </option>

                {doctors.map((doctor) => (
                  <option
                    key={doctor.id}
                    value={doctor.id}
                  >
                    {doctor.name}
                    {doctor.specialisation
                      ? ` — ${doctor.specialisation}`
                      : ''}
                  </option>
                ))}
              </select>

            </div>

            {/* APPOINTMENT TYPE */}

            <div className="appointment-edit-group">

              <label htmlFor="edit-type">
                Appointment Type
              </label>

              <select
                id="edit-type"
                value={appointmentType}
                onChange={(e) =>
                  setAppointmentType(e.target.value)
                }
                required
              >
                <option value="">
                  Select appointment type
                </option>

                <option value="Consultation">
                  Consultation
                </option>

                <option value="Follow-up">
                  Follow-up
                </option>

                <option value="General Checkup">
                  General Checkup
                </option>

                <option value="Medical Examination">
                  Medical Examination
                </option>
              </select>

            </div>

            {/* DATE */}

            <div className="appointment-edit-group">

              <label htmlFor="edit-date">
                Appointment Date
              </label>

              <input
                id="edit-date"
                type="date"
                value={appointmentDate}
                onChange={(e) =>
                  setAppointmentDate(e.target.value)
                }
                required
              />

            </div>

            {/* TIME */}

            <div className="appointment-edit-group">

              <label htmlFor="edit-time">
                Appointment Time
              </label>

              <input
                id="edit-time"
                type="time"
                value={appointmentTime}
                onChange={(e) =>
                  setAppointmentTime(e.target.value)
                }
                required
              />

            </div>

            {/* ERROR */}

            {error && (
              <div className="appointment-edit-error">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="appointment-edit-success">
                {success}
              </div>
            )}

            {/* BUTTONS */}

            <div className="appointment-edit-actions">

              <button
                type="button"
                className="appointment-cancel-button"
                onClick={() =>
                  history.push('/appointments')
                }
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="appointment-save-button"
                disabled={submitting}
              >
                {submitting
                  ? 'Saving Changes...'
                  : 'Save Changes'}
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}

export default AppointmentEditForm;