// # Database Mapping
// Any bindings to "date_created" or "last_modified" should be null unless initialized by the database.

import { UUIDTypes } from "uuid";

class User {
    constructor(
        public uuid: UUIDTypes<Uint8Array> | null,
        public phone: number,
        public email: string,
        public first_name: string,
        public last_name: string,
        public date_created: number | null,
        public last_modified: number | null
    ) {}
}

class Task {
    constructor(
        public id: number,
        public name: string,
        public time_for_booking: number,
        public date_created: number | null,
        public last_modified: number | null
    ) {}
}

class Employee {
    constructor(
        public id: string,
        public first_name: string,
        public last_name: string,
        public phone: number,
        public email: string,
        public date_created: number | null,
        public last_modified: number | null
    ) {}
}

class AppointmentState {
    constructor(
        public id: number,
        public name: string
    ) {}
}

const APPOINTMENT_STATE_UNCONFIRMED : AppointmentState = new AppointmentState(0, "Unconfirmed");
const APPOINTMENT_STATE_ACCEPTED    : AppointmentState = new AppointmentState(1, "Accepted");
const APPOINTMENT_STATE_CONFIRMED   : AppointmentState = new AppointmentState(2, "Confirmed");
const APPOINTMENT_STATE_CANCELLED   : AppointmentState = new AppointmentState(3, "Cancelled");
const APPOINTMENT_STATE_COMPLETED   : AppointmentState = new AppointmentState(4, "Completed");

class AppointmentAvailability {
    constructor(
        public id: number,
        public start_time: number,
        public end_time: number
    ) {}
}

class Appointment {
    constructor(
        public uuid: UUIDTypes<Uint8Array> | null,
        public user_uuid: UUIDTypes<Uint8Array>,
        public task_id: number,
        // This should be only null before the appointment is confirmed
        public employee_id: number | null,
        public start_time: number,
        public length: number,
        public appointment_state_id: number,
        public date_created: number | null,
        public last_modified: number | null
    ) {}

    validate(): boolean {

        // Checks if the employee isn't set in some appointement states
        if ([
            APPOINTMENT_STATE_ACCEPTED.id,
            APPOINTMENT_STATE_CONFIRMED.id,
            APPOINTMENT_STATE_COMPLETED.id
        ].includes(this.appointment_state_id) && this.employee_id == null) {
            return false;
        }

        return true;

    }

}

class Admin {
    constructor(
        public username: string,
        public password: string, // hashed
        public date_created: number | null,
        public last_modified: number | null
    ) {}
}

const usr: User = new User(null, 123456789, "em@ail.com", "my", "name", null, null);
console.log(usr);

const appointment = new Appointment(null, "helo", 0, null, 0, 0, APPOINTMENT_STATE_CONFIRMED.id, 0, 0);
if (appointment.validate()) {
    console.warn("Invalid Appointment Counting as Valid!");
}
