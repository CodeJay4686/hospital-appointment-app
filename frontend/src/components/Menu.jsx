import React, { useEffect, useState } from 'react';
import { NavLink, useHistory, useLocation } from 'react-router-dom';

function Menu() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/checkSession', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setUser(null);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [location.pathname]);

  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/logout', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        setUser(null);
        history.push('/');
      } else {
        alert('Unable to log out. Please try again.');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Unable to connect to the server.');
    }
  };

  const role = user?.role;

  const isPatient = role === 'Patient';
  const isDoctor = role === 'Doctor';
  const isAdmin = role === 'Administrator';

  return (
    <aside className="hams-sidebar">

      {/* Guest Menu */}
      {!checkingSession && !user && (
        <div className="sidebar-section">
          <p className="sidebar-title">MAIN MENU</p>

          <NavLink
            to="/"
            exact
            className="sidebar-link"
            activeClassName="sidebar-link-active"
          >
            <span className="sidebar-icon">🏠</span>
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/login"
            className="sidebar-link"
            activeClassName="sidebar-link-active"
          >
            <span className="sidebar-icon">🔐</span>
            <span>Login</span>
          </NavLink>

          <NavLink
            to="/signup"
            className="sidebar-link"
            activeClassName="sidebar-link-active"
          >
            <span className="sidebar-icon">➕</span>
            <span>Create Account</span>
          </NavLink>
        </div>
      )}

      {/* Patient Menu */}
      {!checkingSession && isPatient && (
        <>
          <div className="sidebar-section">
            <p className="sidebar-title">MAIN MENU</p>

            <NavLink
              to="/patient-dashboard"
              className="sidebar-link"
              activeClassName="sidebar-link-active"
            >
              <span className="sidebar-icon">🏠</span>
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/appointments"
              className="sidebar-link"
              activeClassName="sidebar-link-active"
            >
              <span className="sidebar-icon">📅</span>
              <span>Appointments</span>
            </NavLink>

            <NavLink
              to="/staffs"
              className="sidebar-link"
              activeClassName="sidebar-link-active"
            >
              <span className="sidebar-icon">👨‍⚕️</span>
              <span>Doctors</span>
            </NavLink>
          </div>

          <div className="sidebar-section">
            <p className="sidebar-title">MY HEALTH</p>

            <NavLink
              to="/patient-dashboard"
              className="sidebar-link"
              activeClassName="sidebar-link-active"
            >
              <span className="sidebar-icon">👤</span>
              <span>My Profile</span>
            </NavLink>

            <NavLink
              to="/patient-dashboard"
              className="sidebar-link"
              activeClassName="sidebar-link-active"
            >
              <span className="sidebar-icon">📋</span>
              <span>Medical Records</span>
            </NavLink>
          </div>
        </>
      )}

      {/* Doctor Menu */}
      {!checkingSession && isDoctor && (
        <>
          <div className="sidebar-section">
            <p className="sidebar-title">MAIN MENU</p>

            <NavLink
              to="/doctor-dashboard"
              className="sidebar-link"
              activeClassName="sidebar-link-active"
            >
              <span className="sidebar-icon">🏠</span>
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/appointments"
              className="sidebar-link"
              activeClassName="sidebar-link-active"
            >
              <span className="sidebar-icon">📅</span>
              <span>Appointments</span>
            </NavLink>

            <NavLink
              to="/patients"
              className="sidebar-link"
              activeClassName="sidebar-link-active"
            >
              <span className="sidebar-icon">👥</span>
              <span>Patients</span>
            </NavLink>
          </div>

          <div className="sidebar-section">
            <p className="sidebar-title">MANAGEMENT</p>

            <NavLink
              to="/doctor-dashboard"
              className="sidebar-link"
              activeClassName="sidebar-link-active"
            >
              <span className="sidebar-icon">🕐</span>
              <span>Availability</span>
            </NavLink>

            <NavLink
              to="/doctor-dashboard"
              className="sidebar-link"
              activeClassName="sidebar-link-active"
            >
              <span className="sidebar-icon">📋</span>
              <span>Medical Records</span>
            </NavLink>
          </div>
        </>
      )}

      {/* Administrator Menu */}
      {!checkingSession && isAdmin && (
        <>
          <div className="sidebar-section">
            <p className="sidebar-title">MAIN MENU</p>

            <NavLink
              to="/admin-dashboard"
              className="sidebar-link"
              activeClassName="sidebar-link-active"
            >
              <span className="sidebar-icon">🏠</span>
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/patients"
              className="sidebar-link"
              activeClassName="sidebar-link-active"
            >
              <span className="sidebar-icon">👥</span>
              <span>Patients</span>
            </NavLink>

            <NavLink
              to="/staffs"
              className="sidebar-link"
              activeClassName="sidebar-link-active"
            >
              <span className="sidebar-icon">👨‍⚕️</span>
              <span>Doctors</span>
            </NavLink>

            <NavLink
              to="/appointments"
              className="sidebar-link"
              activeClassName="sidebar-link-active"
            >
              <span className="sidebar-icon">📅</span>
              <span>Appointments</span>
            </NavLink>
          </div>

          <div className="sidebar-section">
            <p className="sidebar-title">ADMINISTRATION</p>

            <NavLink
              to="/admin-dashboard"
              className="sidebar-link"
              activeClassName="sidebar-link-active"
            >
              <span className="sidebar-icon">⚙️</span>
              <span>Administration</span>
            </NavLink>
          </div>
        </>
      )}

      {/* Logout */}
      {!checkingSession && user && (
        <div className="sidebar-bottom">
          <button
            type="button"
            className="sidebar-link logout-link"
            onClick={handleLogout}
          >
            <span className="sidebar-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      )}

    </aside>
  );
}

export default Menu;