import React, { useEffect, useState } from 'react';
import {
  Alert,
  Spinner,
  Button,
  Form
} from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

import Header from '../components/Header';
import Menu from '../components/Menu';

function PatientDashboard() {
  const history = useHistory();

  const [checkingAccess, setCheckingAccess] = useState(true);

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);

  const [medicalRecords, setMedicalRecords] = useState([]);
  const [medicalRecordsLoading, setMedicalRecordsLoading] = useState(true);
  const [medicalRecordsError, setMedicalRecordsError] = useState('');

  const [availabilityLoading, setAvailabilityLoading] =
    useState(false);

  const [appointmentType, setAppointmentType] =
    useState('');

  const [appointmentDate, setAppointmentDate] =
    useState('');

  const [appointmentTime, setAppointmentTime] =
    useState('');

  const [doctorId, setDoctorId] = useState('');

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const [error, setError] = useState('');
  const [bookingMessage, setBookingMessage] =
    useState('');

  const [bookingError, setBookingError] =
    useState('');


  /* =========================================
     CHECK PATIENT ACCESS
     ========================================= */

  useEffect(() => {
    const verifyPatientAccess = async () => {
      try {
        const response = await fetch('/checkSession', {
          credentials: 'include'
        });

        if (!response.ok) {
          history.replace('/login');
          return;
        }

        const user = await response.json();

        if (user.role !== 'Patient') {
          history.replace('/');
          return;
        }

        setCheckingAccess(false);

      } catch (error) {
        console.error('Patient access check failed:', error);
        history.replace('/login');
      }
    };

    verifyPatientAccess();
  }, [history]);


  /* =========================================
     LOAD PATIENT DASHBOARD DATA
     ========================================= */

  useEffect(() => {
    if (checkingAccess) {
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        const patientResponse = await fetch(
          '/current-patient',
          {
            credentials: 'include',
          }
        );

        if (!patientResponse.ok) {
          throw new Error(
            'Unable to load patient profile'
          );
        }

        const patientData =
          await patientResponse.json();

        setPatient(patientData);


        const appointmentResponse = await fetch(
          '/my-appointments',
          {
            credentials: 'include',
          }
        );

        if (!appointmentResponse.ok) {
          throw new Error(
            'Unable to load appointments'
          );
        }

        const appointmentData =
          await appointmentResponse.json();

        setAppointments(appointmentData);


        const doctorResponse = await fetch(
          '/staffs',
          {
            credentials: 'include',
          }
        );

        if (!doctorResponse.ok) {
          throw new Error(
            'Unable to load doctors'
          );
        }

        const doctorData =
          await doctorResponse.json();

        setDoctors(doctorData);


        /* =====================================
           LOAD MEDICAL RECORDS
           ===================================== */

        try {
          const medicalRecordsResponse = await fetch(
            '/medical-records',
            {
              credentials: 'include',
            }
          );

          if (!medicalRecordsResponse.ok) {
            throw new Error(
              'Unable to load medical records'
            );
          }

          const medicalRecordsData =
            await medicalRecordsResponse.json();

          setMedicalRecords(medicalRecordsData);
          setMedicalRecordsError('');

        } catch (medicalRecordError) {
          console.error(
            'Medical records loading failed:',
            medicalRecordError
          );

          setMedicalRecords([]);
          setMedicalRecordsError(
            'Unable to load your medical records.'
          );

        } finally {
          setMedicalRecordsLoading(false);
        }

        setLoading(false);

      } catch (error) {
        console.error(error);

        setError(
          'Unable to load your dashboard data.'
        );

        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [checkingAccess]);


  /* =========================================
     DOCTOR SELECTION
     ========================================= */

  const handleDoctorChange = async (event) => {
    const selectedDoctorId =
      event.target.value;

    setDoctorId(selectedDoctorId);

    setAvailabilities([]);

    setAppointmentDate('');
    setAppointmentTime('');

    setBookingError('');
    setBookingMessage('');


    if (!selectedDoctorId) {
      return;
    }


    setAvailabilityLoading(true);

    try {
      const response = await fetch(
        `/doctor-availability/${selectedDoctorId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          'Unable to load doctor availability'
        );
      }

      setAvailabilities(data);

    } catch (error) {
      console.error(error);

      setBookingError(
        'Unable to load doctor availability.'
      );

    } finally {
      setAvailabilityLoading(false);
    }
  };


  /* =========================================
     AVAILABLE DAYS
     ========================================= */

  const getAvailableDays = () => {
    return availabilities.map(
      (availability) =>
        availability.day_of_week
    );
  };


  const getSelectedDay = () => {
    if (!appointmentDate) {
      return '';
    }

    const selectedDate = new Date(
      `${appointmentDate}T00:00:00`
    );

    return selectedDate.toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
      }
    );
  };


  const getSelectedDayAvailability = () => {
    const selectedDay = getSelectedDay();

    return availabilities.find(
      (availability) =>
        availability.day_of_week === selectedDay
    );
  };


  /* =========================================
     DATE VALIDATION
     ========================================= */

  const isSelectedDateAvailable = (
    dateValue
  ) => {
    if (
      !dateValue ||
      availabilities.length === 0
    ) {
      return true;
    }

    const selectedDate = new Date(
      `${dateValue}T00:00:00`
    );

    const selectedDay =
      selectedDate.toLocaleDateString(
        'en-US',
        {
          weekday: 'long',
        }
      );

    return getAvailableDays().includes(
      selectedDay
    );
  };


  const handleDateChange = (event) => {
    const selectedDate =
      event.target.value;

    setBookingError('');
    setBookingMessage('');
    setAppointmentTime('');


    if (!selectedDate) {
      setAppointmentDate('');
      return;
    }


    if (
      !isSelectedDateAvailable(selectedDate)
    ) {
      const selectedDateObject =
        new Date(
          `${selectedDate}T00:00:00`
        );

      const selectedDay =
        selectedDateObject.toLocaleDateString(
          'en-US',
          {
            weekday: 'long',
          }
        );

      setAppointmentDate('');

      setBookingError(
        `The doctor is not available on ${selectedDay}. Please select an available day.`
      );

      return;
    }

    setAppointmentDate(selectedDate);
  };


  /* =========================================
     TIME VALIDATION
     ========================================= */

  const handleTimeChange = (event) => {
    const selectedTime =
      event.target.value;

    setBookingError('');
    setBookingMessage('');

    const availability =
      getSelectedDayAvailability();


    if (!availability) {
      setAppointmentTime('');
      return;
    }


    if (
      selectedTime <
        availability.start_time ||
      selectedTime >
        availability.end_time
    ) {
      setAppointmentTime('');

      setBookingError(
        `Please select a time between ${availability.start_time} and ${availability.end_time}.`
      );

      return;
    }

    setAppointmentTime(selectedTime);
  };


  /* =========================================
     BOOK APPOINTMENT
     ========================================= */

  const handleBooking = async (event) => {
    event.preventDefault();

    setBookingMessage('');
    setBookingError('');


    if (
      !appointmentType ||
      !appointmentDate ||
      !appointmentTime ||
      !doctorId
    ) {
      setBookingError(
        'Please complete all appointment fields.'
      );

      return;
    }


    if (
      !isSelectedDateAvailable(
        appointmentDate
      )
    ) {
      setBookingError(
        'The selected date is not available for this doctor.'
      );

      return;
    }


    const availability =
      getSelectedDayAvailability();


    if (!availability) {
      setBookingError(
        'The doctor is not available on the selected day.'
      );

      return;
    }


    if (
      appointmentTime <
        availability.start_time ||
      appointmentTime >
        availability.end_time
    ) {
      setBookingError(
        `Please select a time between ${availability.start_time} and ${availability.end_time}.`
      );

      return;
    }


    setBooking(true);

    try {
      const response = await fetch(
        '/appointments',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            appointment_type:
              appointmentType,

            appointment_date:
              appointmentDate,

            appointment_time:
              appointmentTime,

            staff_id:
              parseInt(doctorId),
          }),
        }
      );

      const data =
        await response.json();


      if (!response.ok) {
        setBookingError(
          data.error ||
          'Unable to book appointment.'
        );

        setBooking(false);

        return;
      }


      setAppointments(
        (currentAppointments) => [
          ...currentAppointments,
          data,
        ]
      );


      setBookingMessage(
        'Appointment booked successfully.'
      );


      setAppointmentType('');
      setAppointmentDate('');
      setAppointmentTime('');
      setDoctorId('');
      setAvailabilities([]);

    } catch (error) {
      console.error(error);

      setBookingError(
        'Unable to connect to the server.'
      );
    }

    setBooking(false);
  };


  /* =========================================
     APPOINTMENT STATISTICS
     ========================================= */

  const totalAppointments =
    appointments.length;

  const pendingAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === 'Pending'
    ).length;

  const approvedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === 'Approved'
    ).length;

  const rejectedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === 'Rejected'
    ).length;


  const getStatusClass = (status) => {
    if (status === 'Approved') {
      return 'patient-status patient-status-approved';
    }

    if (status === 'Rejected') {
      return 'patient-status patient-status-rejected';
    }

    return 'patient-status patient-status-pending';
  };


  /* =========================================
     ACCESS CHECK LOADING
     ========================================= */

  if (checkingAccess) {
    return (
      <div className="dashboard-page">

        <Header />
        <Menu />

        <main className="app-content">

          <div className="patient-loading">

            <Spinner animation="border" />

            <p>
              Checking your access...
            </p>

          </div>

        </main>

      </div>
    );
  }


  /* =========================================
     LOADING
     ========================================= */

  if (loading) {
    return (
      <div className="dashboard-page">

        <Header />
        <Menu />

        <main className="app-content">

          <div className="patient-loading">

            <Spinner animation="border" />

            <p>
              Loading your dashboard...
            </p>

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

        <main className="app-content">

          <Alert variant="danger">
            {error}
          </Alert>

        </main>

      </div>
    );
  }


  return (
    <div className="dashboard-page">

      <Header />

      <Menu />


      <main className="app-content">


        {/* =====================================
            DASHBOARD HEADER
            ===================================== */}

        <div className="patient-dashboard-header">

          <div>

            <span className="dashboard-eyebrow">
              PATIENT PORTAL
            </span>

            <h1>
              Welcome, {patient?.name || 'Patient'} 👋
            </h1>

            <p>
              Manage your appointments and healthcare
              information from one place.
            </p>

          </div>


          <div className="patient-profile-mini">

            <div className="patient-avatar">
              {patient?.name
                ? patient.name
                    .charAt(0)
                    .toUpperCase()
                : 'P'}
            </div>

            <div>

              <strong>
                {patient?.name || 'Patient'}
              </strong>

              <span>
                Patient
              </span>

            </div>

          </div>

        </div>


        {/* =====================================
            STATISTICS
            ===================================== */}

        <div className="dashboard-cards patient-stat-cards">


          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              📅
            </div>

            <h3>
              Total Appointments
            </h3>

            <div className="dashboard-card-number">
              {totalAppointments}
            </div>

          </div>


          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              ⏳
            </div>

            <h3>
              Pending
            </h3>

            <div className="dashboard-card-number">
              {pendingAppointments}
            </div>

          </div>


          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              ✓
            </div>

            <h3>
              Approved
            </h3>

            <div className="dashboard-card-number">
              {approvedAppointments}
            </div>

          </div>


          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              ✕
            </div>

            <h3>
              Rejected
            </h3>

            <div className="dashboard-card-number">
              {rejectedAppointments}
            </div>

          </div>

        </div>


        {/* =====================================
            PATIENT PROFILE
            ===================================== */}

        <section className="patient-panel">

          <div className="patient-panel-header">

            <div>

              <h2>
                My Profile
              </h2>

              <p>
                Your personal information
              </p>

            </div>

          </div>


          {patient && (

            <div className="patient-profile-grid">


              <div className="patient-profile-item">

                <span>
                  Patient ID
                </span>

                <strong>
                  {patient.id}
                </strong>

              </div>


              <div className="patient-profile-item">

                <span>
                  Date of Birth
                </span>

                <strong>
                  {patient.date_of_birth}
                </strong>

              </div>


              <div className="patient-profile-item">

                <span>
                  Age
                </span>

                <strong>
                  {patient.age}
                </strong>

              </div>


              <div className="patient-profile-item">

                <span>
                  Gender
                </span>

                <strong>
                  {patient.gender}
                </strong>

              </div>


              <div className="patient-profile-item">

                <span>
                  Phone
                </span>

                <strong>
                  {patient.contact_number}
                </strong>

              </div>


              <div className="patient-profile-item">

                <span>
                  Email
                </span>

                <strong>
                  {patient.email}
                </strong>

              </div>


              <div className="patient-profile-item">

                <span>
                  Username
                </span>

                <strong>
                  {patient.user?.username}
                </strong>

              </div>


            </div>

          )}

        </section>


        {/* =====================================
            BOOK APPOINTMENT
            ===================================== */}

        <section className="patient-panel">

          <div className="patient-panel-header">

            <div>

              <h2>
                Book an Appointment
              </h2>

              <p>
                Select a doctor, appointment type,
                date and available time.
              </p>

            </div>

          </div>


          {bookingMessage && (

            <Alert variant="success">
              {bookingMessage}
            </Alert>

          )}


          {bookingError && (

            <Alert variant="danger">
              {bookingError}
            </Alert>

          )}


          <Form onSubmit={handleBooking}>

            <div className="patient-booking-grid">


              {/* Doctor */}

              <div className="patient-form-field">

                <label>
                  Select Doctor
                </label>

                <select
                  value={doctorId}
                  onChange={
                    handleDoctorChange
                  }
                  required
                >

                  <option value="">
                    Select a doctor
                  </option>

                  {doctors.map(
                    (doctor) => (

                      <option
                        key={doctor.id}
                        value={doctor.id}
                      >
                        {doctor.name}
                        {' - '}
                        {doctor.specialisation}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* Appointment Type */}

              <div className="patient-form-field">

                <label>
                  Appointment Type
                </label>

                <select
                  value={appointmentType}
                  onChange={(event) =>
                    setAppointmentType(
                      event.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    Select appointment type
                  </option>

                  <option value="Doctor">
                    Doctor Consultation
                  </option>

                  <option value="Follow-up">
                    Follow-up
                  </option>

                  <option value="General Consultation">
                    General Consultation
                  </option>

                </select>

              </div>


              {/* Date */}

              <div className="patient-form-field">

                <label>
                  Appointment Date
                </label>

                <input
                  type="date"
                  value={appointmentDate}
                  min={
                    new Date()
                      .toISOString()
                      .split('T')[0]
                  }
                  onChange={handleDateChange}
                  disabled={
                    !doctorId ||
                    availabilityLoading ||
                    availabilities.length === 0
                  }
                  required
                />

                {doctorId &&
                  availabilities.length >
                    0 && (

                    <small>
                      Select a date when
                      your doctor is available.
                    </small>

                  )}

              </div>


              {/* Time */}

              <div className="patient-form-field">

                <label>
                  Appointment Time
                </label>

                <input
                  type="time"
                  value={appointmentTime}
                  min={
                    getSelectedDayAvailability()
                      ?.start_time
                  }
                  max={
                    getSelectedDayAvailability()
                      ?.end_time
                  }
                  onChange={handleTimeChange}
                  disabled={
                    !appointmentDate ||
                    !getSelectedDayAvailability()
                  }
                  required
                />

                {appointmentDate &&
                  getSelectedDayAvailability() && (

                    <small>
                      Available:
                      {' '}
                      {
                        getSelectedDayAvailability()
                          .start_time
                      }
                      {' - '}
                      {
                        getSelectedDayAvailability()
                          .end_time
                      }
                    </small>

                  )}

              </div>

            </div>


            {/* Doctor Availability */}

            {doctorId && (

              <div className="patient-availability-box">

                <div className="availability-box-header">

                  <div>

                    <h3>
                      Doctor Availability
                    </h3>

                    <p>
                      Available days and
                      appointment hours.
                    </p>

                  </div>

                </div>


                {availabilityLoading ? (

                  <div className="patient-availability-loading">

                    <Spinner
                      animation="border"
                      size="sm"
                    />

                    <span>
                      Loading availability...
                    </span>

                  </div>

                ) : availabilities.length ===
                  0 ? (

                  <Alert variant="warning">
                    This doctor has no available
                    schedule yet.
                  </Alert>

                ) : (

                  <>

                    <p className="available-days-text">

                      <strong>
                        Available days:
                      </strong>

                      {' '}

                      {getAvailableDays().join(
                        ', '
                      )}

                    </p>


                    <div className="patient-availability-grid">

                      {availabilities.map(
                        (availability) => (

                          <div
                            key={
                              availability.id
                            }
                            className="patient-availability-card"
                          >

                            <strong>
                              {
                                availability.day_of_week
                              }
                            </strong>

                            <span>
                              {
                                availability.start_time
                              }
                              {' - '}
                              {
                                availability.end_time
                              }
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  </>

                )}

              </div>

            )}


            <Button
              type="submit"
              className="patient-book-button"
              disabled={
                booking ||
                !doctorId ||
                !appointmentDate ||
                !appointmentTime ||
                availabilities.length ===
                  0
              }
            >
              {booking
                ? 'Booking...'
                : 'Book Appointment'}
            </Button>

          </Form>

        </section>


        {/* =====================================
            MY APPOINTMENTS
            ===================================== */}

        <section className="patient-panel">

          <div className="patient-panel-header">

            <div>

              <h2>
                My Appointments
              </h2>

              <p>
                View your scheduled and previous
                appointments.
              </p>

            </div>

          </div>


          {appointments.length === 0 ? (

            <div className="empty-dashboard-state">

              <div className="empty-state-icon">
                📅
              </div>

              <h3>
                No Appointments Yet
              </h3>

              <p>
                You have not booked an appointment yet.
              </p>

            </div>

          ) : (

            <div className="patient-appointments">

              {appointments.map(
                (appointment) => (

                  <div
                    className="patient-appointment-card"
                    key={appointment.id}
                  >

                    <div className="patient-appointment-header">

                      <div>

                        <span className="appointment-label">
                          APPOINTMENT #
                          {appointment.id}
                        </span>

                        <h3>
                          {
                            appointment.appointment_type
                          }
                        </h3>

                      </div>


                      <span
                        className={
                          getStatusClass(
                            appointment.status
                          )
                        }
                      >
                        {appointment.status}
                      </span>

                    </div>


                    <div className="patient-appointment-info">

                      <div>

                        <span>
                          Date
                        </span>

                        <strong>
                          {
                            appointment.appointment_date
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          Time
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
                          Appointment Type
                        </span>

                        <strong>
                          {
                            appointment.appointment_type
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          Status
                        </span>

                        <strong>
                          {
                            appointment.status
                          }
                        </strong>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* =====================================
            MEDICAL RECORDS
            ===================================== */}

        <section className="patient-panel">

          <div className="patient-panel-header">

            <div>

              <h2>
                Medical Records
              </h2>

              <p>
                View your medical history, diagnosis,
                treatment and prescriptions.
              </p>

            </div>

          </div>


          {medicalRecordsLoading ? (

            <div className="patient-loading">

              <Spinner
                animation="border"
                size="sm"
              />

              <p>
                Loading your medical records...
              </p>

            </div>

          ) : medicalRecordsError ? (

            <Alert variant="danger">
              {medicalRecordsError}
            </Alert>

          ) : medicalRecords.length === 0 ? (

            <div className="empty-dashboard-state">

              <div className="empty-state-icon">
                📋
              </div>

              <h3>
                No Medical Records Yet
              </h3>

              <p>
                Your medical records will appear here
                after a doctor adds them.
              </p>

            </div>

          ) : (

            <div className="patient-appointments">

              {medicalRecords.map(
                (record) => (

                  <div
                    className="patient-appointment-card"
                    key={record.id}
                  >

                    <div className="patient-appointment-header">

                      <div>

                        <span className="appointment-label">
                          MEDICAL RECORD #
                          {record.id}
                        </span>

                        <h3>
                          {
                            record.diagnosis ||
                            'No diagnosis'
                          }
                        </h3>

                      </div>


                      <span className="patient-status patient-status-approved">
                        Medical Record
                      </span>

                    </div>


                    <div className="patient-appointment-info">

                      <div>

                        <span>
                          Doctor
                        </span>

                        <strong>
                          {
                            record.doctor?.name ||
                            'Not specified'
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          Specialisation
                        </span>

                        <strong>
                          {
                            record.doctor?.specialisation ||
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

                    </div>


                    <div className="patient-medical-record-notes">

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


                    <div className="patient-medical-record-date">

                      <span>
                        Record Date
                      </span>

                      <strong>
                        {
                          record.created_at
                            ? new Date(
                                record.created_at
                              ).toLocaleDateString()
                            : 'Not specified'
                        }
                      </strong>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>


      </main>

    </div>
  );
}

export default PatientDashboard;