import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Header from '../components/Header';
import Menu from '../components/Menu';

function AdminDashboard() {
  const history = useHistory();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const [patientsResponse, doctorsResponse, appointmentsResponse] =
        await Promise.all([
          fetch('/patients', { credentials: 'include' }),
          fetch('/staffs', { credentials: 'include' }),
          fetch('/appointments', { credentials: 'include' }),
        ]);

      if (!patientsResponse.ok) {
        throw new Error('Unable to load patients');
      }

      if (!doctorsResponse.ok) {
        throw new Error('Unable to load doctors');
      }

      if (!appointmentsResponse.ok) {
        throw new Error('Unable to load appointments');
      }

      const patientsData = await patientsResponse.json();
      const doctorsData = await doctorsResponse.json();
      const appointmentsData = await appointmentsResponse.json();

      setPatients(Array.isArray(patientsData) ? patientsData : []);
      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
      setAppointments(
        Array.isArray(appointmentsData) ? appointmentsData : []
      );
    } catch (err) {
      console.error('Admin dashboard error:', err);
      setError(
        err.message || 'Unable to load administrator dashboard data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        const response = await fetch('/checkSession', {
          credentials: 'include',
        });

        if (!response.ok) {
          history.replace('/login');
          return;
        }

        const user = await response.json();

        if (user.role !== 'Administrator') {
          history.replace('/');
          return;
        }

        setCheckingAccess(false);
        loadDashboardData();
      } catch (error) {
        console.error('Access verification failed:', error);
        history.replace('/login');
      }
    };

    verifyAdminAccess();
  }, [history]);

  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === 'Pending'
  );

  const approvedAppointments = appointments.filter(
    (appointment) => appointment.status === 'Approved'
  );

  const rejectedAppointments = appointments.filter(
    (appointment) => appointment.status === 'Rejected'
  );

  const deletePatient = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this patient?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/patients/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Unable to delete patient.');
        return;
      }

      setPatients((currentPatients) =>
        currentPatients.filter((patient) => patient.id !== id)
      );

      alert('Patient deleted successfully.');
    } catch (err) {
      console.error(err);
      alert('Unable to connect to the server.');
    }
  };

  const deleteDoctor = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this doctor?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/staffs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Unable to delete doctor.');
        return;
      }

      setDoctors((currentDoctors) =>
        currentDoctors.filter((doctor) => doctor.id !== id)
      );

      alert('Doctor deleted successfully.');
    } catch (err) {
      console.error(err);
      alert('Unable to connect to the server.');
    }
  };

    if (checkingAccess) {
    return (
      <div className="dashboard-page">
        <Header />
        <Menu />

        <main className="app-content">
          <div className="admin-loading">
            <div className="admin-loading-icon">✚</div>
            <h2>Checking access...</h2>
            <p>Please wait.</p>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <Header />
        <Menu />

        <main className="app-content">
          <div className="admin-loading">
            <div className="admin-loading-icon">✚</div>
            <h2>Loading Administrator Dashboard...</h2>
            <p>Please wait while we load the hospital data.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Header />
      <Menu />

      <main className="app-content">
        <div className="admin-dashboard">

          {/* Header */}
          <section className="admin-dashboard-header">
            <div>
              <span className="dashboard-eyebrow">
                ADMINISTRATOR PORTAL
              </span>

              <h1>Hospital Administration</h1>

              <p>
                Manage patients, doctors, appointments and hospital
                operations from one place.
              </p>
            </div>

            <button
              className="admin-refresh-button"
              onClick={loadDashboardData}
            >
              ↻ Refresh Data
            </button>
          </section>

          {error && (
            <div className="admin-error">
              {error}
            </div>
          )}

          {/* Statistics */}
          <section className="admin-stats-grid">

            <div className="admin-stat-card">
              <div className="admin-stat-icon">👥</div>
              <div>
                <span>Total Patients</span>
                <strong>{patients.length}</strong>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon">👨‍⚕️</div>
              <div>
                <span>Total Doctors</span>
                <strong>{doctors.length}</strong>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon">📅</div>
              <div>
                <span>Total Appointments</span>
                <strong>{appointments.length}</strong>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon">⏳</div>
              <div>
                <span>Pending Appointments</span>
                <strong>{pendingAppointments.length}</strong>
              </div>
            </div>

          </section>

          {/* Appointment Overview */}
          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Appointment Overview</h2>
                <p>Current appointment activity in the hospital.</p>
              </div>

              <span className="admin-count-badge">
                {appointments.length} Total
              </span>
            </div>

            <div className="admin-appointment-summary">

              <div className="admin-summary-box pending">
                <span>Pending</span>
                <strong>{pendingAppointments.length}</strong>
              </div>

              <div className="admin-summary-box approved">
                <span>Approved</span>
                <strong>{approvedAppointments.length}</strong>
              </div>

              <div className="admin-summary-box rejected">
                <span>Rejected</span>
                <strong>{rejectedAppointments.length}</strong>
              </div>

            </div>
          </section>

          {/* Patients */}
          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Patient Management</h2>
                <p>View and manage registered patients.</p>
              </div>

              <span className="admin-count-badge">
                {patients.length} Patients
              </span>
            </div>

            {patients.length === 0 ? (
              <div className="admin-empty-state">
                <div>👥</div>
                <h3>No patients found</h3>
                <p>There are currently no registered patients.</p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Gender</th>
                      <th>Age</th>
                      <th>Contact</th>
                      <th>Email</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient.id}>
                        <td>#{patient.id}</td>
                        <td>{patient.name || 'N/A'}</td>
                        <td>{patient.gender || 'N/A'}</td>
                        <td>{patient.age || 'N/A'}</td>
                        <td>{patient.contact_number || 'N/A'}</td>
                        <td>{patient.email || 'N/A'}</td>
                        <td>
                          <button
                            className="admin-delete-button"
                            onClick={() => deletePatient(patient.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Doctors */}
          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Doctor Management</h2>
                <p>View and manage hospital doctors.</p>
              </div>

              <span className="admin-count-badge">
                {doctors.length} Doctors
              </span>
            </div>

            {doctors.length === 0 ? (
              <div className="admin-empty-state">
                <div>👨‍⚕️</div>
                <h3>No doctors found</h3>
                <p>There are currently no doctors registered.</p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Specialisation</th>
                      <th>Contact</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {doctors.map((doctor) => (
                      <tr key={doctor.id}>
                        <td>#{doctor.id}</td>
                        <td>{doctor.name || 'N/A'}</td>
                        <td>
                          {doctor.specialisation || 'N/A'}
                        </td>
                        <td>
                          {doctor.contact_number || 'N/A'}
                        </td>
                        <td>{doctor.email || 'N/A'}</td>
                        <td>
                          <span
                            className={`admin-status ${
                              doctor.status === 'Active'
                                ? 'active'
                                : 'inactive'
                            }`}
                          >
                            {doctor.status || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="admin-delete-button"
                            onClick={() => deleteDoctor(doctor.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Recent Appointments */}
          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Recent Appointments</h2>
                <p>Overview of appointments registered in the system.</p>
              </div>
            </div>

            {appointments.length === 0 ? (
              <div className="admin-empty-state">
                <div>📅</div>
                <h3>No appointments found</h3>
                <p>There are currently no appointments.</p>
              </div>
            ) : (
              <div className="admin-appointment-list">
                {appointments
                  .slice()
                  .reverse()
                  .slice(0, 8)
                  .map((appointment) => (
                    <div
                      className="admin-appointment-row"
                      key={appointment.id}
                    >
                      <div className="admin-appointment-main">
                        <strong>
                          Appointment #{appointment.id}
                        </strong>

                        <span>
                          {appointment.appointment_type ||
                            'General Appointment'}
                        </span>
                      </div>

                      <div className="admin-appointment-date">
                        <span>
                          {appointment.appointment_date || 'No date'}
                        </span>

                        <small>
                          {appointment.appointment_time || 'No time'}
                        </small>
                      </div>

                      <span
                        className={`admin-status-pill ${
                          appointment.status === 'Approved'
                            ? 'approved'
                            : appointment.status === 'Rejected'
                            ? 'rejected'
                            : 'pending'
                        }`}
                      >
                        {appointment.status || 'Pending'}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </section>

          {/* System Overview */}
          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>System Overview</h2>
                <p>Hospital management system modules.</p>
              </div>
            </div>

            <div className="admin-system-grid">

              <div className="admin-system-card">
                <div className="admin-system-icon">👥</div>
                <div>
                  <h3>Patients</h3>
                  <p>
                    Manage registered patient information and accounts.
                  </p>
                </div>
              </div>

              <div className="admin-system-card">
                <div className="admin-system-icon">👨‍⚕️</div>
                <div>
                  <h3>Doctors</h3>
                  <p>
                    Manage doctors and their professional information.
                  </p>
                </div>
              </div>

              <div className="admin-system-card">
                <div className="admin-system-icon">📅</div>
                <div>
                  <h3>Appointments</h3>
                  <p>
                    Monitor hospital appointment activity and status.
                  </p>
                </div>
              </div>

              <div className="admin-system-card">
                <div className="admin-system-icon">📋</div>
                <div>
                  <h3>Medical Records</h3>
                  <p>
                    Medical records are maintained by doctors through
                    the clinical workflow.
                  </p>
                </div>
              </div>

            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;