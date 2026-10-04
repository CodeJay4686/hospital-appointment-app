import React, { useEffect, useState } from 'react';

function DoctorForm() {
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [doctorData, setDoctorData] = useState({
    username: '',
    password: '',
    name: '',
    specialisation: 'Doctor',
    start_date: '',
    email: '',
    contact_number: '',
    status: 'Active',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /* =========================================
     CHECK CURRENT SESSION
     ========================================= */

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/checkSession', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(
            'Unable to verify your session.'
          );
        }

        const user = await response.json();

        setUserRole(user.role || '');
      } catch (error) {
        console.error('Session error:', error);

        setError(
          'Unable to verify your session.'
        );
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  /* =========================================
     HANDLE INPUT
     ========================================= */

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setDoctorData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  /* =========================================
     SUBMIT FORM
     ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userRole !== 'Administrator') {
      setError(
        'Only an Administrator can register a doctor.'
      );
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/staffs', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doctorData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to register doctor.'
        );
      }

      setSuccess(
        'Doctor registered successfully.'
      );

      setDoctorData({
        username: '',
        password: '',
        name: '',
        specialisation: 'Doctor',
        start_date: '',
        email: '',
        contact_number: '',
        status: 'Active',
      });
    } catch (error) {
      console.error(
        'Doctor registration error:',
        error
      );

      setError(
        error.message ||
          'Unable to register doctor.'
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
      <div className="doctor-form-loading">
        Loading doctor registration...
      </div>
    );
  }

  /* =========================================
     ADMINISTRATOR ONLY
     ========================================= */

  if (userRole !== 'Administrator') {
    return (
      <div className="doctor-form-error">
        Only Administrators can register doctors.
      </div>
    );
  }

  return (
    <div className="doctor-form-wrapper">

      {/* HEADER */}

      <div className="doctor-form-header">

        <span className="dashboard-eyebrow">
          DOCTOR MANAGEMENT
        </span>

        <h2>
          Register Doctor
        </h2>

        <p>
          Create a doctor profile and login
          account.
        </p>

      </div>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="doctor-registration-form"
      >

        {/* USERNAME */}

        <div className="doctor-form-group">

          <label htmlFor="doctor-username">
            Username
          </label>

          <input
            id="doctor-username"
            name="username"
            type="text"
            value={doctorData.username}
            onChange={handleInputChange}
            placeholder="Enter login username"
            autoComplete="off"
            required
          />

        </div>

        {/* PASSWORD */}

        <div className="doctor-form-group">

          <label htmlFor="doctor-password">
            Password
          </label>

          <input
            id="doctor-password"
            name="password"
            type="password"
            value={doctorData.password}
            onChange={handleInputChange}
            placeholder="Create login password"
            autoComplete="new-password"
            required
          />

        </div>

        {/* FULL NAME */}

        <div className="doctor-form-group">

          <label htmlFor="doctor-name">
            Full Name
          </label>

          <input
            id="doctor-name"
            name="name"
            type="text"
            value={doctorData.name}
            onChange={handleInputChange}
            placeholder="Enter doctor's full name"
            required
          />

        </div>

        {/* SPECIALISATION */}

        <div className="doctor-form-group">

          <label htmlFor="doctor-specialisation">
            Specialisation
          </label>

          <select
            id="doctor-specialisation"
            name="specialisation"
            value={doctorData.specialisation}
            onChange={handleInputChange}
            required
          >
            <option value="Doctor">
              Doctor
            </option>
          </select>

        </div>

        {/* START DATE */}

        <div className="doctor-form-group">

          <label htmlFor="doctor-start-date">
            Start Date
          </label>

          <input
            id="doctor-start-date"
            name="start_date"
            type="date"
            value={doctorData.start_date}
            onChange={handleInputChange}
            required
          />

        </div>

        {/* EMAIL */}

        <div className="doctor-form-group">

          <label htmlFor="doctor-email">
            Email Address
          </label>

          <input
            id="doctor-email"
            name="email"
            type="email"
            value={doctorData.email}
            onChange={handleInputChange}
            placeholder="doctor@example.com"
            required
          />

        </div>

        {/* CONTACT NUMBER */}

        <div className="doctor-form-group">

          <label htmlFor="doctor-contact">
            Contact Number
          </label>

          <input
            id="doctor-contact"
            name="contact_number"
            type="tel"
            value={doctorData.contact_number}
            onChange={handleInputChange}
            placeholder="Enter phone number"
            required
          />

        </div>

        {/* STATUS */}

        <div className="doctor-form-group">

          <label htmlFor="doctor-status">
            Status
          </label>

          <select
            id="doctor-status"
            name="status"
            value={doctorData.status}
            onChange={handleInputChange}
            required
          >
            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>

            <option value="On-leave">
              On Leave
            </option>
          </select>

        </div>

        {/* ERROR */}

        {error && (
          <div className="doctor-form-error">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="doctor-form-success">
            {success}
          </div>
        )}

        {/* SUBMIT */}

        <div className="doctor-form-actions">

          <button
            type="submit"
            className="doctor-submit-button"
            disabled={submitting}
          >
            {submitting
              ? 'Registering...'
              : 'Register Doctor'}
          </button>

        </div>

      </form>

    </div>
  );
}

export default DoctorForm;