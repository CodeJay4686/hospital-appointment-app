#!/usr/bin/env python3

from flask import Flask, make_response, request, jsonify, render_template, session, abort
from flask_migrate import Migrate
from flask_cors import CORS
from datetime import datetime
from flask_restful import Api, Resource
from werkzeug.exceptions import NotFound
from werkzeug.security import generate_password_hash, check_password_hash
import os

from dotenv import load_dotenv
load_dotenv()

from models import (
    db,
    Patient,
    Staff,
    Appointment,
    User,
    DoctorAvailability,
    MedicalRecord
)


app = Flask(
    __name__,
    static_url_path='',
    static_folder='../frontend/build',
    template_folder='../frontend/build'
)

app.config['SECRET_KEY'] = os.environ.get(
    'SECRET_KEY',
    'dev-secret-key-change-later'
)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Session settings for production
if os.environ.get('RENDER'):
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'
    app.config['SESSION_COOKIE_SECURE'] = True
else:
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False


migrate = Migrate(app, db)

db.init_app(app)

CORS(
    app,
    supports_credentials=True,
    origins=[
        'http://localhost:4000',
        'http://localhost:4001',
        os.environ.get('FRONTEND_URL', '')
    ]
)

api = Api(app)


# =========================================
# AUTHORIZATION HELPERS
# =========================================

def get_current_user():
    user_id = session.get('user_id')

    if not user_id:
        return None

    return User.query.filter_by(id=user_id).first()


def require_login():
    user = get_current_user()

    if not user:
        return None, {
            'error': 'Not logged in'
        }, 401

    return user, None, None


def require_roles(*allowed_roles):
    user = get_current_user()

    if not user:
        return None, {
            'error': 'Not logged in'
        }, 401

    if user.role not in allowed_roles:
        return None, {
            'error': 'You are not authorized to access this resource'
        }, 403

    return user, None, None



# =========================================
# ERROR HANDLER
# =========================================

@app.errorhandler(NotFound)
def handle_not_found(e):
    return render_template(
        'index.html',
        title='Homepage',
        message='Welcome to our website!'
    )


# =========================================
# PATIENTS
# =========================================

class PatientData(Resource):

    def get(self):
        user, error, status = require_roles(
            'Doctor',
            'Administrator'
        )

        if error:
            return error, status

        if user.role == 'Administrator':
            patients = Patient.query.all()
        else:
            doctor = user.doctor
            if not doctor:
                return {'error': 'Doctor profile not found'}, 404
            doctor = doctor[0]

            patient_ids = [
                row[0]
                for row in db.session.query(
                    Appointment.patient_id
                ).filter_by(
                    staff_id=doctor.id
                ).distinct().all()
            ]

            patients = Patient.query.filter(
                Patient.id.in_(patient_ids)
            ).all() if patient_ids else []

        return [patient.to_dict() for patient in patients], 200

    def post(self):
        user, error, status = require_roles('Administrator')
        if error:
            return error, status

        data = request.get_json()
        if not data:
            return {'error': 'Request data is required'}, 400

        required = [
            'name', 'age', 'gender', 'contact_number',
            'email', 'date_of_birth'
        ]
        if any(not data.get(field) for field in required):
            return {'error': 'All patient profile fields are required'}, 400

        try:
            new_patient = Patient(
                name=data.get('name'),
                age=data.get('age'),
                gender=data.get('gender'),
                contact_number=data.get('contact_number'),
                email=data.get('email'),
                date_of_birth=data.get('date_of_birth')
            )
            db.session.add(new_patient)
            db.session.commit()
            return new_patient.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 400


api.add_resource(PatientData, '/patients')


class PatientByID(Resource):

    def get(self, id):
        user, error, status = require_roles(
            'Patient', 'Doctor', 'Administrator'
        )
        if error:
            return error, status

        patient = Patient.query.filter_by(id=id).first()
        if not patient:
            return {'error': 'Patient not found'}, 404

        if user.role == 'Patient':
            current_patient = user.patient
            current_patient = current_patient[0] if current_patient else None
            if not current_patient or current_patient.id != patient.id:
                return {'error': 'You are not authorized to access this patient'}, 403

        elif user.role == 'Doctor':
            doctor = user.doctor
            doctor = doctor[0] if doctor else None
            if not doctor:
                return {'error': 'Doctor profile not found'}, 404

            assigned = Appointment.query.filter_by(
                staff_id=doctor.id,
                patient_id=patient.id
            ).first()
            if not assigned:
                return {'error': 'You are not authorized to access this patient'}, 403

        return patient.to_dict(), 200

    def delete(self, id):
        user, error, status = require_roles('Administrator')
        if error:
            return error, status

        patient = Patient.query.filter_by(id=id).first()
        if not patient:
            return {'error': 'Patient not found'}, 404

        try:
            db.session.delete(patient)
            db.session.commit()
            return {'Message': 'Deleted Successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 400


api.add_resource(PatientByID, '/patients/<int:id>')


# =========================================
# DOCTORS / STAFF
# =========================================

class StaffData(Resource):

    def get(self):
        user, error, status = require_roles(
            'Patient', 'Doctor', 'Administrator'
        )
        if error:
            return error, status

        staffs = Staff.query.all()

        if user.role == 'Patient':
            result = []
            for staff in staffs:
                result.append({
                    'id': staff.id,
                    'name': staff.name,
                    'specialisation': staff.specialisation,
                    'start_date': staff.start_date,
                    'email': staff.email,
                    'contact_number': staff.contact_number,
                    'status': staff.status
                })
            return result, 200

        return [staff.to_dict() for staff in staffs], 200

    def post(self):
        user, error, status = require_roles('Administrator')
        if error:
            return error, status

        data = request.get_json()
        if not data:
            return {'error': 'Request data is required'}, 400

        username = data.get('username')
        password = data.get('password')
        name = data.get('name')
        specialisation = data.get('specialisation')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        email = data.get('email')
        contact_number = data.get('contact_number')
        status_value = data.get('status') or 'Active'

        if not username or not password or not name or not specialisation or not start_date or not email or not contact_number:
            return {
                'error': (
                    'Username, password, name, specialisation, '
                    'start date, email and contact number are required'
                )
            }, 400

        if User.query.filter_by(username=username).first():
            return {'error': 'Username already exists'}, 409

        if Staff.query.filter_by(email=email).first():
            return {'error': 'A doctor with this email already exists'}, 409

        if Staff.query.filter_by(contact_number=contact_number).first():
            return {'error': 'A doctor with this contact number already exists'}, 409

        try:
            hashed_password = generate_password_hash(password)

            new_user = User(
                username=username,
                password=hashed_password,
                role='Doctor'
            )
            db.session.add(new_user)
            db.session.flush()

            new_staff = Staff(
                user_id=new_user.id,
                name=name,
                specialisation=specialisation,
                start_date=start_date,
                end_date=end_date,
                contact_number=contact_number,
                email=email,
                status=status_value
            )
            db.session.add(new_staff)
            db.session.commit()

            return {
                'message': 'Doctor registered successfully',
                'user': new_user.to_dict(),
                'doctor': new_staff.to_dict()
            }, 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 400


api.add_resource(StaffData, '/staffs')


class StaffByID(Resource):

    def get(self, id):
        user, error, status = require_roles(
            'Patient', 'Doctor', 'Administrator'
        )
        if error:
            return error, status

        staff = Staff.query.filter_by(id=id).first()
        if not staff:
            return {'error': 'Doctor not found'}, 404

        if user.role == 'Patient':
            return {
                'id': staff.id,
                'name': staff.name,
                'specialisation': staff.specialisation,
                'start_date': staff.start_date,
                'email': staff.email,
                'contact_number': staff.contact_number,
                'status': staff.status
            }, 200

        return staff.to_dict(), 200

    def delete(self, id):
        user, error, status = require_roles('Administrator')
        if error:
            return error, status

        staff = Staff.query.filter_by(id=id).first()
        if not staff:
            return {'error': 'Doctor not found'}, 404

        try:
            db.session.delete(staff)
            db.session.commit()
            return {'Message': 'Deleted Successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 400


api.add_resource(StaffByID, '/staffs/<int:id>')


# =========================================
# APPOINTMENTS
# =========================================

class AppointmentData(Resource):

    def get(self):
        user, error, status = require_roles(
            'Doctor', 'Administrator'
        )
        if error:
            return error, status

        if user.role == 'Administrator':
            appointments = Appointment.query.all()
        else:
            doctor = user.doctor
            doctor = doctor[0] if doctor else None
            if not doctor:
                return {'error': 'Doctor profile not found'}, 404
            appointments = Appointment.query.filter_by(
                staff_id=doctor.id
            ).all()

        return [appointment.to_dict() for appointment in appointments], 200

    def post(self):
        user, error, status = require_roles(
            'Patient', 'Administrator'
        )
        if error:
            return error, status

        data = request.get_json()
        if not data:
            return {'error': 'Request data is required'}, 400

        appointment_type = data.get('appointment_type')
        appointment_date = data.get('appointment_date')
        appointment_time = data.get('appointment_time')
        staff_id = data.get('staff_id')

        if not appointment_type or not appointment_date or not appointment_time or not staff_id:
            return {
                'error': 'Appointment type, appointment date, appointment time and doctor are required'
            }, 400

        if user.role == 'Patient':
            patient_list = user.patient
            patient = patient_list[0] if patient_list else None
            if not patient:
                return {'error': 'Patient profile not found'}, 404
            patient_id = patient.id
        else:
            patient_id = data.get('patient_id')
            if not patient_id:
                return {'error': 'Patient is required'}, 400
            patient = Patient.query.filter_by(id=patient_id).first()
            if not patient:
                return {'error': 'Patient not found'}, 404

        doctor = Staff.query.filter_by(id=staff_id).first()
        if not doctor:
            return {'error': 'Doctor not found'}, 404

        try:
            selected_date = datetime.strptime(
                appointment_date, '%Y-%m-%d'
            )
            day_of_week = selected_date.strftime('%A')
            selected_time = datetime.strptime(
                appointment_time, '%H:%M'
            ).time()
        except ValueError:
            return {
                'error': 'Invalid date or time. Use YYYY-MM-DD and HH:MM formats.'
            }, 400

        availability = DoctorAvailability.query.filter_by(
            doctor_id=staff_id,
            day_of_week=day_of_week,
            is_available=True
        ).first()

        if not availability:
            return {
                'error': (
                    f'The doctor is not available on {day_of_week}. '
                    'Please select an available day.'
                )
            }, 400

        try:
            start_time = datetime.strptime(
                availability.start_time, '%H:%M'
            ).time()
            end_time = datetime.strptime(
                availability.end_time, '%H:%M'
            ).time()
        except ValueError:
            return {'error': 'Doctor availability contains an invalid time.'}, 400

        if selected_time < start_time or selected_time > end_time:
            return {
                'error': (
                    f'Appointment time must be between '
                    f'{availability.start_time} and {availability.end_time}.'
                )
            }, 400

        existing = Appointment.query.filter_by(
            staff_id=staff_id,
            appointment_date=appointment_date,
            appointment_time=appointment_time
        ).filter(
            Appointment.status != 'Rejected'
        ).first()

        if existing:
            return {
                'error': 'This doctor is already booked for the selected date and time.'
            }, 409

        try:
            new_appointment = Appointment(
                appointment_type=appointment_type,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                patient_id=patient_id,
                staff_id=staff_id
            )
            db.session.add(new_appointment)
            db.session.commit()
            return new_appointment.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 400


api.add_resource(AppointmentData, '/appointments')


class AppointmentStatus(Resource):

    def patch(self, appointment_id):
        user, error, status = require_roles('Doctor')
        if error:
            return error, status

        doctor = user.doctor
        doctor = doctor[0] if doctor else None
        if not doctor:
            return {'error': 'Doctor profile not found'}, 404

        appointment = Appointment.query.filter_by(id=appointment_id).first()
        if not appointment:
            return {'error': 'Appointment not found'}, 404

        if appointment.staff_id != doctor.id:
            return {'error': 'You are not assigned to this appointment'}, 403

        data = request.get_json()
        if not data:
            return {'error': 'Request data is required'}, 400

        new_status = data.get('status')
        if new_status not in ['Approved', 'Rejected']:
            return {'error': 'Status must be Approved or Rejected'}, 400

        try:
            appointment.status = new_status
            db.session.commit()
            return {
                'message': f'Appointment {new_status.lower()} successfully',
                'appointment': appointment.to_dict()
            }, 200
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 400


api.add_resource(
    AppointmentStatus,
    '/appointments/<int:appointment_id>/status'
)


class AppointmentByID(Resource):

    def get(self, id):
        user, error, status = require_roles(
            'Patient', 'Doctor', 'Administrator'
        )
        if error:
            return error, status

        appointment = Appointment.query.filter_by(id=id).first()
        if not appointment:
            return {'error': 'Appointment not found'}, 404

        if user.role == 'Patient':
            patient_list = user.patient
            patient = patient_list[0] if patient_list else None
            if not patient or appointment.patient_id != patient.id:
                return {'error': 'You are not authorized to access this appointment'}, 403

        elif user.role == 'Doctor':
            doctor_list = user.doctor
            doctor = doctor_list[0] if doctor_list else None
            if not doctor or appointment.staff_id != doctor.id:
                return {'error': 'You are not authorized to access this appointment'}, 403

        return appointment.to_dict(), 200

    def patch(self, id):
        user, error, status = require_roles('Administrator')
        if error:
            return error, status

        appointment = Appointment.query.get(id)
        if not appointment:
            return {'error': 'Appointment not found'}, 404

        data = request.get_json()
        if not data:
            return {'error': 'Request data is required'}, 400

        patient_id = data.get('patient_id', appointment.patient_id)
        staff_id = data.get('staff_id', appointment.staff_id)
        appointment_type = data.get(
            'appointment_type', appointment.appointment_type
        )
        appointment_date = data.get(
            'dbDate', appointment.appointment_date
        )
        appointment_time = data.get(
            'appointment_time', appointment.appointment_time
        )

        patient = Patient.query.filter_by(id=patient_id).first()
        doctor = Staff.query.filter_by(id=staff_id).first()

        if not patient:
            return {'error': 'Patient not found'}, 404
        if not doctor:
            return {'error': 'Doctor not found'}, 404

        if appointment_date and appointment_time:
            try:
                selected_date = datetime.strptime(
                    appointment_date, '%Y-%m-%d'
                )
                selected_time = datetime.strptime(
                    appointment_time, '%H:%M'
                ).time()
            except ValueError:
                return {
                    'error': 'Invalid date or time. Use YYYY-MM-DD and HH:MM formats.'
                }, 400

            day_of_week = selected_date.strftime('%A')
            availability = DoctorAvailability.query.filter_by(
                doctor_id=staff_id,
                day_of_week=day_of_week,
                is_available=True
            ).first()

            if not availability:
                return {
                    'error': f'The doctor is not available on {day_of_week}.'
                }, 400

            try:
                start_time = datetime.strptime(
                    availability.start_time, '%H:%M'
                ).time()
                end_time = datetime.strptime(
                    availability.end_time, '%H:%M'
                ).time()
            except ValueError:
                return {'error': 'Doctor availability contains an invalid time.'}, 400

            if selected_time < start_time or selected_time > end_time:
                return {
                    'error': (
                        f'Appointment time must be between '
                        f'{availability.start_time} and {availability.end_time}.'
                    )
                }, 400

            existing = Appointment.query.filter_by(
                staff_id=staff_id,
                appointment_date=appointment_date,
                appointment_time=appointment_time
            ).filter(
                Appointment.id != appointment.id,
                Appointment.status != 'Rejected'
            ).first()

            if existing:
                return {
                    'error': 'This doctor is already booked for the selected date and time.'
                }, 409

        appointment.patient_id = patient_id
        appointment.staff_id = staff_id
        appointment.appointment_type = appointment_type
        appointment.appointment_date = appointment_date
        appointment.appointment_time = appointment_time

        try:
            db.session.commit()
            return appointment.to_dict(), 200
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 400

    def delete(self, id):
        user, error, status = require_roles('Administrator')
        if error:
            return error, status

        appointment = Appointment.query.filter_by(id=id).first()
        if not appointment:
            return {'error': 'Appointment not found'}, 404

        try:
            db.session.delete(appointment)
            db.session.commit()
            return {'Message': 'Deleted Successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 400


api.add_resource(AppointmentByID, '/appointments/<int:id>')


# =========================================
# LOGIN
# =========================================

class Login(Resource):

    def post(self):

        data = request.get_json()

        if not data:
            return {
                'error': 'Request data is required'
            }, 400

        username = data.get(
            'username'
        )

        password = data.get(
            'password'
        )


        try:

            user = User.query.filter_by(
                username=username
            ).first()


            if user is None:
                return {
                    'error': 'Invalid username or password'
                }, 401


            if check_password_hash(
                user.password,
                password
            ):

                session['user_id'] = user.id

                return user.to_dict(), 200


            return {
                'error': 'Invalid username or password'
            }, 401


        except Exception as e:

            response = make_response(
                {
                    'error': str(e)
                },
                400
            )

            return response


api.add_resource(
    Login,
    '/login'
)


# =========================================
# SIGN UP
# =========================================

class SignUp(Resource):

    def post(self):

        data = request.get_json()

        if not data:
            return {
                'error': 'Request data is required'
            }, 400


        username = data.get(
            'username'
        )

        password = data.get(
            'password'
        )

        role = data.get(
            'role'
        )


        name = data.get(
            'name'
        )

        date_of_birth = data.get(
            'date_of_birth'
        )

        age = data.get(
            'age'
        )

        gender = data.get(
            'gender'
        )

        contact_number = data.get(
            'contact_number'
        )

        email = data.get(
            'email'
        )


        if not username or not password or not role:

            return {
                'error': (
                    'Username, password and role '
                    'are required'
                )
            }, 400


        allowed_roles = [
            'Patient',
            'Doctor'
        ]


        if role not in allowed_roles:

            return {
                'error': (
                    'Invalid role. Public signup is '
                    'only available for Patient or Doctor'
                )
            }, 400


        existing_user = User.query.filter_by(
            username=username
        ).first()


        if existing_user:

            return {
                'error': 'User already exists'
            }, 409


        if role == 'Patient':

            if (
                not name
                or not date_of_birth
                or not age
                or not gender
                or not contact_number
                or not email
            ):

                return {
                    'error': (
                        'All patient profile fields '
                        'are required'
                    )
                }, 400


        hashed_password = generate_password_hash(
            password
        )


        try:

            new_user = User(
                username=username,
                password=hashed_password,
                role=role
            )

            db.session.add(new_user)
            db.session.flush()


            if role == 'Patient':

                new_patient = Patient(
                    user_id=new_user.id,
                    name=name,
                    date_of_birth=date_of_birth,
                    age=age,
                    gender=gender,
                    contact_number=contact_number,
                    email=email
                )

                db.session.add(
                    new_patient
                )


            db.session.commit()


            response = {
                'message': (
                    'Account created successfully'
                ),
                'user': new_user.to_dict()
            }


            if role == 'Patient':

                response['patient'] = (
                    new_patient.to_dict()
                )


            return response, 201


        except Exception as e:

            db.session.rollback()

            return {
                'error': str(e)
            }, 400


api.add_resource(
    SignUp,
    '/signup'
)


# =========================================
# CHECK SESSION
# =========================================

class CheckSessiom(Resource):

    def get(self):

        user = User.query.filter_by(
            id=session.get('user_id')
        ).first()


        if user is None:

            abort(401)


        return user.to_dict(), 200


api.add_resource(
    CheckSessiom,
    '/checkSession'
)


# =========================================
# CURRENT PATIENT
# =========================================

class CurrentPatient(Resource):

    def get(self):

        user_id = session.get(
            'user_id'
        )


        if not user_id:

            return {
                'error': 'Not logged in'
            }, 401


        user = User.query.filter_by(
            id=user_id
        ).first()


        if not user or user.role != 'Patient':

            return {
                'error': 'Patient account not found'
            }, 404


        patient = user.patient


        if not patient:

            return {
                'error': 'Patient profile not found'
            }, 404


        patient = patient[0]


        return patient.to_dict(), 200


api.add_resource(
    CurrentPatient,
    '/current-patient'
)


# =========================================
# PATIENT APPOINTMENTS
# =========================================

class MyAppointments(Resource):

    def get(self):

        user_id = session.get(
            'user_id'
        )


        if not user_id:

            return {
                'error': 'Not logged in'
            }, 401


        user = User.query.filter_by(
            id=user_id
        ).first()


        if not user or user.role != 'Patient':

            return {
                'error': 'Patient account not found'
            }, 404


        patient = user.patient


        if not patient:

            return {
                'error': 'Patient profile not found'
            }, 404


        patient = patient[0]


        appointments = Appointment.query.filter_by(
            patient_id=patient.id
        ).all()


        return [
            appointment.to_dict()
            for appointment in appointments
        ], 200


api.add_resource(
    MyAppointments,
    '/my-appointments'
)


# =========================================
# DOCTOR APPOINTMENTS
# =========================================

class MyDoctorAppointments(Resource):

    def get(self):

        user_id = session.get(
            'user_id'
        )


        if not user_id:

            return {
                'error': 'Not logged in'
            }, 401


        user = User.query.filter_by(
            id=user_id
        ).first()


        if not user or user.role != 'Doctor':

            return {
                'error': 'Doctor account not found'
            }, 404


        doctor = user.doctor


        if not doctor:

            return {
                'error': 'Doctor profile not found'
            }, 404


        doctor = doctor[0]


        appointments = Appointment.query.filter_by(
            staff_id=doctor.id
        ).all()


        appointment_list = []


        for appointment in appointments:

            patient = Patient.query.filter_by(
                id=appointment.patient_id
            ).first()


            appointment_list.append({

                'id': appointment.id,

                'appointment_type':
                    appointment.appointment_type,

                'appointment_date':
                    appointment.appointment_date,

                'appointment_time':
                    appointment.appointment_time,

                'status':
                    appointment.status,

                'patient_id':
                    appointment.patient_id,

                'patient': {

                    'id': patient.id,

                    'name': patient.name,

                    'email': patient.email,

                    'contact_number':
                        patient.contact_number,

                } if patient else None,

            })


        return appointment_list, 200


api.add_resource(
    MyDoctorAppointments,
    '/my-doctor-appointments'
)


# =========================================
# CURRENT DOCTOR
# =========================================

class CurrentDoctor(Resource):

    def get(self):

        user_id = session.get(
            'user_id'
        )


        if not user_id:

            return {
                'error': 'Not logged in'
            }, 401


        user = User.query.filter_by(
            id=user_id
        ).first()


        if not user or user.role != 'Doctor':

            return {
                'error': 'Doctor account not found'
            }, 404


        doctor = user.doctor


        if not doctor:

            return {
                'error': 'Doctor profile not found'
            }, 404


        doctor = doctor[0]


        return {

            'id': doctor.id,

            'name': doctor.name,

            'specialisation':
                doctor.specialisation,

            'start_date':
                doctor.start_date,

            'end_date':
                doctor.end_date,

            'contact_number':
                doctor.contact_number,

            'email':
                doctor.email,

            'status':
                doctor.status

        }, 200


api.add_resource(
    CurrentDoctor,
    '/current-doctor'
)


# =========================================
# DOCTOR AVAILABILITY
# =========================================

class DoctorAvailabilityResource(Resource):

    def get(self):

        user, error, status = require_roles(
            'Doctor'
        )

        if error:
            return error, status


        doctor = user.doctor


        if not doctor:

            return {
                'error': 'Doctor profile not found'
            }, 404


        doctor = doctor[0]


        availabilities = DoctorAvailability.query.filter_by(
            doctor_id=doctor.id
        ).all()


        return [
            availability.to_dict()
            for availability in availabilities
        ], 200


    def post(self):

        user, error, status = require_roles(
            'Doctor'
        )

        if error:
            return error, status


        doctor = user.doctor


        if not doctor:

            return {
                'error': 'Doctor profile not found'
            }, 404


        doctor = doctor[0]


        data = request.get_json()

        if not data:

            return {
                'error': 'Request data is required'
            }, 400


        day_of_week = data.get(
            'day_of_week'
        )

        start_time = data.get(
            'start_time'
        )

        end_time = data.get(
            'end_time'
        )


        if (
            not day_of_week
            or not start_time
            or not end_time
        ):

            return {
                'error': (
                    'Day, start time and end time '
                    'are required'
                )
            }, 400


        existing_availability = (
            DoctorAvailability.query.filter_by(
                doctor_id=doctor.id,
                day_of_week=day_of_week,
                start_time=start_time,
                end_time=end_time
            ).first()
        )


        if existing_availability:

            return {
                'error': (
                    'This availability already exists'
                )
            }, 409


        try:

            availability = DoctorAvailability(
                doctor_id=doctor.id,
                day_of_week=day_of_week,
                start_time=start_time,
                end_time=end_time,
                is_available=True
            )


            db.session.add(
                availability
            )

            db.session.commit()


            return availability.to_dict(), 201


        except Exception as e:

            db.session.rollback()

            return {
                'error': str(e)
            }, 400


api.add_resource(
    DoctorAvailabilityResource,
    '/doctor-availability'
)


class DoctorAvailabilityByDoctor(Resource):

    def get(self, doctor_id):

        user, error, status = require_roles(
            'Patient',
            'Doctor',
            'Administrator'
        )

        if error:
            return error, status


        doctor = Staff.query.filter_by(
            id=doctor_id
        ).first()


        if not doctor:

            return {
                'error': 'Doctor not found'
            }, 404


        availabilities = DoctorAvailability.query.filter_by(
            doctor_id=doctor.id,
            is_available=True
        ).all()


        return [
            availability.to_dict()
            for availability in availabilities
        ], 200


api.add_resource(
    DoctorAvailabilityByDoctor,
    '/doctor-availability/<int:doctor_id>'
)


# =========================================
# LOGOUT
# =========================================

class Logout(Resource):

    def get(self):

        session['user_id'] = None

        return {
            'message': 'logged out'
        }


api.add_resource(
    Logout,
    '/logout'
)


# =========================================
# MEDICAL RECORDS
# =========================================

class MedicalRecordResource(Resource):

    def get(self):
        user, error, status = require_roles(
            'Patient', 'Doctor', 'Administrator'
        )
        if error:
            return error, status

        if user.role == 'Administrator':
            records = MedicalRecord.query.all()

        elif user.role == 'Patient':
            patient_list = user.patient
            patient = patient_list[0] if patient_list else None
            if not patient:
                return {'error': 'Patient profile not found'}, 404
            records = MedicalRecord.query.filter_by(
                patient_id=patient.id
            ).all()

        else:
            doctor_list = user.doctor
            doctor = doctor_list[0] if doctor_list else None
            if not doctor:
                return {'error': 'Doctor profile not found'}, 404

            patient_ids = [
                row[0]
                for row in db.session.query(
                    Appointment.patient_id
                ).filter_by(
                    staff_id=doctor.id
                ).distinct().all()
            ]

            records = MedicalRecord.query.filter(
                MedicalRecord.patient_id.in_(patient_ids)
            ).all() if patient_ids else []

        return [record.to_dict() for record in records], 200

    def post(self):
        user, error, status = require_roles('Doctor')
        if error:
            return error, status

        doctor_list = user.doctor
        doctor = doctor_list[0] if doctor_list else None
        if not doctor:
            return {'error': 'Doctor profile not found'}, 404

        data = request.get_json()
        if not data:
            return {'error': 'Request data is required'}, 400

        patient_id = data.get('patient_id')
        diagnosis = data.get('diagnosis')
        treatment = data.get('treatment')
        prescription = data.get('prescription')
        notes = data.get('notes')

        if not patient_id:
            return {'error': 'Patient ID is required'}, 400
        if not diagnosis:
            return {'error': 'Diagnosis is required'}, 400
        if not treatment:
            return {'error': 'Treatment is required'}, 400

        patient = Patient.query.filter_by(id=patient_id).first()
        if not patient:
            return {'error': 'Patient not found'}, 404

        assigned = Appointment.query.filter_by(
            staff_id=doctor.id,
            patient_id=patient.id
        ).first()

        if not assigned:
            return {
                'error': 'You are not authorized to create a medical record for this patient'
            }, 403

        try:
            medical_record = MedicalRecord(
                patient_id=patient.id,
                doctor_id=doctor.id,
                diagnosis=diagnosis,
                treatment=treatment,
                prescription=prescription,
                notes=notes
            )
            db.session.add(medical_record)
            db.session.commit()
            return medical_record.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 400


api.add_resource(
    MedicalRecordResource,
    '/medical-records'
)


# =========================================
# RUN APPLICATION
# =========================================

if __name__ == '__main__':

    app.run(
        port=5555
    )