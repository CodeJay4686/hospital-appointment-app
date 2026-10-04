import './App.css';
import Login from './components/Login';
import PatientTable from './components/PatientTable';
import DoctorTable from './components/DoctorTable';
import PatientDashboard from './pages/PatientDashboard';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Patients from './pages/Patients';
import Doctor from './pages/Doctor';
import Appointment from './pages/Appointment';
import DoctorDashboard from './pages/DoctorDashboard';
import SignUp from './components/Signup';
import AppointmentTableID from './components/AppointmentTableID';
import Home from './components/Home';
import AppointmentEditForm from './components/AppointmentEditForm';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Switch>

          <Route exact path="/">
            <Home />
          </Route>

          <Route path="/patient-dashboard">
            <PatientDashboard />
          </Route>

          <Route path="/doctor-dashboard">
            <DoctorDashboard />
          </Route>

          <Route path="/admin-dashboard">
            <AdminDashboard />
          </Route>

          <Route path="/patients/:id">
            <PatientTable />
          </Route>

          <Route path="/patients">
            <Patients />
          </Route>

          <Route exact path="/appointments/:id/edit">
            <AppointmentEditForm />
          </Route>

          <Route path="/staffs/:id">
            <DoctorTable />
          </Route>

          <Route path="/staffs">
            <Doctor />
          </Route>

          <Route path="/appointments/:id">
            <AppointmentTableID />
          </Route>

          <Route path="/appointments">
            <Appointment />
          </Route>

          <Route path="/login">
            <Login />
          </Route>

          <Route path="/logout">
            {/* <Logout /> */}
          </Route>

          <Route path="/signup">
            <SignUp />
          </Route>

        </Switch>
      </div>
    </BrowserRouter>
  );
}

export default App;