import React, { useEffect, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

import Header from '../components/Header';
import Menu from '../components/Menu';

function DoctorDashboard() {
  const history = useHistory();

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [loading, setLoading] = useState(true);

  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);

  const [error, setError] = useState('');
  const [medicalRecordsError, setMedicalRecordsError] = useState('');

  const [availabilityForm, setAvailabilityForm] = useState({
    day_of_week: 'Monday',
    start_time: '',
    end_time: '',
  });

  const [medicalRecordForm, setMedicalRecordForm] = useState({
    diagnosis: '',
    treatment: '',
    prescription: '',
    notes: '',
  });

  const [selectedAppointmentId, setSelectedAppointmentId] =
    useState(null);

  const [recordSuccessAppointmentId, setRecordSuccessAppointmentId] =
    useState(null);


  /* =====================================================
     CHECK DOCTOR SESSION
     ===================================================== */

  useEffect(() => {
    const checkDoctorSession = async () => {
      try {
        const response = await fetch('/checkSession', {
          credentials: 'include',
        });

        if (!response.ok) {
          history.replace('/login');
          return;
        }

        const user = await response.json();

        if (user.role !== 'Doctor') {
          history.replace('/');
          return;
        }

        setCheckingAccess(false);
      } catch (error) {
        console.error(error);
        history.replace('/login');
      }
    };

    checkDoctorSession();
  }, [history]);


  /* =====================================================
     FETCH DOCTOR
     ===================================================== */

  const fetchDoctor = async () => {
    try {
      const response = await fetch('/current-doctor', {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Unable to load doctor profile.'
        );
      }

      setDoctor(data);
    } catch (error) {
      console.error(error);
    }
  };


  /* =====================================================
     FETCH APPOINTMENTS
     ===================================================== */

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/my-doctor-appointments', {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Unable to load appointments.'
        );
      }

      setAppointments(data);
    } catch (error) {
      console.error(error);
      setError('Unable to load your appointments.');
    }
  };


  /* =====================================================
     FETCH AVAILABILITY
     ===================================================== */

  const fetchAvailabilities = async () => {
    try {
      const response = await fetch('/doctor-availability', {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Unable to load availability.'
        );
      }

      setAvailabilities(data);
    } catch (error) {
      console.error(error);
    }
  };


  /* =====================================================
     FETCH MEDICAL RECORDS
     ===================================================== */

  const fetchMedicalRecords = async () => {
    try {
      setMedicalRecordsError('');

      const response = await fetch('/medical-records', {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Unable to load medical records.'
        );
      }

      setMedicalRecords(data);
    } catch (error) {
      console.error(error);

      setMedicalRecords([]);
      setMedicalRecordsError(
        'Unable to load medical records.'
      );
    }
  };


  /* =====================================================
     LOAD DASHBOARD
     ===================================================== */

  useEffect(() => {
    if (checkingAccess) {
      return;
    }

    const loadDashboard = async () => {
      setLoading(true);

      await Promise.all([
        fetchDoctor(),
        fetchAppointments(),
        fetchAvailabilities(),
        fetchMedicalRecords(),
      ]);

      setLoading(false);
    };

    loadDashboard();
  }, [checkingAccess]);


  /* =====================================================
     UPDATE APPOINTMENT STATUS
     ===================================================== */

  const updateAppointmentStatus = async (
    appointmentId,
    status
  ) => {
    try {
      const response = await fetch(
        `/appointments/${appointmentId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            status,
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

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                status,
              }
            : appointment
        )
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };


  /* =====================================================
     ADD AVAILABILITY
     ===================================================== */

  const addAvailability = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        '/doctor-availability',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(
            availabilityForm
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          'Unable to add availability.'
        );
      }

      setAvailabilities((current) => [
        ...current,
        data,
      ]);

      setAvailabilityForm({
        day_of_week: 'Monday',
        start_time: '',
        end_time: '',
      });
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };


  /* =====================================================
     CREATE MEDICAL RECORD
     ===================================================== */

  const createMedicalRecord = async (event) => {
    event.preventDefault();

    if (!selectedAppointmentId) {
      alert('Please select an appointment.');
      return;
    }

    const appointment = appointments.find(
      (item) =>
        item.id === selectedAppointmentId
    );

    if (!appointment) {
      alert('Appointment not found.');
      return;
    }

    try {
      const response = await fetch(
        '/medical-records',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            patient_id:
              appointment.patient_id,

            diagnosis:
              medicalRecordForm.diagnosis,

            treatment:
              medicalRecordForm.treatment,

            prescription:
              medicalRecordForm.prescription,

            notes:
              medicalRecordForm.notes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          'Unable to create medical record.'
        );
      }

      setRecordSuccessAppointmentId(
        selectedAppointmentId
      );

      setSelectedAppointmentId(null);

      setMedicalRecordForm({
        diagnosis: '',
        treatment: '',
        prescription: '',
        notes: '',
      });

      await fetchMedicalRecords();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };


  /* =====================================================
     DATE FORMAT
     ===================================================== */

  const formatDate = (date) => {
    if (!date) {
      return 'Not specified';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );
  };


  /* =====================================================
     STATUS CLASS
     ===================================================== */

  const getStatusClass = (status) => {
    if (status === 'Approved') {
      return 'doctor-status doctor-status-approved';
    }

    if (status === 'Rejected') {
      return 'doctor-status doctor-status-rejected';
    }

    return 'doctor-status doctor-status-pending';
  };


  /* =====================================================
     LOADING
     ===================================================== */

  if (checkingAccess || loading) {
    return (
      <div className="dashboard-page doctor-dashboard-page">

        <Header />

        <Menu />

        <main className="app-content">

          <div className="doctor-loading">

            <div className="doctor-spinner">
              <Spinner animation="border" />
            </div>

            <h3>
              Loading Doctor Dashboard
            </h3>

            <p>
              Please wait while we load your information.
            </p>

          </div>

        </main>

        <DoctorDashboardStyles />

      </div>
    );
  }


  /* =====================================================
     ERROR
     ===================================================== */

  if (error) {
    return (
      <div className="dashboard-page doctor-dashboard-page">

        <Header />

        <Menu />

        <main className="app-content">

          <div className="doctor-error">

            <div className="doctor-error-icon">
              !
            </div>

            <h3>
              Something went wrong
            </h3>

            <p>
              {error}
            </p>

          </div>

        </main>

        <DoctorDashboardStyles />

      </div>
    );
  }


  /* =====================================================
     MAIN DASHBOARD
     ===================================================== */

  return (
    <div className="dashboard-page doctor-dashboard-page">

      <Header />

      <Menu />


      <main className="app-content doctor-content">


        {/* =================================================
            DASHBOARD HEADER
            ================================================= */}

        <section className="doctor-welcome">

          <div className="doctor-welcome-content">

            <span className="doctor-eyebrow">
              DOCTOR PORTAL
            </span>

            <h1>
              Welcome, {doctor?.name || 'Doctor'} 👨‍⚕️
            </h1>

            <p>
              Manage your appointments, availability,
              and patient medical records from one place.
            </p>

          </div>


          <div className="doctor-profile-chip">

            <div className="doctor-profile-avatar">

              {doctor?.name
                ? doctor.name
                    .charAt(0)
                    .toUpperCase()
                : 'D'}

            </div>

            <div>

              <strong>
                {doctor?.name || 'Doctor'}
              </strong>

              <span>
                {doctor?.specialisation || 'Doctor'}
              </span>

            </div>

          </div>

        </section>


        {/* =================================================
            QUICK STATISTICS
            ================================================= */}

        <section className="doctor-stats">

          <div className="doctor-stat-card">

            <div className="doctor-stat-icon">
              📅
            </div>

            <div>

              <span>
                Total Appointments
              </span>

              <strong>
                {appointments.length}
              </strong>

            </div>

          </div>


          <div className="doctor-stat-card">

            <div className="doctor-stat-icon">
              🕐
            </div>

            <div>

              <span>
                Pending
              </span>

              <strong>
                {
                  appointments.filter(
                    (item) =>
                      item.status === 'Pending'
                  ).length
                }
              </strong>

            </div>

          </div>


          <div className="doctor-stat-card">

            <div className="doctor-stat-icon">
              ✓
            </div>

            <div>

              <span>
                Approved
              </span>

              <strong>
                {
                  appointments.filter(
                    (item) =>
                      item.status === 'Approved'
                  ).length
                }
              </strong>

            </div>

          </div>


          <div className="doctor-stat-card">

            <div className="doctor-stat-icon">
              📋
            </div>

            <div>

              <span>
                Medical Records
              </span>

              <strong>
                {medicalRecords.length}
              </strong>

            </div>

          </div>

        </section>


        {/* =================================================
            DOCTOR INFORMATION
            ================================================= */}

        <section className="doctor-section">

          <div className="doctor-section-heading">

            <div>

              <span>
                PROFILE
              </span>

              <h2>
                Doctor Information
              </h2>

            </div>

          </div>


          <div className="doctor-info-grid">

            <div className="doctor-info-card">

              <span>
                Doctor ID
              </span>

              <strong>
                {doctor?.id}
              </strong>

            </div>


            <div className="doctor-info-card">

              <span>
                Specialisation
              </span>

              <strong>
                {doctor?.specialisation}
              </strong>

            </div>


            <div className="doctor-info-card">

              <span>
                Email
              </span>

              <strong>
                {doctor?.email}
              </strong>

            </div>


            <div className="doctor-info-card">

              <span>
                Contact Number
              </span>

              <strong>
                {doctor?.contact_number}
              </strong>

            </div>

          </div>

        </section>


        {/* =================================================
            AVAILABILITY
            ================================================= */}

        <section className="doctor-section">

          <div className="doctor-section-heading">

            <div>

              <span>
                MANAGEMENT
              </span>

              <h2>
                My Availability
              </h2>

              <p>
                Set the days and times when patients
                can book appointments with you.
              </p>

            </div>

          </div>


          <div className="doctor-panel">


            <form onSubmit={addAvailability}>

              <div className="doctor-form-grid">


                <div className="doctor-form-field">

                  <label>
                    Day
                  </label>

                  <select
                    value={
                      availabilityForm.day_of_week
                    }
                    onChange={(event) =>
                      setAvailabilityForm({
                        ...availabilityForm,
                        day_of_week:
                          event.target.value,
                      })
                    }
                  >

                    <option value="Monday">
                      Monday
                    </option>

                    <option value="Tuesday">
                      Tuesday
                    </option>

                    <option value="Wednesday">
                      Wednesday
                    </option>

                    <option value="Thursday">
                      Thursday
                    </option>

                    <option value="Friday">
                      Friday
                    </option>

                    <option value="Saturday">
                      Saturday
                    </option>

                    <option value="Sunday">
                      Sunday
                    </option>

                  </select>

                </div>


                <div className="doctor-form-field">

                  <label>
                    Start Time
                  </label>

                  <input
                    type="time"
                    value={
                      availabilityForm.start_time
                    }
                    onChange={(event) =>
                      setAvailabilityForm({
                        ...availabilityForm,
                        start_time:
                          event.target.value,
                      })
                    }
                    required
                  />

                </div>


                <div className="doctor-form-field">

                  <label>
                    End Time
                  </label>

                  <input
                    type="time"
                    value={
                      availabilityForm.end_time
                    }
                    onChange={(event) =>
                      setAvailabilityForm({
                        ...availabilityForm,
                        end_time:
                          event.target.value,
                      })
                    }
                    required
                  />

                </div>


                <div className="doctor-form-field doctor-form-action">

                  <button
                    type="submit"
                    className="doctor-primary-button"
                  >
                    + Add Availability
                  </button>

                </div>

              </div>

            </form>


            <div className="doctor-divider" />


            <div className="doctor-subheading">

              <h3>
                Current Availability
              </h3>

              <span>
                {availabilities.length} schedule
                {availabilities.length !== 1
                  ? 's'
                  : ''}
              </span>

            </div>


            {availabilities.length === 0 ? (

              <div className="doctor-empty">

                <div>
                  🕐
                </div>

                <h4>
                  No availability yet
                </h4>

                <p>
                  Add your available days and times above.
                </p>

              </div>

            ) : (

              <div className="doctor-availability-list">

                {availabilities.map(
                  (availability) => (

                    <div
                      key={availability.id}
                      className="doctor-availability-card"
                    >

                      <div className="availability-day">

                        <div className="availability-icon">
                          🗓️
                        </div>

                        <div>

                          <strong>
                            {availability.day_of_week}
                          </strong>

                          <span>
                            Weekly availability
                          </span>

                        </div>

                      </div>


                      <div className="availability-time">

                        <span>
                          TIME
                        </span>

                        <strong>
                          {availability.start_time}
                          {' - '}
                          {availability.end_time}
                        </strong>

                      </div>


                      <span className="availability-badge">
                        {availability.is_available
                          ? 'Available'
                          : 'Unavailable'}
                      </span>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </section>


        {/* =================================================
            APPOINTMENTS
            ================================================= */}

        <section className="doctor-section">

          <div className="doctor-section-heading">

            <div>

              <span>
                APPOINTMENTS
              </span>

              <h2>
                My Appointments
              </h2>

              <p>
                Review and manage appointments assigned
                to you.
              </p>

            </div>

          </div>


          {appointments.length === 0 ? (

            <div className="doctor-empty">

              <div>
                📅
              </div>

              <h4>
                No appointments
              </h4>

              <p>
                You currently have no assigned appointments.
              </p>

            </div>

          ) : (

            <div className="doctor-appointments-list">

              {appointments.map(
                (appointment) => (

                  <article
                    key={appointment.id}
                    className="doctor-appointment-card"
                  >


                    <div className="doctor-appointment-header">

                      <div>

                        <span className="doctor-record-label">
                          APPOINTMENT #{appointment.id}
                        </span>

                        <h3>
                          {
                            appointment.patient?.name ||
                            'Patient'
                          }
                        </h3>

                      </div>


                      <span
                        className={getStatusClass(
                          appointment.status
                        )}
                      >
                        {appointment.status}
                      </span>

                    </div>


                    <div className="doctor-appointment-grid">


                      <div>

                        <span>
                          Patient ID
                        </span>

                        <strong>
                          {appointment.patient_id}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Appointment Type
                        </span>

                        <strong>
                          {
                            appointment.appointment_type ||
                            'Not specified'
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          Appointment Date
                        </span>

                        <strong>
                          {formatDate(
                            appointment.appointment_date
                          )}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Appointment Time
                        </span>

                        <strong>
                          {
                            appointment.appointment_time ||
                            'Not specified'
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          Patient Email
                        </span>

                        <strong>
                          {
                            appointment.patient?.email ||
                            'Not available'
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          Patient Phone
                        </span>

                        <strong>
                          {
                            appointment.patient
                              ?.contact_number ||
                            'Not available'
                          }
                        </strong>

                      </div>

                    </div>


                    <div className="doctor-appointment-actions">

                      <button
                        type="button"
                        className="doctor-approve-button"
                        onClick={() =>
                          updateAppointmentStatus(
                            appointment.id,
                            'Approved'
                          )
                        }
                        disabled={
                          appointment.status !==
                          'Pending'
                        }
                      >
                        ✓ Approve
                      </button>


                      <button
                        type="button"
                        className="doctor-reject-button"
                        onClick={() =>
                          updateAppointmentStatus(
                            appointment.id,
                            'Rejected'
                          )
                        }
                        disabled={
                          appointment.status !==
                          'Pending'
                        }
                      >
                        × Reject
                      </button>

                    </div>


                    {/* =================================================
                        CREATE MEDICAL RECORD
                        ================================================= */}

                    <div className="doctor-create-record">

                      <div className="doctor-create-record-heading">

                        <div>

                          <span>
                            PATIENT CARE
                          </span>

                          <h4>
                            Medical Record
                          </h4>

                        </div>

                      </div>


                      {recordSuccessAppointmentId ===
                        appointment.id && (

                        <div className="doctor-success-message">

                          ✓ Medical record created
                          successfully.

                        </div>

                      )}


                      {selectedAppointmentId !==
                        appointment.id ? (

                        <button
                          type="button"
                          className="doctor-record-button"
                          onClick={() => {

                            setSelectedAppointmentId(
                              appointment.id
                            );

                            setRecordSuccessAppointmentId(
                              null
                            );

                            setMedicalRecordForm({
                              diagnosis: '',
                              treatment: '',
                              prescription: '',
                              notes: '',
                            });

                          }}
                        >
                          + Create Medical Record
                        </button>

                      ) : (

                        <form
                          onSubmit={
                            createMedicalRecord
                          }
                          className="doctor-record-form"
                        >

                          <div className="doctor-record-patient">

                            Creating a medical record for

                            <strong>
                              {' '}
                              {
                                appointment.patient?.name
                              }
                            </strong>

                          </div>


                          <div className="doctor-form-field">

                            <label>
                              Diagnosis
                            </label>

                            <textarea
                              rows="3"
                              value={
                                medicalRecordForm
                                  .diagnosis
                              }
                              onChange={(event) =>
                                setMedicalRecordForm({
                                  ...medicalRecordForm,
                                  diagnosis:
                                    event.target.value,
                                })
                              }
                              placeholder="Enter diagnosis..."
                              required
                            />

                          </div>


                          <div className="doctor-form-field">

                            <label>
                              Treatment
                            </label>

                            <textarea
                              rows="3"
                              value={
                                medicalRecordForm
                                  .treatment
                              }
                              onChange={(event) =>
                                setMedicalRecordForm({
                                  ...medicalRecordForm,
                                  treatment:
                                    event.target.value,
                                })
                              }
                              placeholder="Enter treatment..."
                              required
                            />

                          </div>


                          <div className="doctor-form-field">

                            <label>
                              Prescription
                            </label>

                            <textarea
                              rows="3"
                              value={
                                medicalRecordForm
                                  .prescription
                              }
                              onChange={(event) =>
                                setMedicalRecordForm({
                                  ...medicalRecordForm,
                                  prescription:
                                    event.target.value,
                                })
                              }
                              placeholder="Enter prescription..."
                            />

                          </div>


                          <div className="doctor-form-field">

                            <label>
                              Notes
                            </label>

                            <textarea
                              rows="4"
                              value={
                                medicalRecordForm
                                  .notes
                              }
                              onChange={(event) =>
                                setMedicalRecordForm({
                                  ...medicalRecordForm,
                                  notes:
                                    event.target.value,
                                })
                              }
                              placeholder="Enter additional notes..."
                            />

                          </div>


                          <div className="doctor-record-form-actions">

                            <button
                              type="submit"
                              className="doctor-save-button"
                            >
                              ✓ Save Medical Record
                            </button>


                            <button
                              type="button"
                              className="doctor-cancel-button"
                              onClick={() => {

                                setSelectedAppointmentId(
                                  null
                                );

                                setMedicalRecordForm({
                                  diagnosis: '',
                                  treatment: '',
                                  prescription: '',
                                  notes: '',
                                });

                              }}
                            >
                              Cancel
                            </button>

                          </div>

                        </form>

                      )}

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </section>


        {/* =================================================
            MEDICAL RECORDS
            ================================================= */}

        <section className="doctor-section">

          <div className="doctor-section-heading">

            <div>

              <span>
                PATIENT CARE
              </span>

              <h2>
                Medical Records
              </h2>

              <p>
                Medical records for patients assigned
                to you.
              </p>

            </div>

          </div>


          {medicalRecordsError ? (

            <div className="doctor-error-inline">
              {medicalRecordsError}
            </div>

          ) : medicalRecords.length === 0 ? (

            <div className="doctor-empty">

              <div>
                📋
              </div>

              <h4>
                No medical records
              </h4>

              <p>
                Medical records you create will appear here.
              </p>

            </div>

          ) : (

            <div className="doctor-medical-records">

              {medicalRecords.map(
                (record) => (

                  <article
                    key={record.id}
                    className="doctor-medical-record-card"
                  >

                    <div className="doctor-medical-record-header">

                      <div>

                        <span>
                          MEDICAL RECORD #{record.id}
                        </span>

                        <h3>
                          {
                            record.diagnosis ||
                            'No diagnosis'
                          }
                        </h3>

                      </div>

                      <span className="medical-record-badge">
                        Medical Record
                      </span>

                    </div>


                    <div className="doctor-medical-record-grid">


                      <div>

                        <span>
                          Patient
                        </span>

                        <strong>
                          {
                            record.patient?.name ||
                            'Not specified'
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          Patient ID
                        </span>

                        <strong>
                          {record.patient_id}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Patient Email
                        </span>

                        <strong>
                          {
                            record.patient?.email ||
                            'Not specified'
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          Patient Phone
                        </span>

                        <strong>
                          {
                            record.patient
                              ?.contact_number ||
                            'Not specified'
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          Treatment
                        </span>

                        <strong>
                          {
                            record.treatment ||
                            'Not specified'
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          Prescription
                        </span>

                        <strong>
                          {
                            record.prescription ||
                            'Not specified'
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          Record Date
                        </span>

                        <strong>
                          {formatDate(
                            record.created_at
                          )}
                        </strong>

                      </div>

                    </div>


                    <div className="doctor-record-notes">

                      <span>
                        Notes
                      </span>

                      <p>
                        {
                          record.notes ||
                          'No additional notes.'
                        }
                      </p>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </section>


      </main>


      <DoctorDashboardStyles />

    </div>
  );
}


/* =========================================================
   DOCTOR DASHBOARD STYLES
   ========================================================= */

function DoctorDashboardStyles() {
  return (
    <style>{`

      /* ================================================
         PAGE
         ================================================ */

      .doctor-dashboard-page {
        min-height: 100vh;
        background: #f4f7fb;
      }

      .doctor-content {
        padding: 38px 42px 70px;
      }


      /* ================================================
         WELCOME
         ================================================ */

      .doctor-welcome {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 30px;
        margin-bottom: 30px;
      }

      .doctor-welcome-content {
        min-width: 0;
      }

      .doctor-eyebrow {
        display: inline-block;
        color: #087f78;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 2px;
        margin-bottom: 10px;
      }

      .doctor-welcome h1 {
        margin: 0;
        color: #0d1728;
        font-size: 32px;
        font-weight: 700;
        line-height: 1.2;
      }

      .doctor-welcome p {
        margin: 10px 0 0;
        color: #64748b;
        font-size: 15px;
        line-height: 1.6;
      }


      /* ================================================
         PROFILE CHIP
         ================================================ */

      .doctor-profile-chip {
        display: flex;
        align-items: center;
        gap: 13px;
        min-width: 250px;
        padding: 14px 18px;
        background: #ffffff;
        border: 1px solid #e4eaf1;
        border-radius: 14px;
        box-shadow: 0 4px 18px rgba(15, 23, 42, 0.05);
      }

      .doctor-profile-avatar {
        width: 48px;
        height: 48px;
        flex: 0 0 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0f827a;
        color: #ffffff;
        font-size: 19px;
        font-weight: 700;
      }

      .doctor-profile-chip strong {
        display: block;
        color: #0f172a;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .doctor-profile-chip span {
        display: block;
        color: #64748b;
        font-size: 12px;
      }


      /* ================================================
         STATISTICS
         ================================================ */

      .doctor-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 18px;
        margin-bottom: 34px;
      }

      .doctor-stat-card {
        display: flex;
        align-items: center;
        gap: 15px;
        min-height: 105px;
        padding: 20px;
        background: #ffffff;
        border: 1px solid #e4eaf1;
        border-radius: 14px;
        box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
      }

      .doctor-stat-icon {
        width: 48px;
        height: 48px;
        flex: 0 0 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #e8f7f5;
        font-size: 21px;
      }

      .doctor-stat-card span {
        display: block;
        color: #64748b;
        font-size: 12px;
        margin-bottom: 6px;
      }

      .doctor-stat-card strong {
        display: block;
        color: #0f827a;
        font-size: 25px;
        line-height: 1;
      }


      /* ================================================
         SECTIONS
         ================================================ */

      .doctor-section {
        margin-bottom: 34px;
      }

      .doctor-section-heading {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        margin-bottom: 17px;
      }

      .doctor-section-heading > div {
        width: 100%;
      }

      .doctor-section-heading span {
        display: block;
        color: #087f78;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1.8px;
        margin-bottom: 5px;
      }

      .doctor-section-heading h2 {
        margin: 0;
        color: #0f172a;
        font-size: 22px;
        font-weight: 700;
      }

      .doctor-section-heading p {
        margin: 6px 0 0;
        color: #64748b;
        font-size: 14px;
      }


      /* ================================================
         INFO CARDS
         ================================================ */

      .doctor-info-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 17px;
      }

      .doctor-info-card {
        padding: 21px;
        min-height: 105px;
        background: #ffffff;
        border: 1px solid #e4eaf1;
        border-radius: 14px;
        box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
      }

      .doctor-info-card span {
        display: block;
        color: #64748b;
        font-size: 12px;
        margin-bottom: 10px;
      }

      .doctor-info-card strong {
        display: block;
        color: #172033;
        font-size: 14px;
        line-height: 1.45;
        word-break: break-word;
      }


      /* ================================================
         PANEL
         ================================================ */

      .doctor-panel {
        background: #ffffff;
        border: 1px solid #e4eaf1;
        border-radius: 16px;
        padding: 26px;
        box-shadow: 0 5px 22px rgba(15, 23, 42, 0.04);
      }


      /* ================================================
         FORMS
         ================================================ */

      .doctor-form-grid {
        display: grid;
        grid-template-columns: 1.3fr 1fr 1fr auto;
        gap: 16px;
        align-items: end;
      }

      .doctor-form-field {
        margin-bottom: 16px;
      }

      .doctor-form-field label {
        display: block;
        color: #334155;
        font-size: 12px;
        font-weight: 700;
        margin-bottom: 8px;
      }

      .doctor-form-field input,
      .doctor-form-field select,
      .doctor-form-field textarea {
        width: 100%;
        border: 1px solid #d9e1ea;
        border-radius: 9px;
        background: #ffffff;
        color: #172033;
        padding: 12px 13px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s ease,
                    box-shadow 0.2s ease;
      }

      .doctor-form-field input,
      .doctor-form-field select {
        height: 45px;
      }

      .doctor-form-field textarea {
        min-height: 95px;
        resize: vertical;
        line-height: 1.5;
      }

      .doctor-form-field input:focus,
      .doctor-form-field select:focus,
      .doctor-form-field textarea:focus {
        border-color: #0f827a;
        box-shadow: 0 0 0 3px rgba(15, 130, 122, 0.10);
      }

      .doctor-form-action {
        margin-bottom: 16px;
      }


      /* ================================================
         BUTTONS
         ================================================ */

      .doctor-primary-button,
      .doctor-approve-button,
      .doctor-reject-button,
      .doctor-record-button,
      .doctor-save-button,
      .doctor-cancel-button {
        border: none;
        border-radius: 9px;
        min-height: 43px;
        padding: 0 18px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .doctor-primary-button {
        background: #0f827a;
        color: #ffffff;
      }

      .doctor-primary-button:hover {
        background: #096d67;
        transform: translateY(-1px);
      }

      .doctor-approve-button {
        background: #0f827a;
        color: #ffffff;
      }

      .doctor-approve-button:hover:not(:disabled) {
        background: #096d67;
      }

      .doctor-reject-button {
        background: #fff1f1;
        color: #c53b3b;
        border: 1px solid #f2caca;
      }

      .doctor-reject-button:hover:not(:disabled) {
        background: #ffe5e5;
      }

      .doctor-approve-button:disabled,
      .doctor-reject-button:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }


      /* ================================================
         DIVIDER
         ================================================ */

      .doctor-divider {
        height: 1px;
        background: #edf1f5;
        margin: 25px 0;
      }


      /* ================================================
         SUBHEADING
         ================================================ */

      .doctor-subheading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 15px;
      }

      .doctor-subheading h3 {
        margin: 0;
        color: #172033;
        font-size: 15px;
      }

      .doctor-subheading span {
        color: #64748b;
        font-size: 12px;
      }


      /* ================================================
         AVAILABILITY
         ================================================ */

      .doctor-availability-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .doctor-availability-card {
        display: grid;
        grid-template-columns: 1.5fr 1fr auto;
        align-items: center;
        gap: 20px;
        padding: 16px 18px;
        background: #f8fafc;
        border: 1px solid #e6ebf0;
        border-radius: 11px;
      }

      .availability-day {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .availability-icon {
        width: 39px;
        height: 39px;
        border-radius: 10px;
        background: #e7f6f4;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .availability-day strong {
        display: block;
        color: #172033;
        font-size: 14px;
      }

      .availability-day span {
        display: block;
        color: #64748b;
        font-size: 11px;
        margin-top: 3px;
      }

      .availability-time span {
        display: block;
        color: #94a3b8;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 1px;
        margin-bottom: 4px;
      }

      .availability-time strong {
        color: #172033;
        font-size: 13px;
      }

      .availability-badge {
        padding: 6px 11px;
        border-radius: 20px;
        background: #e6f8ed;
        color: #15803d;
        font-size: 11px;
        font-weight: 700;
      }


      /* ================================================
         APPOINTMENTS
         ================================================ */

      .doctor-appointments-list {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .doctor-appointment-card {
        background: #ffffff;
        border: 1px solid #e1e8ef;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 5px 20px rgba(15, 23, 42, 0.04);
      }

      .doctor-appointment-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 21px 24px;
        border-bottom: 1px solid #edf1f5;
        background: #fbfcfd;
      }

      .doctor-record-label {
        display: block;
        color: #087f78;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 1.5px;
        margin-bottom: 6px;
      }

      .doctor-appointment-header h3 {
        margin: 0;
        color: #172033;
        font-size: 18px;
      }

      .doctor-status {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 7px 13px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
      }

      .doctor-status-approved {
        background: #e6f8ed;
        color: #15803d;
      }

      .doctor-status-rejected {
        background: #fff0f0;
        color: #c53b3b;
      }

      .doctor-status-pending {
        background: #fff7df;
        color: #a16207;
      }

      .doctor-appointment-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1px;
        background: #edf1f5;
      }

      .doctor-appointment-grid > div {
        padding: 17px 20px;
        background: #ffffff;
      }

      .doctor-appointment-grid span,
      .doctor-medical-record-grid span {
        display: block;
        color: #64748b;
        font-size: 11px;
        margin-bottom: 6px;
      }

      .doctor-appointment-grid strong,
      .doctor-medical-record-grid strong {
        display: block;
        color: #172033;
        font-size: 13px;
        line-height: 1.45;
        word-break: break-word;
      }

      .doctor-appointment-actions {
        display: flex;
        gap: 10px;
        padding: 18px 20px;
        border-top: 1px solid #edf1f5;
      }


      /* ================================================
         CREATE MEDICAL RECORD
         ================================================ */

      .doctor-create-record {
        padding: 22px 24px 24px;
        background: #f8fafc;
        border-top: 1px solid #e7edf2;
      }

      .doctor-create-record-heading {
        margin-bottom: 15px;
      }

      .doctor-create-record-heading span {
        display: block;
        color: #087f78;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 1.4px;
        margin-bottom: 4px;
      }

      .doctor-create-record-heading h4 {
        margin: 0;
        color: #172033;
        font-size: 15px;
      }

      .doctor-record-button {
        background: #e7f6f4;
        color: #087f78;
        border: 1px solid #ccebe7;
      }

      .doctor-record-button:hover {
        background: #d8f0ed;
      }

      .doctor-record-patient {
        padding: 12px 14px;
        margin-bottom: 18px;
        background: #eef8f7;
        border-left: 3px solid #0f827a;
        border-radius: 6px;
        color: #475569;
        font-size: 13px;
      }

      .doctor-record-patient strong {
        color: #172033;
      }

      .doctor-record-form {
        max-width: 900px;
      }

      .doctor-record-form-actions {
        display: flex;
        gap: 10px;
        margin-top: 5px;
      }

      .doctor-save-button {
        background: #0f827a;
        color: #ffffff;
      }

      .doctor-save-button:hover {
        background: #096d67;
      }

      .doctor-cancel-button {
        background: #ffffff;
        color: #475569;
        border: 1px solid #d9e1ea;
      }

      .doctor-cancel-button:hover {
        background: #f1f5f9;
      }


      /* ================================================
         MEDICAL RECORDS
         ================================================ */

      .doctor-medical-records {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .doctor-medical-record-card {
        background: #ffffff;
        border: 1px solid #e1e8ef;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 5px 20px rgba(15, 23, 42, 0.04);
      }

      .doctor-medical-record-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 20px;
        padding: 22px 24px;
        background: #fbfcfd;
        border-bottom: 1px solid #edf1f5;
      }

      .doctor-medical-record-header > div > span {
        display: block;
        color: #087f78;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 1.4px;
        margin-bottom: 7px;
      }

      .doctor-medical-record-header h3 {
        margin: 0;
        color: #172033;
        font-size: 18px;
      }

      .medical-record-badge {
        padding: 7px 12px;
        border-radius: 20px;
        background: #e6f8ed;
        color: #15803d;
        font-size: 10px;
        font-weight: 700;
        white-space: nowrap;
      }

      .doctor-medical-record-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1px;
        background: #edf1f5;
      }

      .doctor-medical-record-grid > div {
        padding: 17px 20px;
        background: #ffffff;
      }

      .doctor-record-notes {
        padding: 20px 24px;
        background: #fafbfc;
        border-top: 1px solid #edf1f5;
      }

      .doctor-record-notes span {
        display: block;
        color: #64748b;
        font-size: 11px;
        font-weight: 700;
        margin-bottom: 7px;
      }

      .doctor-record-notes p {
        margin: 0;
        color: #334155;
        font-size: 13px;
        line-height: 1.6;
      }


      /* ================================================
         EMPTY / ERROR
         ================================================ */

      .doctor-empty {
        padding: 50px 25px;
        text-align: center;
        background: #ffffff;
        border: 1px dashed #d7e0e8;
        border-radius: 14px;
      }

      .doctor-empty > div {
        font-size: 30px;
        margin-bottom: 12px;
      }

      .doctor-empty h4 {
        margin: 0 0 7px;
        color: #172033;
        font-size: 16px;
      }

      .doctor-empty p {
        margin: 0;
        color: #64748b;
        font-size: 13px;
      }

      .doctor-success-message {
        padding: 12px 15px;
        margin-bottom: 16px;
        background: #e8f7ed;
        color: #15803d;
        border: 1px solid #ccebd7;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
      }

      .doctor-error-inline {
        padding: 15px;
        background: #fff1f1;
        color: #b42323;
        border: 1px solid #f2cccc;
        border-radius: 10px;
      }

      .doctor-loading {
        min-height: 55vh;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        color: #64748b;
      }

      .doctor-loading h3 {
        margin: 18px 0 5px;
        color: #172033;
        font-size: 18px;
      }

      .doctor-loading p {
        margin: 0;
        font-size: 13px;
      }

      .doctor-spinner {
        color: #0f827a;
      }

      .doctor-error {
        padding: 70px 20px;
        text-align: center;
      }

      .doctor-error-icon {
        width: 50px;
        height: 50px;
        margin: 0 auto 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: #fff0f0;
        color: #c53b3b;
        font-size: 25px;
        font-weight: 800;
      }

      .doctor-error h3 {
        margin: 0 0 8px;
        color: #172033;
      }

      .doctor-error p {
        margin: 0;
        color: #64748b;
      }


      /* ================================================
         RESPONSIVE
         ================================================ */

      @media (max-width: 1200px) {

        .doctor-stats {
          grid-template-columns: repeat(2, 1fr);
        }

        .doctor-info-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .doctor-form-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .doctor-form-action {
          margin-bottom: 0;
        }

      }


      @media (max-width: 900px) {

        .doctor-content {
          padding: 28px 22px 55px;
        }

        .doctor-welcome {
          flex-direction: column;
          align-items: stretch;
        }

        .doctor-profile-chip {
          width: 100%;
        }

        .doctor-appointment-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .doctor-medical-record-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .doctor-availability-card {
          grid-template-columns: 1fr;
        }

      }


      @media (max-width: 600px) {

        .doctor-content {
          padding: 22px 15px 45px;
        }

        .doctor-welcome h1 {
          font-size: 25px;
        }

        .doctor-stats {
          grid-template-columns: 1fr;
        }

        .doctor-info-grid {
          grid-template-columns: 1fr;
        }

        .doctor-form-grid {
          grid-template-columns: 1fr;
        }

        .doctor-appointment-grid {
          grid-template-columns: 1fr;
        }

        .doctor-medical-record-grid {
          grid-template-columns: 1fr;
        }

        .doctor-appointment-header,
        .doctor-medical-record-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .doctor-appointment-actions,
        .doctor-record-form-actions {
          flex-direction: column;
        }

        .doctor-approve-button,
        .doctor-reject-button,
        .doctor-save-button,
        .doctor-cancel-button {
          width: 100%;
        }

        .doctor-panel {
          padding: 18px;
        }

      }

    `}</style>
  );
}

export default DoctorDashboard;