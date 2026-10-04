import React, { useEffect, useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function AppointmentTable() {
  const [appointments, setAppointments] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /*
   * =========================================
   * LOAD CURRENT USER AND APPOINTMENTS
   * =========================================
   */

  useEffect(() => {
  fetchAppointments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');

    try {
      /*
       * First check the logged-in user's role.
       */

      const sessionResponse = await fetch('/checkSession', {
        credentials: 'include',
      });

      if (!sessionResponse.ok) {
        throw new Error('Unable to verify your session');
      }

      const currentUser = await sessionResponse.json();

      setUserRole(currentUser.role || '');

      let endpoint = '';

      /*
       * PATIENT
       * Only their own appointments.
       */

      if (currentUser.role === 'Patient') {
        endpoint = '/my-appointments';
      }

      /*
       * DOCTOR
       * Only appointments assigned to that doctor.
       */

      else if (currentUser.role === 'Doctor') {
        endpoint = '/my-doctor-appointments';
      }

      /*
       * ADMINISTRATOR
       * Can view all appointments.
       */

      else if (currentUser.role === 'Administrator') {
        endpoint = '/appointments';
      }

      else {
        throw new Error(
          'You are not authorized to view appointments.'
        );
      }

      const response = await fetch(endpoint, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(
          'Unable to load appointments'
        );
      }

      const data = await response.json();

      setAppointments(
        Array.isArray(data) ? data : []
      );

    } catch (error) {
      console.error(
        'Appointment loading error:',
        error
      );

      setError(
        error.message ||
        'Unable to load appointments.'
      );

    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================
   * DELETE APPOINTMENT
   * ADMIN ONLY
   * =========================================
   */

  const handleDelete = async (id) => {
    if (userRole !== 'Administrator') {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this appointment?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/appointments/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          'Unable to delete appointment'
        );
      }

      setAppointments((currentAppointments) =>
        currentAppointments.filter(
          (appointment) =>
            appointment.id !== id
        )
      );

    } catch (error) {
      console.error(
        'Delete appointment error:',
        error
      );

      alert(
        error.message ||
        'Unable to delete appointment.'
      );
    }
  };

  /*
   * =========================================
   * APPROVE / REJECT APPOINTMENT
   * DOCTOR ONLY
   * =========================================
   */

  const updateAppointmentStatus = async (
    id,
    status
  ) => {
    if (userRole !== 'Doctor') {
      return;
    }

    try {
      const response = await fetch(
        `/appointments/${id}/status`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          `Unable to ${status.toLowerCase()} appointment`
        );
      }

      /*
       * Update the appointment locally
       * without refreshing the entire page.
       */

      setAppointments((currentAppointments) =>
        currentAppointments.map(
          (appointment) =>
            appointment.id === id
              ? {
                  ...appointment,
                  status,
                }
              : appointment
        )
      );

    } catch (error) {
      console.error(
        'Appointment status error:',
        error
      );

      alert(
        error.message ||
        'Unable to update appointment.'
      );
    }
  };

  /*
   * =========================================
   * LOADING
   * =========================================
   */

  if (loading) {
    return (
      <div className="appointment-table-message">
        Loading appointments...
      </div>
    );
  }

  /*
   * =========================================
   * ERROR
   * =========================================
   */

  if (error) {
    return (
      <div className="appointment-table-error">
        {error}
      </div>
    );
  }

  /*
   * =========================================
   * EMPTY STATE
   * =========================================
   */

  if (appointments.length === 0) {
    return (
      <div className="appointment-table-message">
        {userRole === 'Patient'
          ? 'You do not have any appointments yet.'
          : userRole === 'Doctor'
          ? 'You do not have any assigned appointments yet.'
          : 'There are no appointments in the system.'}
      </div>
    );
  }

  /*
   * =========================================
   * TABLE
   * =========================================
   */

  return (
    <div className="appointment-table-wrapper">

      <div className="appointment-table-header">
        <div>
          <span className="appointment-section-label">
            APPOINTMENT RECORDS
          </span>

          <h2>
            {userRole === 'Patient'
              ? 'My Appointments'
              : userRole === 'Doctor'
              ? 'Assigned Appointments'
              : 'All Appointments'}
          </h2>
        </div>

        <span className="appointment-count">
          {appointments.length}{' '}
          {appointments.length === 1
            ? 'Appointment'
            : 'Appointments'}
        </span>
      </div>

      <div className="appointment-table-scroll">

        <Table
          striped
          bordered
          hover
          responsive
          className="appointments-table"
        >

          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>

              <th>Patient</th>

              <th>Doctor</th>

              <th>Status</th>

              {userRole === 'Doctor' && (
                <th>Action</th>
              )}

              {userRole === 'Administrator' && (
                <>
                  <th>View</th>
                  <th>Update</th>
                  <th>Delete</th>
                </>
              )}

              {userRole === 'Patient' && (
                <th>View</th>
              )}

            </tr>
          </thead>

          <tbody>

            {appointments.map((appointment) => (

              <tr key={appointment.id}>

                <td>
                  {appointment.id}
                </td>

                <td>
                  {appointment.appointment_date || '-'}
                </td>

                <td>
                  {appointment.appointment_time || '-'}
                </td>

                <td>
                  {appointment.appointment_type || '-'}
                </td>

                <td>
                  {appointment.patient?.name || '-'}
                </td>

                <td>
                  {appointment.staff?.name || '-'}
                </td>

                <td>
                  <span
                    className={`appointment-status ${
                      appointment.status
                        ? appointment.status
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                        : 'pending'
                    }`}
                  >
                    {appointment.status || 'Pending'}
                  </span>
                </td>

                {/* DOCTOR ACTIONS */}

                {userRole === 'Doctor' && (
                  <td>

                    {appointment.status === 'Pending' ? (
                      <div className="appointment-action-buttons">

                        <Button
                          variant="success"
                          size="sm"
                          onClick={() =>
                            updateAppointmentStatus(
                              appointment.id,
                              'Approved'
                            )
                          }
                        >
                          Approve
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            updateAppointmentStatus(
                              appointment.id,
                              'Rejected'
                            )
                          }
                        >
                          Reject
                        </Button>

                      </div>
                    ) : (
                      <span className="appointment-action-complete">
                        No action
                      </span>
                    )}

                  </td>
                )}

                {/* ADMIN ACTIONS */}

                {userRole === 'Administrator' && (
                  <>
                    <td>
                      <Link
                        to={`/appointments/${appointment.id}`}
                        className="appointment-view-link"
                      >
                        View
                      </Link>
                    </td>

                    <td>
                      <Link
                        to={`/appointments/${appointment.id}/edit`}
                        className="appointment-update-link"
                      >
                        Update
                      </Link>
                    </td>

                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          handleDelete(
                            appointment.id
                          )
                        }
                      >
                        Delete
                      </Button>
                    </td>
                  </>
                )}

                {/* PATIENT VIEW */}

                {userRole === 'Patient' && (
                  <td>
                    <Link
                      to={`/appointments/${appointment.id}`}
                      className="appointment-view-link"
                    >
                      View
                    </Link>
                  </td>
                )}

              </tr>

            ))}

          </tbody>

        </Table>

      </div>

    </div>
  );
}

export default AppointmentTable;