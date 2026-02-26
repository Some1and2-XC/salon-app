// # Database Mapping
// Any bindings to "date_created" or "last_modified" should be null unless initialized by the database.

class User {
    constructor(
        public uuid: string,
        public phone: int,
        public email: string,
        public first_name: string,
        public last_name: string,
        public date_created: int,
        public last_modified: int
    ) {}
}

class Task {
    constructor(
        public id: int,
        public name: string,
        public time_for_booking: int,
        public date_created: int,
        public last_modified: int
    ) {}
}

class Employee {
    constructor(
        public id: string,
        public first_name: string,
        public last_name: string,
        public phone: int,
        public email: string,
        public date_created: int,
        public last_modified: int
    ) {}
}

class AppointmentState {
    constructor(
        public id: int,
        public name: string
    ) {}
}

class AppointmentAvailability {
    constructor(
        public id: int,
        public start_time: int,
        public end_time: int
    ) {}
}

class Appointment {
    constructor(
        public uuid: string,
        public user_uuid: string,
        public task_id: int,
        public employee_id: int,
        public start_time: int,
        public length: int,
        public appointment_state_id: int,
        public date_created: int,
        public last_modified: int
    ) {}
}

class Admin {
    constructor(
        public username: string,
        public password: string, // hashed
        public date_created: int,
        public last_modified: int
    ) {}
}

const v = new User(null, 0123456789, "em@ail.com", "my", "name", null, null);
console.log(v);
