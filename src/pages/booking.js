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

    const response = await fetch(
        `https://csci4176.t-dy.com/employees/${user.uid}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    ); // replace with actual user id auth
    if (!response.ok) {
        throw new Error("failed to fetch employees");
    }
    const data = await response.json();
    console.log("employees from backend:", data); // for testing, remove in production
    return data.employees || [];
}

const EMPLOYEE_OPTIONS = {
    ANY: "ANY",
    SPECIFIC: "SPECIFIC",
};

// examples availabilities for now (lenght in seconds) need to pull
const AVAILABILITIES = [
    { week_day: 1, starting_hour: 9, starting_minute: 0, length: 1800 },
    { week_day: 1, starting_hour: 13, starting_minute: 0, length: 3600 },
    { week_day: 2, starting_hour: 10, starting_minute: 0, length: 7200 },
    { week_day: 3, starting_hour: 11, starting_minute: 0, length: 1800 },
    { week_day: 4, starting_hour: 9, starting_minute: 30, length: 3600 },
    { week_day: 5, starting_hour: 12, starting_minute: 0, length: 3600 },
];

function getAvailableTimesForDay(day) {
    const dayBlocks = AVAILABILITIES.filter((block) => block.week_day === day);
    const slots = [];

    for (const block of dayBlocks) {
        const startMinutes = block.starting_hour * 60 + block.starting_minute;
        const blockLengthMinutes = block.length / 60;

        const slotCount = Math.floor(
            blockLengthMinutes / APPOINTMENT_LENGTH_MINUTES,
        );

        for (let i = 0; i < slotCount; i++) {
            const slotStart = startMinutes + i * APPOINTMENT_LENGTH_MINUTES;
            slots.push(formatTime(slotStart));
        }
    }

    return slots;
}

function buildAppointment(
    user,
    day,
    time,
    taskId,
    employeePreference,
    employeeId,
) {
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
        user_id: user.uid,
    };
}

function formatTime(totalMinutes) {
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

async function createAppointmentRequest(appointment, user) {
    const token = await user.getIdToken();
    console.log("Creating appointment with data:", appointment); // for testing, remove in production
    const response = await fetch(
        `https://csci4176.t-dy.com/appointments/${user.uid}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(appointment),
        },
    );

    if (!response.ok) {
        throw new Error("Failed to create appointment");
    }

    return appointment;
}

export function BookingScreen({ user }) {
    if (!user) {
        return <Text>Loading...</Text>;
    }
    const [tasks, setTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

    const [selectedDay, setSelectedDay] = useState(1);
    const [selectedTime, setSelectedTime] = useState(
        getAvailableTimesForDay(1)[0] || "",
    );
    const [employeePreference, setEmployeePreference] = useState(
        EMPLOYEE_OPTIONS.ANY,
    );

    const availableTimes = useMemo(() => {
        return getAvailableTimesForDay(selectedDay);
    }, [selectedDay]);

    const handleDayChange = (day) => {
        setSelectedDay(day);

        const nextTimes = getAvailableTimesForDay(day);
        setSelectedTime(nextTimes.length > 0 ? nextTimes[0] : "");
    };
    useEffect(() => {
        fetchTasks()
            .then((data) => {
                setTasks(data);
                if (data.length > 0) {
                    setSelectedTaskId(data[0].id);
                }
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!user) return;

        fetchEmployees(user)
            .then((data) => {
                setEmployees(data);

                if (data.length > 0) {
                    setSelectedEmployeeId(data[0].id);
                }
            })
            .catch((err) => {
                console.error("Error loading employees:", err);
            });
    }, [user]);

    const handleCreateAppointment = async () => {
        if (!selectedTime) {
            Alert.alert("No time selected", "Please select an available time.");
            return;
        }

        if (!selectedTaskId) {
            Alert.alert("No task selected", "Please select a task.");
            return;
        }

        if (
            employeePreference === EMPLOYEE_OPTIONS.SPECIFIC &&
            !selectedEmployeeId
        ) {
            Alert.alert("No employee selected", "Please select an employee.");
            return;
        }

        const appointment = buildAppointment(
            user,
            selectedDay,
            selectedTime,
            selectedTaskId,
            employeePreference,
            selectedEmployeeId,
        );

        await createAppointmentRequest(appointment, user);

        Alert.alert(
            "Appointment Created",
            JSON.stringify(appointment, null, 2),
        );
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
                        {employees.map((employee) => (
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
