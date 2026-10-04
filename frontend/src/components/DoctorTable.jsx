import React, { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';

function DoctorTable() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/staffs', {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Unable to load doctors.'
        );
      }

      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        'Doctor loading error:',
        error
      );

      setError(
        error.message ||
          'Unable to load doctors.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="doctor-table-message">
        Loading doctors...
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-table-error">
        {error}
      </div>
    );
  }

  return (
    <div className="doctor-table-wrapper">

      {/* TABLE HEADER */}

      <div className="doctor-table-header">

        <div>
          <span className="appointment-section-label">
            DOCTOR RECORDS
          </span>

          <h2>
            Registered Doctors
          </h2>
        </div>

        <span className="doctor-count">
          {doctors.length}{' '}
          {doctors.length === 1
            ? 'Doctor'
            : 'Doctors'}
        </span>

      </div>

      {/* EMPTY STATE */}

      {doctors.length === 0 ? (
        <div className="doctor-table-message">
          No doctors have been registered yet.
        </div>
      ) : (

        <div className="doctor-table-scroll">

          <Table
            striped
            bordered
            hover
            className="doctors-table"
          >

            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Specialisation</th>
                <th>Start Date</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {doctors.map((doctor) => (

                <tr key={doctor.id}>

                  <td>
                    {doctor.id}
                  </td>

                  <td>
                    <span className="doctor-name">
                      {doctor.name}
                    </span>
                  </td>

                  <td>
                    {doctor.specialisation || '-'}
                  </td>

                  <td>
                    {doctor.start_date || '-'}
                  </td>

                  <td>
                    {doctor.email || '-'}
                  </td>

                  <td>
                    {doctor.contact_number || '-'}
                  </td>

                  <td>
                    <span
                      className={`doctor-status ${
                        doctor.status
                          ? doctor.status
                              .toLowerCase()
                              .replace(/\s+/g, '-')
                          : 'inactive'
                      }`}
                    >
                      {doctor.status || 'Inactive'}
                    </span>
                  </td>

                </tr>

              ))}

            </tbody>

          </Table>

        </div>

      )}

    </div>
  );
}

export default DoctorTable;