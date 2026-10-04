import React, { useEffect, useState } from 'react';
import { Container, Table } from 'react-bootstrap';

function PatientTable() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError('');

    try {
      // Check the current logged-in user
      const sessionResponse = await fetch('/checkSession', {
        credentials: 'include',
      });

      if (!sessionResponse.ok) {
        throw new Error('Unable to verify your session');
      }

      const currentUser = await sessionResponse.json();

      // =========================================
      // DOCTOR
      // =========================================

      if (currentUser.role === 'Doctor') {
        const appointmentsResponse = await fetch(
          '/my-doctor-appointments',
          {
            credentials: 'include',
          }
        );

        if (!appointmentsResponse.ok) {
          throw new Error(
            'Unable to load your assigned appointments'
          );
        }

        const appointments = await appointmentsResponse.json();

        // Get unique patient IDs from the doctor's appointments
        const patientIds = [
          ...new Set(
            appointments
              .map((appointment) => appointment.patient_id)
              .filter((id) => id !== null && id !== undefined)
          ),
        ];

        // No patients assigned
        if (patientIds.length === 0) {
          setPatients([]);
          return;
        }

        // Get only the patients assigned to this doctor
        const patientRequests = patientIds.map(
          async (patientId) => {
            const response = await fetch(
              `/patients/${patientId}`,
              {
                credentials: 'include',
              }
            );

            if (!response.ok) {
              return null;
            }

            return await response.json();
          }
        );

        const patientResults =
          await Promise.all(patientRequests);

        const validPatients = patientResults.filter(
          (patient) => patient !== null
        );

        setPatients(validPatients);

        return;
      }

      // =========================================
      // ADMINISTRATOR
      // =========================================

      if (currentUser.role === 'Administrator') {
        const response = await fetch('/patients', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(
            'Unable to load patient records'
          );
        }

        const data = await response.json();

        setPatients(
          Array.isArray(data) ? data : []
        );

        return;
      }

      // Any other role
      setPatients([]);

    } catch (error) {
      console.error(
        'Error loading patients:',
        error
      );

      setError(
        error.message ||
        'Unable to load patients'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-table-container">

      <Container className="table-container">

        {loading && (
          <div className="patient-table-message">
            Loading patients...
          </div>
        )}

        {!loading && error && (
          <div className="patient-table-error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          patients.length === 0 && (
            <div className="patient-table-message">
              No patients have been assigned to you yet.
            </div>
          )}

        {!loading &&
          !error &&
          patients.length > 0 && (

          <Table
            striped
            bordered
            hover
            responsive
            className="patients-table"
          >

            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Date of Birth</th>
                <th>Phone Number</th>
                <th>E-mail</th>
                <th>Age</th>
              </tr>
            </thead>

            <tbody>

              {patients.map((patient) => (

                <tr key={patient.id}>

                  <td>
                    {patient.id}
                  </td>

                  <td>
                    {patient.name}
                  </td>

                  <td>
                    {patient.date_of_birth}
                  </td>

                  <td>
                    {patient.contact_number}
                  </td>

                  <td>
                    {patient.email}
                  </td>

                  <td>
                    {patient.age}
                  </td>

                </tr>

              ))}

            </tbody>

          </Table>

        )}

      </Container>

    </div>
  );
}

export default PatientTable;