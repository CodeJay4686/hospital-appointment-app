import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

function SignUp() {
  const history = useHistory();

  const [signUpData, setSignUpData] = useState({
    username: '',
    password: '',
    role: 'Patient',
    name: '',
    date_of_birth: '',
    age: '',
    gender: '',
    contact_number: '',
    email: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setSignUpData({
      ...signUpData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...signUpData,
          age: Number(signUpData.age),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed.');
        setLoading(false);
        return;
      }

      setSuccess(
        'Account created successfully. Redirecting to login...'
      );

      setTimeout(() => {
        history.push('/login');
      }, 1500);
    } catch (error) {
      console.error(error);
      setError('Unable to connect to the server.');
    }

    setLoading(false);
  };

  return (
    <div className="signup-page">
      <div className="signup-card">

        <div className="signup-header">
          <div className="signup-brand">H.A.M.S</div>

          <h1>Patient Registration</h1>

          <p>
            Create your account to access hospital
            services and manage your appointments.
          </p>
        </div>

        {error && (
          <div className="signup-alert signup-alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="signup-alert signup-alert-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="signup-form-grid">

            <div className="signup-field">
              <label htmlFor="username">
                Username
              </label>

              <input
                id="username"
                type="text"
                name="username"
                value={signUpData.username}
                onChange={handleInputChange}
                placeholder="Enter username"
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                value={signUpData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={signUpData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="date_of_birth">
                Date of Birth
              </label>

              <input
                id="date_of_birth"
                type="date"
                name="date_of_birth"
                value={signUpData.date_of_birth}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="age">
                Age
              </label>

              <input
                id="age"
                type="number"
                name="age"
                value={signUpData.age}
                onChange={handleInputChange}
                placeholder="Enter age"
                min="0"
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="gender">
                Gender
              </label>

              <select
                id="gender"
                name="gender"
                value={signUpData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="">
                  Select gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>
              </select>
            </div>

            <div className="signup-field">
              <label htmlFor="contact_number">
                Phone Number
              </label>

              <input
                id="contact_number"
                type="tel"
                name="contact_number"
                value={signUpData.contact_number}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={signUpData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                required
              />
            </div>

          </div>

          <button
            type="submit"
            className="signup-submit-button"
            disabled={loading}
          >
            {loading
              ? 'Creating Account...'
              : 'Create Account'}
          </button>

        </form>

        <div className="signup-footer">
          <span>
            Already have an account?
          </span>

          <button
            type="button"
            onClick={() => history.push('/login')}
          >
            Login
          </button>
        </div>

      </div>
    </div>
  );
}

export default SignUp;