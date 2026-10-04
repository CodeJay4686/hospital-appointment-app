import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import Header from './Header';
import Menu from './Menu';

function Login() {
  const history = useHistory();

  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid username or password');
        setLoading(false);
        return;
      }

      setLoading(false);

      if (data.role === 'Patient') {
        history.push('/patient-dashboard');
      } else if (data.role === 'Doctor') {
        history.push('/doctor-dashboard');
      } else if (data.role === 'Administrator') {
        history.push('/admin-dashboard');
      }
    } catch (error) {
      console.error(error);
      setError('Unable to connect to the server.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <Header />

      <Menu />

      <main className="app-content">

        <div className="login-wrapper">

          <div className="login-card">

            <div className="login-icon">
              ✚
            </div>

            <h1>Welcome Back</h1>

            <p className="login-subtitle">
              Sign in to access your H.A.M.S. account
            </p>

            {error && (
              <Alert variant="danger" className="login-alert">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>

              <Form.Group className="login-form-group">
                <Form.Label>Username</Form.Label>

                <Form.Control
                  className="login-input"
                  type="text"
                  name="username"
                  value={loginData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  required
                />
              </Form.Group>


              <Form.Group className="login-form-group">
                <Form.Label>Password</Form.Label>

                <Form.Control
                  className="login-input"
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
              </Form.Group>


              <Button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

            </Form>


            <div className="login-divider">
              <span>OR</span>
            </div>


            <p className="signup-text">
              Don't have an account?
            </p>

            <Button
              variant="link"
              className="signup-button"
              onClick={() => history.push('/signup')}
            >
              Create a new account
            </Button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Login;