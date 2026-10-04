from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates
import re


db = SQLAlchemy()


class Patient(db.Model, SerializerMixin):
    __tablename__ = 'patients'

    serialize_rules = (
        '-appointments.patient',
        '-medical_records',
        '-user.patient',
    )

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        unique=True,
        nullable=True
    )

    user = db.relationship(
        'User',
        backref='patient',
        uselist=False
    )

    name = db.Column(
        db.String,
        nullable=False
    )

    date_of_birth = db.Column(
        db.String,
        nullable=False
    )

    age = db.Column(
        db.Integer,
        nullable=False
    )

    gender = db.Column(
        db.String,
        nullable=False
    )

    contact_number = db.Column(
        db.String,
        nullable=False
    )

    email = db.Column(
        db.String,
        unique=True
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )

    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )

    appointments = db.relationship(
        'Appointment',
        backref='patient'
    )

    @validates('email')
    def validate_email(self, key, value):
        if value is not None:
            if not re.match(
                r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
                value
            ):
                raise ValueError(
                    "Failed email validation"
                )

        return value

    @validates('age')
    def validate_age(self, key, age):
        if age < 0:
            raise ValueError(
                "Age cannot be negative"
            )

        if age > 120:
            raise ValueError(
                "The age of a patient should not exceed 120 years old."
            )

        return age

    def __repr__(self):
        return (
            f"Patient: {self.name} "
            f"Age: {self.age} "
            f"Gender: {self.gender}"
        )


class Staff(db.Model, SerializerMixin):
    __tablename__ = 'staffs'

    serialize_rules = (
        '-appointments.staff',
        '-medical_records',
        '-user.doctor',
    )

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        unique=True,
        nullable=True
    )

    user = db.relationship(
        'User',
        backref='doctor',
        uselist=False
    )

    name = db.Column(
        db.String,
        nullable=False
    )

    specialisation = db.Column(
        db.String,
        nullable=False
    )

    start_date = db.Column(
        db.String,
        nullable=False
    )

    end_date = db.Column(
        db.String
    )

    contact_number = db.Column(
        db.String,
        unique=True
    )

    email = db.Column(
        db.String,
        unique=True
    )

    status = db.Column(
        db.String
    )

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.now()
    )

    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.now()
    )

    appointments = db.relationship(
        'Appointment',
        backref='staff'
    )

    @validates('email')
    def validate_email(self, key, value):
        if value is not None:
            if not re.match(
                r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
                value
            ):
                raise ValueError(
                    "Failed email validation"
                )

        return value

    def __repr__(self):
        return (
            f"Staff: {self.name} "
            f"{self.specialisation} "
            f"{self.start_date}~"
            f"{self.end_date if self.end_date else 'Present'} "
            f"{self.status}"
        )


class Appointment(db.Model, SerializerMixin):
    __tablename__ = 'appointments'

    serialize_rules = (
        '-patient.appointments',
        '-staff.appointments',
    )

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    appointment_type = db.Column(
        db.String
    )

    appointment_date = db.Column(
        db.String,
        nullable=False
    )

    appointment_time = db.Column(
        db.String
    )

    status = db.Column(
        db.String,
        nullable=False,
        default='Pending'
    )

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.now()
    )

    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.now()
    )

    patient_id = db.Column(
        db.Integer,
        db.ForeignKey('patients.id')
    )

    staff_id = db.Column(
        db.Integer,
        db.ForeignKey('staffs.id')
    )

    def __repr__(self):
        return (
            f"Appointment("
            f"ID: {self.id}, "
            f"Type: {self.appointment_type}, "
            f"Date: {self.appointment_date}"
            f")"
        )


class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    serialize_rules = (
        '-password',
        '-patient',
        '-doctor',
    )

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    username = db.Column(
        db.String,
        unique=True,
        nullable=False
    )

    password = db.Column(
        db.String,
        nullable=False
    )

    role = db.Column(
        db.String,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.now()
    )

    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.now()
    )

    def __repr__(self):
        return (
            f"Username: {self.username} "
            f"Role: {self.role}"
        )


class DoctorAvailability(db.Model, SerializerMixin):
    __tablename__ = 'doctor_availabilities'

    serialize_rules = (
        '-doctor',
    )

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    doctor_id = db.Column(
        db.Integer,
        db.ForeignKey('staffs.id'),
        nullable=False
    )

    day_of_week = db.Column(
        db.String,
        nullable=False
    )

    start_time = db.Column(
        db.String,
        nullable=False
    )

    end_time = db.Column(
        db.String,
        nullable=False
    )

    is_available = db.Column(
        db.Boolean,
        nullable=False,
        default=True
    )

    doctor = db.relationship(
        'Staff',
        backref='availabilities'
    )

    def __repr__(self):
        return (
            f"DoctorAvailability("
            f"'{self.day_of_week}', "
            f"'{self.start_time}-{self.end_time}')"
        )


class MedicalRecord(db.Model, SerializerMixin):
    __tablename__ = 'medical_records'

    serialize_rules = (
        '-patient.medical_records',
        '-doctor.medical_records',
    )

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    patient_id = db.Column(
        db.Integer,
        db.ForeignKey('patients.id'),
        nullable=False
    )

    doctor_id = db.Column(
        db.Integer,
        db.ForeignKey('staffs.id'),
        nullable=False
    )

    diagnosis = db.Column(
        db.String,
        nullable=False
    )

    treatment = db.Column(
        db.String,
        nullable=False
    )

    prescription = db.Column(
        db.String
    )

    notes = db.Column(
        db.String
    )

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.now()
    )

    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.now()
    )

    patient = db.relationship(
        'Patient',
        backref='medical_records'
    )

    doctor = db.relationship(
        'Staff',
        backref='medical_records'
    )

    def __repr__(self):
        return (
            f"MedicalRecord("
            f"Patient ID: {self.patient_id}, "
            f"Doctor ID: {self.doctor_id}, "
            f"Diagnosis: {self.diagnosis}"
            f")"
        )