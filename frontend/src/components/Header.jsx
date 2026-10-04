import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
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
        console.error('Unable to load user session:', error);
        setUser(null);
      }
    };

    loadUser();
  }, []);

  const getDisplayName = () => {
    if (!user) {
      return 'User';
    }

    if (user.role === 'Administrator') {
      return 'Admin';
    }

    if (user.role === 'Doctor') {
      return user.username || 'Doctor';
    }

    if (user.role === 'Patient') {
      return user.username || 'Patient';
    }

    return 'User';
  };

  const getRoleName = () => {
    if (!user) {
      return 'Hospital User';
    }

    return user.role || 'Hospital User';
  };

  return (
    <header className="hams-header">

      <div className="hams-logo">
        <Link to="/">
          <span className="logo-icon">✚</span>
          <span>H.A.M.S</span>
        </Link>
      </div>

      <div className="header-title">
        <span>Hospital Appointment Management System</span>
      </div>

      <div className="header-actions">

        <button
          className="notification-btn"
          title="Notifications"
          type="button"
        >
          🔔
        </button>

        <div className="header-user">

          <div className="user-avatar">
            {getDisplayName().charAt(0).toUpperCase()}
          </div>

          <div className="user-info">
            <span className="user-name">
              {getDisplayName()}
            </span>

            <span className="user-role">
              {getRoleName()}
            </span>
          </div>

        </div>

      </div>

    </header>
  );
}

export default Header;