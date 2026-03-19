/*
still to implement:
disable create appointment button until all selections are made
prevent multiple booking clicks 
loading screen

dependencies: run if not installed 
npx expo install @react-native-picker/picker
npx expo install react-native-calendars
*/

import React, { useMemo, useState, useEffect } from "react";
import {
    View,
    Text,
    Button,
    Alert,
    Platform,
    Modal,
    TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Calendar } from "react-native-calendars";

const APPOINTMENT_STATE_UNCONFIRMED = "APPOINTMENT_STATE_UNCONFIRMED";
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

function showAlert(title, message) {
    if (Platform.OS === "web") {
        window.alert(`${title}\n\n${message}`);
    } else {
        Alert.alert(title, message);
    }
}

async function fetchTasks() {
    const response = await fetch("https://csci4176.t-dy.com/tasks");
    if (!response.ok) {
        throw new Error("failed to fetch tasks");
    }
    const data = await response.json();
    console.log("tasks from backend:", data);
    return Array.isArray(data) ? data : data.tasks || [];
}
async function fetchEmployees(user) {
    const token = await user.getIdToken();
    const response = await fetch(`https://csci4176.t-dy.com/employees`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("failed to fetch employees");
    const data = await response.json();
    console.log("employees from backend:", data);
    console.log(token);
    return Array.isArray(data) ? data : data.employees || [];
}
async function fetchAvailabilities(user) {
    const token = await user.getIdToken();
    const response = await fetch(`https://csci4176.t-dy.com/availability`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("failed to fetch availability");
    const data = await response.json();
    return Array.isArray(data) ? data : data || [];
}

function getAvailableTimesForDay(day, availabilities, appointmentLength) {
    const slots = [];
    for (const slot of availabilities) {
        const start = new Date(slot.start_time * 1000);
        const end = new Date(slot.end_time * 1000);
        if (start.getDay() !== day) continue;
        let current = start.getTime();
        while (current + appointmentLength * 60 * 1000 <= end.getTime()) {
            const d = new Date(current);
            slots.push(formatTime(d.getHours() * 60 + d.getMinutes()));
            current += appointmentLength * 60 * 1000;
        }
    }
    return slots;
}

function buildAppointment(
    date,
    time,
    taskId,
    employeePreference,
    employeeId,
    appointmentLength,
) {
    const [hours, minutes] = time.split(":").map(Number);
    const startDate = new Date(date + "T00:00:00");
    startDate.setHours(hours, minutes, 0, 0);
    const startTimestamp = Math.floor(startDate.getTime() / 1000);

    return {
        appointment_state_id: 0,
        employee_id:
            employeePreference === EMPLOYEE_OPTIONS.ANY ? null : employeeId,
        length: appointmentLength,
        start_time: startTimestamp,
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
    console.log("sending appointment:", JSON.stringify(appointment));
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
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [availabilities, setAvailabilities] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState("");
    const [showCalendar, setShowCalendar] = useState(false);
    const [employeePreference, setEmployeePreference] = useState(
        EMPLOYEE_OPTIONS.ANY,
    );
    const selectedTask = tasks.find((t) => t.id === selectedTaskId);

    const appointmentLength = (selectedTask?.time_for_booking || 900) / 60;

    const availableTimes = useMemo(() => {
        if (!selectedDate) return [];
        return getAvailableTimesForDay(
            new Date(selectedDate).getDay(),
            availabilities,
            appointmentLength,
        );
    }, [selectedDate, availabilities, appointmentLength]);

    // update selectedTime when availableTimes changes
    useEffect(() => {
        setSelectedTime(availableTimes.length > 0 ? availableTimes[0] : "");
    }, [availableTimes]);

    useEffect(() => {
        fetchTasks()
            .then((data) => {
                setTasks(data);
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

    const handleDayChange = (weekday) => {
        const nextTimes = getAvailableTimesForDay(
            weekday,
            availabilities,
            appointmentLength,
        );
        setSelectedTime(nextTimes.length > 0 ? nextTimes[0] : "");
    };

    const handleCreateAppointment = async () => {
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
        if (!selectedTime) {
            showAlert("No time selected", "Please select an available time.");
            return;
        }

        const appointment = buildAppointment(
            selectedDate,
            selectedTime,
            Number(selectedTaskId),
            employeePreference,
            selectedEmployeeId,
            appointmentLength,
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
                <Picker.Item label="Choose a task" value={null} />
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
                                    label={employee.first_name}
                                    value={employee.id}
                                />
                            ))}
                    </Picker>
                </>
            )}

            <Text>Select a day</Text>
            <TouchableOpacity onPress={() => setShowCalendar(true)}>
                <Text>{selectedDate || "Tap to select a date"}</Text>
            </TouchableOpacity>

            <Modal
                visible={showCalendar}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCalendar(false)}
            >
                <TouchableOpacity onPress={() => setShowCalendar(false)}>
                    <TouchableOpacity activeOpacity={1}>
                        <Calendar
                            onDayPress={(day) => {
                                setSelectedDate(day.dateString);
                                handleDayChange(
                                    new Date(
                                        day.dateString + "T12:00:00",
                                    ).getDay(),
                                );
                                setShowCalendar(false);
                            }}
                            markedDates={{
                                [selectedDate]: {
                                    selected: true,
                                    selectedColor: "#007AFF",
                                },
                            }}
                            minDate={new Date().toISOString().split("T")[0]}
                        />
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

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
