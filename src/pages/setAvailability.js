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

function toSecondsFromWeekStart(date, time) {
    const d = new Date(`${date}T${time}:00`);
    const dayOfWeek = d.getDay();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    return dayOfWeek * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60;
}

function fromSecondsFromWeekStart(seconds) {
    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    const day = Math.floor(seconds / (24 * 60 * 60));
    const remainder = seconds % (24 * 60 * 60);
    const hours = String(Math.floor(remainder / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((remainder % 3600) / 60)).padStart(
        2,
        "0",
    );
    return `${days[day]} ${hours}:${minutes}`;
}

export function SetAvailabilityScreen() {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentAvailability, setCurrentAvailability] = useState([]);
    const [mode, setMode] = useState(null); // "add" | "remove" | null
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const times = useMemo(() => generateTimes(), []);

    useEffect(() => {
        apiFetch("/employees")
            .then((res) => res.json())
            .then((data) => setEmployees(data))
            .catch(() => showAlert("Error", "Failed to load employees."));
    }, []);

    useEffect(() => {
        if (!selectedEmployee || !selectedDate) return;
        apiFetch("/availability")
            .then((res) => res.json())
            .then((data) => {
                const filtered = data.filter(
                    (slot) => slot.employee_id === selectedEmployee,
                );
                setCurrentAvailability(filtered);
            })
            .catch(() => showAlert("Error", "Failed to load availability."));
        setMode(null);
        setStartTime("");
        setEndTime("");
    }, [selectedEmployee, selectedDate]);

    async function handleRemoveAvailability(id) {
        try {
            const response = await apiFetch(`/availability/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                const message =
                    errorBody?.message || `Server error: ${response.status}`;
                throw new Error(message);
            }
            setCurrentAvailability((prev) =>
                prev.filter((slot) => slot.id !== id),
            );
        } catch (err) {
            showAlert("Error", err.message || "Failed to remove availability.");
        }
    }

    async function handleSubmit() {
        if (!startTime || !endTime) {
            showAlert(
                "Missing fields",
                "Start time and end time are required.",
            );
            return;
        }
        try {
            const payload = {
                employee_id: selectedEmployee,
                start_time: toSecondsFromWeekStart(selectedDate, startTime),
                end_time: toSecondsFromWeekStart(selectedDate, endTime),
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
            const newSlot = await response.json();
            setCurrentAvailability((prev) => [...prev, newSlot]);
            showAlert("Success", "Availability has been set.");
            setMode(null);
            setStartTime("");
            setEndTime("");
        } catch (err) {
            showAlert("Error", err.message || "Failed to set availability.");
        }
    }

    const selectedEmployeeName = employees.find(
        (e) => e.id === selectedEmployee,
    );

    return (
        <View style={sty.container}>
            {/* Step 1: Select Employee */}
            <Text>Employee</Text>
            <Picker
                selectedValue={selectedEmployee}
                onValueChange={(v) => {
                    setSelectedEmployee(v);
                    setSelectedDate("");
                    setCurrentAvailability([]);
                    setMode(null);
                }}
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

            {/* Step 2: Select Date */}
            {selectedEmployee !== "" && (
                <>
                    <Text>Date</Text>
                    <TouchableOpacity onPress={() => setShowCalendar(true)}>
                        <Text>{selectedDate || "Tap to select a date"}</Text>
                    </TouchableOpacity>

                    <Modal
                        visible={showCalendar}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setShowCalendar(false)}
                    >
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            onPress={() => setShowCalendar(false)}
                        >
                            <TouchableOpacity activeOpacity={1}>
                                <Calendar
                                    onDayPress={(day) => {
                                        setSelectedDate(day.dateString);
                                        setShowCalendar(false);
                                    }}
                                    markedDates={{
                                        [selectedDate]: {
                                            selected: true,
                                            selectedColor: "#007AFF",
                                        },
                                    }}
                                    minDate={
                                        new Date().toISOString().split("T")[0]
                                    }
                                />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Modal>
                </>
            )}

            {/* Step 3: Show availability + add/remove options */}
            {selectedEmployee !== "" && selectedDate !== "" && (
                <>
                    <Text>
                        Current availability for{" "}
                        {selectedEmployeeName
                            ? `${selectedEmployeeName.first_name} ${selectedEmployeeName.last_name}`
                            : selectedEmployee}
                        :
                    </Text>

                    {currentAvailability.length === 0 ? (
                        <Text>No availability set.</Text>
                    ) : (
                        currentAvailability.map((slot) => (
                            <View key={slot.id}>
                                <Text>
                                    {fromSecondsFromWeekStart(slot.start_time)}{" "}
                                    — {fromSecondsFromWeekStart(slot.end_time)}
                                </Text>
                            </View>
                        ))
                    )}

                    <Button
                        title="Add Availability"
                        onPress={() => setMode("add")}
                    />
                    <Button
                        title="Remove Availability"
                        onPress={() => setMode("remove")}
                    />
                </>
            )}

            {/* Step 4a: Add mode - pick times and submit */}
            {mode === "add" && (
                <>
                    <Text>Start Time</Text>
                    <Picker
                        selectedValue={startTime}
                        onValueChange={(v) => setStartTime(v)}
                    >
                        <Picker.Item label="Select start time..." value="" />
                        {times.map((t) => (
                            <Picker.Item key={t} label={t} value={t} />
                        ))}
                    </Picker>

                    <Text>End Time</Text>
                    <Picker
                        selectedValue={endTime}
                        onValueChange={(v) => setEndTime(v)}
                    >
                        <Picker.Item label="Select end time..." value="" />
                        {times.map((t) => (
                            <Picker.Item key={t} label={t} value={t} />
                        ))}
                    </Picker>

                    <Button title="Submit" onPress={handleSubmit} />
                    <Button title="Cancel" onPress={() => setMode(null)} />
                </>
            )}

            {/* Step 4b: Remove mode - show slots with remove buttons */}
            {mode === "remove" && (
                <>
                    {currentAvailability.length === 0 ? (
                        <Text>No availability to remove.</Text>
                    ) : (
                        currentAvailability.map((slot) => (
                            <View key={slot.id}>
                                <Text>
                                    {fromSecondsFromWeekStart(slot.start_time)}{" "}
                                    — {fromSecondsFromWeekStart(slot.end_time)}
                                </Text>
                                <Button
                                    title="Remove"
                                    onPress={() =>
                                        handleRemoveAvailability(slot.id)
                                    }
                                />
                            </View>
                        ))
                    )}
                    <Button title="Cancel" onPress={() => setMode(null)} />
                </>
            )}
        </View>
    );
}
