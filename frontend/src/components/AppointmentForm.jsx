import React, { useEffect, useState } from 'react';

function AppointmentForm() {
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [staffs, setStaffs] = useState([]);
  const [patients, setPatients] = useState([]);

  const [staffId, setStaffId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /* =========================================
     CHECK CURRENT USER
     ========================================= */

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch('/checkSession', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Unable to verify your session');
        }

        const user = await response.json();

        setUserRole(user.role || '');

      } catch (error) {
        console.error('Session error:', error);
        setError('Unable to verify your session.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /* =========================================
     LOAD DOCTORS
     ========================================= */

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('/staffs', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Unable to load doctors');
        }

        const data = await response.json();

        setStaffs(
          Array.isArray(data) ? data : []
        );

      } catch (error) {
        console.error('Doctor loading error:', error);
        setError('Unable to load doctors.');
      }
    };

    if (
      userRole === 'Patient' ||
      userRole === 'Administrator'
    ) {
      fetchDoctors();
    }
  }, [userRole]);

  /* =========================================
     LOAD PATIENTS
     ADMIN ONLY
     ========================================= */

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/patients', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Unable to load patients');
        }

        const data = await response.json();

        setPatients(
          Array.isArray(data) ? data : []
        );

      } catch (error) {
        console.error('Patient loading error:', error);
        setError('Unable to load patients.');
      }
    };

    if (userRole === 'Administrator') {
      fetchPatients();
    }
  }, [userRole]);

  /* =========================================
     SUBMIT APPOINTMENT
     ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const formData = {
        staff_id: parseInt(staffId, 10),
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        appointment_type: appointmentType,
      };

      /*
       * Administrator can select a patient.
       *
       * Patient does NOT send patient_id.
       * The backend identifies the logged-in patient
       * from the session.
       */

      if (userRole === 'Administrator') {
        formData.patient_id = parseInt(
          patientId,
          10
        );
      }

      const response = await fetch('/appointments', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          'Unable to book appointment'
        );
      }

      setSuccess(
        'Appointment booked successfully.'
      );

      setStaffId('');
      setPatientId('');
      setAppointmentDate('');
      setAppointmentTime('');
      setAppointmentType('');

    } catch (error) {
      console.error(
        'Appointment booking error:',
        error
      );

      setError(
        error.message ||
        'Unable to book appointment.'
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
      <div className="appointment-form-loading">
        Loading appointment form...
      </div>
    );
  }

  /* =========================================
     DOCTOR
     ========================================= */

  if (userRole === 'Doctor') {
    return null;
  }

  /* =========================================
     FORM
     ========================================= */

  return (
    <div className="appointment-form-wrapper">

      <div className="appointment-form-heading">

        <span className="appointment-section-label">
          APPOINTMENT SCHEDULING
        </span>

        <h2>
          Book Appointment
        </h2>

        <p>
          {userRole === 'Patient'
            ? 'Schedule an appointment with an available doctor.'
            : 'Create an appointment for a patient.'}
        </p>

      </div>

      <form
        onSubmit={handleSubmit}
        className="appointment-form"
      >

        {/* ADMIN PATIENT SELECTION */}

        {userRole === 'Administrator' && (
          <div className="appointment-form-group">

            <label htmlFor="appointment-patient">
              Patient
            </label>

            <select
              id="appointment-patient"
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
        )}

        {/* DOCTOR */}

        <div className="appointment-form-group">

          <label htmlFor="appointment-doctor">
            Doctor
          </label>

          <select
            id="appointment-doctor"
            value={staffId}
            onChange={(e) =>
              setStaffId(e.target.value)
            }
            required
          >

            <option value="">
              Select doctor
            </option>

            {staffs.map((staff) => (
              <option
                key={staff.id}
                value={staff.id}
              >
                {staff.name}
                {staff.specialisation
                  ? ` — ${staff.specialisation}`
                  : ''}
              </option>
            ))}

          </select>

        </div>

        {/* APPOINTMENT TYPE */}

        <div className="appointment-form-group">

          <label htmlFor="appointment-type">
            Appointment Type
          </label>

          <select
            id="appointment-type"
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

        <div className="appointment-form-group">

          <label htmlFor="appointment-date">
            Appointment Date
          </label>

          <input
            id="appointment-date"
            type="date"
            value={appointmentDate}
            onChange={(e) =>
              setAppointmentDate(e.target.value)
            }
            required
          />

        </div>

        {/* TIME */}

        <div className="appointment-form-group">

          <label htmlFor="appointment-time">
            Appointment Time
          </label>

          <input
            id="appointment-time"
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
          <div className="appointment-form-error">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="appointment-form-success">
            {success}
          </div>
        )}

        {/* SUBMIT */}

        <div className="appointment-form-actions">

          <button
            type="submit"
            className="appointment-book-button"
            disabled={submitting}
          >
            {submitting
              ? 'Booking...'
              : 'Book Appointment'}
          </button>

        </div>

      </form>

    </div>
  );
}

export default AppointmentForm;