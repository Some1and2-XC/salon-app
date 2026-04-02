/*
time setting WIP
*/

import React, { useState, useEffect, useMemo } from "react";
import {
    View,
    Text,
    Button,
    Platform,
    Alert,
    Modal,
    TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Calendar } from "react-native-calendars";
import { apiFetch } from "../utils";
import { sty } from "../styles";

function showAlert(title, message) {
    if (Platform.OS === "web") {
        window.alert(`${title}\n\n${message}`);
    } else {
        Alert.alert(title, message);
    }
}

function generateTimes() {
    const times = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hh = String(h).padStart(2, "0");
            const mm = String(m).padStart(2, "0");
            times.push(`${hh}:${mm}`);
        }
    }
    return times;
}

// Combines a date string "YYYY-MM-DD" and time string "HH:MM" into a Unix timestamp (ms)
function toUnixMs(date, time) {
    return new Date(`${date}T${time}:00`).getTime();
}

export function SetAvailabilityScreen() {
    const [employees, setEmployees] = useState([]);
    const [showCalendar, setShowCalendar] = useState(false);
    const [form, setForm] = useState({
        employee_id: "",
        date: "",
        start_time: "",
        end_time: "",
    });

    const times = useMemo(() => generateTimes(), []);

    useEffect(() => {
        apiFetch("/employees")
            .then((res) => res.json())
            .then((data) => setEmployees(data))
            .catch(() => showAlert("Error", "Failed to load employees."));
    }, []);

    function handleChange(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit() {
        if (
            !form.employee_id ||
            !form.date ||
            !form.start_time ||
            !form.end_time
        ) {
            showAlert(
                "Missing fields",
                "Employee, date, start time, and end time are required.",
            );
            return;
        }
        try {
            const payload = {
                employee_id: form.employee_id,
                start_time: toUnixMs(form.date, form.start_time),
                end_time: toUnixMs(form.date, form.end_time),
            };
            const response = await apiFetch("/availability", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                const message =
                    errorBody?.message || `Server error: ${response.status}`;
                throw new Error(message);
            }
            showAlert(
                "Success",
                `Availability for employee ${form.employee_id} on ${form.date} has been set.`,
            );
            setForm({
                employee_id: "",
                date: "",
                start_time: "",
                end_time: "",
            });
        } catch (err) {
            showAlert("Error", err.message || "Failed to set availability.");
        }
    }

    return (
        <View style={sty.container}>
            <Text>Employee</Text>
            <Picker
                selectedValue={form.employee_id}
                onValueChange={(v) => handleChange("employee_id", v)}
            >
                <Picker.Item label="Select employee..." value="" />
                {employees.map((emp) => (
                    <Picker.Item
                        key={emp.id}
                        label={`${emp.first_name} ${emp.last_name}`}
                        value={emp.id}
                    />
                ))}
            </Picker>

            <Text>Date</Text>
            <TouchableOpacity onPress={() => setShowCalendar(true)}>
                <Text>{form.date || "Tap to select a date"}</Text>
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
                                handleChange("date", day.dateString);
                                setShowCalendar(false);
                            }}
                            markedDates={{
                                [form.date]: {
                                    selected: true,
                                    selectedColor: "#007AFF",
                                },
                            }}
                            minDate={new Date().toISOString().split("T")[0]}
                        />
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            <Text>Start Time</Text>
            <Picker
                selectedValue={form.start_time}
                onValueChange={(v) => handleChange("start_time", v)}
            >
                <Picker.Item label="Select start time..." value="" />
                {times.map((t) => (
                    <Picker.Item key={t} label={t} value={t} />
                ))}
            </Picker>

            <Text>End Time</Text>
            <Picker
                selectedValue={form.end_time}
                onValueChange={(v) => handleChange("end_time", v)}
            >
                <Picker.Item label="Select end time..." value="" />
                {times.map((t) => (
                    <Picker.Item key={t} label={t} value={t} />
                ))}
            </Picker>

            <Button title="Set Availability" onPress={handleSubmit} />
        </View>
    );
}
