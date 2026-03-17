import React, { useMemo, useState, useEffect } from "react";
import { View, Text, Button, Alert } from "react-native";
// npx expo install @react-native-picker/picker
import { Picker } from "@react-native-picker/picker";

const APPOINTMENT_STATE_UNCONFIRMED = "APPOINTMENT_STATE_UNCONFIRMED";
const APPOINTMENT_LENGTH_MINUTES = 30;

const WEEKDAYS = [
    { label: "Sunday", value: 0 },
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
];

const EMPLOYEE_OPTIONS = {
    ANY: "ANY",
    SPECIFIC: "SPECIFIC",
};

const showAlert = (title, message) => {
    if (typeof window !== "undefined") {
        showAlert(`${title}: ${message}`);
    } else {
        showAlert(title, message);
    }
};

async function fetchTasks() {
    const response = await fetch("https://csci4176.t-dy.com/tasks");

    if (!response.ok) {
        throw new Error("failed to fetch tasks");
    }

    const data = await response.json();
    console.log("tasks from backend:", data);

    return data.tasks || [];
}
async function fetchEmployees(user) {
    const token = await user.getIdToken();

    const response = await fetch(`https://csci4176.t-dy.com/employees`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error("failed to fetch employees");
    }
    const data = await response.json();
    console.log("employees from backend:", data); // for testing, remove in production
    return data.employees || [];
}
async function fetchAvailabilities(user) {
    const token = await user.getIdToken();

    const response = await fetch(`https://csci4176.t-dy.com/availability`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("failed to fetch availability");
    }

    const data = await response.json();
    console.log("availability from backend:", data);
    return data || []; // returns array directly, not data.availability
}

function getAvailableTimesForDay(day, availabilities) {
    const slots = [];

    for (const slot of availabilities) {
        const start = new Date(slot.start_time);
        const end = new Date(slot.end_time);

        // check if this slot falls on the selected weekday
        if (start.getDay() !== day) continue;

        // generate 30-min appointment slots within this availability window
        let current = start.getTime();
        while (
            current + APPOINTMENT_LENGTH_MINUTES * 60 * 1000 <=
            end.getTime()
        ) {
            const d = new Date(current);
            const hours = d.getHours();
            const minutes = d.getMinutes();
            slots.push(formatTime(hours * 60 + minutes));
            current += APPOINTMENT_LENGTH_MINUTES * 60 * 1000;
        }
    }

    return slots;
}

function buildAppointment(day, time, taskId, employeePreference, employeeId) {
    return {
        uuid: null, // backend will assign
        appointment_state_id: APPOINTMENT_STATE_UNCONFIRMED,
        employee_id:
            employeePreference === EMPLOYEE_OPTIONS.ANY ? null : employeeId,
        employee_preference: employeePreference,
        week_day: day,
        start_time: time,
        length_minutes: APPOINTMENT_LENGTH_MINUTES,
        date_created: new Date().toISOString(),
        last_modified: null,
        task_id: taskId,
    };
}

function formatTime(totalMinutes) {
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

async function createAppointmentRequest(appointment, user) {
    const token = await user.getIdToken();

    const response = await fetch(`https://csci4176.t-dy.com/appointments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointment),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
            errorBody?.message || `Server error: ${response.status}`;
        throw new Error(message);
    }

    return await response.json();
}

export function BookingScreen({ user }) {
    const [tasks, setTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState("");
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [availabilities, setAvailabilities] = useState([]);
    const [selectedDay, setSelectedDay] = useState(1);
    const [selectedTime, setSelectedTime] = useState("");
    const [employeePreference, setEmployeePreference] = useState(
        EMPLOYEE_OPTIONS.ANY,
    );

    const availableTimes = useMemo(() => {
        return getAvailableTimesForDay(selectedDay, availabilities);
    }, [selectedDay, availabilities]);

    // update selectedTime when availableTimes changes
    useEffect(() => {
        setSelectedTime(availableTimes.length > 0 ? availableTimes[0] : "");
    }, [availableTimes]);

    useEffect(() => {
        fetchTasks()
            .then((data) => {
                setTasks(data);
                if (data.length > 0) setSelectedTaskId(data[0].id);
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!user) return;
        fetchEmployees(user)
            .then((data) => {
                setEmployees(data);
                if (data.length > 0) setSelectedEmployeeId(data[0].id);
            })
            .catch(console.error);
    }, [user]);

    useEffect(() => {
        if (!user) return;
        fetchAvailabilities(user)
            .then((data) => setAvailabilities(data))
            .catch(console.error);
    }, [user]);

    if (!user) {
        return <Text>Loading...</Text>;
    }

    const handleDayChange = (day) => {
        setSelectedDay(day);
        const nextTimes = getAvailableTimesForDay(day, availabilities);
        setSelectedTime(nextTimes.length > 0 ? nextTimes[0] : "");
    };

    const handleCreateAppointment = async () => {
        if (!selectedTime) {
            showAlert("No time selected", "Please select an available time.");
            return;
        }
        if (!selectedTaskId) {
            showAlert("No task selected", "Please select a task.");
            return;
        }
        if (
            employeePreference === EMPLOYEE_OPTIONS.SPECIFIC &&
            !selectedEmployeeId
        ) {
            showAlert(
                "No employee selected",
                "Please select an employee or choose any.",
            );
            return;
        }

        const appointment = buildAppointment(
            selectedDay,
            selectedTime,
            selectedTaskId,
            employeePreference,
            selectedEmployeeId,
        );

        try {
            await createAppointmentRequest(appointment, user);
            showAlert("Success", "Your appointment has been booked.");
        } catch (err) {
            console.error(err);
            if (err.message.includes("401") || err.message.includes("403")) {
                showAlert("Session Expired", "Please log in again.");
            } else if (err.message.includes("409")) {
                showAlert("Time Unavailable", "Please choose another time.");
            } else if (err.message.includes("Network request failed")) {
                showAlert(
                    "No Connection",
                    "Check your internet and try again.",
                );
            } else {
                showAlert(
                    "Error",
                    err.message || "Failed to create appointment.",
                );
            }
        }
    };

    return (
        <View>
            <Text>Select a task</Text>
            <Picker
                selectedValue={selectedTaskId}
                onValueChange={(value) => setSelectedTaskId(value)}
            >
                {Array.isArray(tasks) &&
                    tasks.map((task) => (
                        <Picker.Item
                            key={task.id}
                            label={task.name}
                            value={task.id}
                        />
                    ))}
            </Picker>

            <Text>Choose employee preference</Text>
            <Picker
                selectedValue={employeePreference}
                onValueChange={(value) => setEmployeePreference(value)}
            >
                <Picker.Item
                    label="Any employee"
                    value={EMPLOYEE_OPTIONS.ANY}
                />
                <Picker.Item
                    label="Specific employee"
                    value={EMPLOYEE_OPTIONS.SPECIFIC}
                />
            </Picker>

            {employeePreference === EMPLOYEE_OPTIONS.SPECIFIC && (
                <>
                    <Text>Select an employee</Text>
                    <Picker
                        selectedValue={selectedEmployeeId}
                        onValueChange={(value) => setSelectedEmployeeId(value)}
                    >
                        {Array.isArray(employees) &&
                            employees.map((employee) => (
                                <Picker.Item
                                    key={employee.id}
                                    label={employee.name}
                                    value={employee.id}
                                />
                            ))}
                    </Picker>
                </>
            )}

            <Text>Select a day</Text>
            <Picker
                selectedValue={selectedDay}
                onValueChange={(value) => handleDayChange(value)}
            >
                {WEEKDAYS.map((day) => (
                    <Picker.Item
                        key={day.value}
                        label={day.label}
                        value={day.value}
                    />
                ))}
            </Picker>

            <Text>Select time</Text>
            <Picker
                selectedValue={selectedTime}
                onValueChange={(value) => setSelectedTime(value)}
            >
                {availableTimes.length === 0 ? (
                    <Picker.Item label="No times available" value="" />
                ) : (
                    availableTimes.map((time) => (
                        <Picker.Item key={time} label={time} value={time} />
                    ))
                )}
            </Picker>

            <Button
                title="Create Appointment"
                onPress={handleCreateAppointment}
            />
        </View>
    );
}
