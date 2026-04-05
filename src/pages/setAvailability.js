import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "../styles";
import {
    View,
    Text,
    Button,
    Platform,
    Alert,
    Modal,
    TouchableOpacity,
    ScrollView,
    Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Calendar } from "react-native-calendars";
import { apiFetch, assertFetchSuccessful } from "../utils";
import { sty } from "../styles";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

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

function TimeRangeSelector({ times, onSelect, scheme, commonUi }) {
    const [startIdx, setStartIdx] = useState(null);
    const [endIdx, setEndIdx] = useState(null);

    const CELL_WIDTH = 72;

    const updateSelection = (index) => {
        if (index < 0 || index >= times.length) return;

        if (startIdx === null) {
            setStartIdx(index);
            setEndIdx(index);
            return;
        }

        setEndIdx(index);

        const start = Math.min(startIdx, index);
        const end = Math.max(startIdx, index);

        onSelect(times[start], times[end]);
    };

    const pan = Gesture.Pan()
        .onBegin((e) => {
            const index = Math.floor(e.x / CELL_WIDTH);
            setStartIdx(index);
            setEndIdx(index);
        })
        .onUpdate((e) => {
            const index = Math.floor(e.x / CELL_WIDTH);
            updateSelection(index);
        });

    const tap = Gesture.Tap().onEnd((e) => {
        const index = Math.floor(e.x / CELL_WIDTH);

        if (startIdx === null) {
            setStartIdx(index);
            setEndIdx(index);
        } else {
            const start = Math.min(startIdx, index);
            const end = Math.max(startIdx, index);

            onSelect(times[start], times[end]);

            setStartIdx(null);
            setEndIdx(null);
        }
    });

    return (
        <GestureDetector gesture={Gesture.Simultaneous(pan, tap)}>
            <View
                style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginTop: 10,
                }}
            >
                {times.slice(0, 24).map((time, index) => {
                    const isSelected =
                        startIdx !== null &&
                        endIdx !== null &&
                        index >= Math.min(startIdx, endIdx) &&
                        index <= Math.max(startIdx, endIdx);

                    return (
                        <View
                            key={time}
                            style={{
                                width: CELL_WIDTH,
                                height: 52,
                                margin: 4,
                                borderRadius: 18,

                                justifyContent: "center",
                                alignItems: "center",

                                backgroundColor: isSelected
                                    ? scheme.accentTint
                                    : scheme.panelBackground,

                                borderWidth: 1,
                                borderColor: isSelected
                                    ? scheme.textAccent
                                    : scheme.borderLightAlt,

                                shadowColor: "#000",
                                shadowOpacity: isSelected ? 0.1 : 0,
                                shadowRadius: 6,
                                elevation: isSelected ? 2 : 0,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontWeight: "700",
                                    color: isSelected
                                        ? scheme.textDark
                                        : scheme.textDefault,
                                }}
                            >
                                {time}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </GestureDetector>
    );
}

export function SetAvailabilityScreen() {
    const scheme = useTheme((state) => state.getScheme)();
    const commonUi = useTheme((state) => state.getCommonUi)();
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentAvailability, setCurrentAvailability] = useState([]);
    const [mode, setMode] = useState(null);
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
        if (!selectedEmployee) return;
        apiFetch("/availability")
            .then((res) => res.json())
            .then((data) =>
                setCurrentAvailability(
                    data.filter(
                        (slot) => slot.employee_id === selectedEmployee,
                    ),
                ),
            )
            .catch(() => showAlert("Error", "Failed to load availability."));
        setMode(null);
        setStartTime("");
        setEndTime("");
    }, [selectedEmployee]);

    async function handleRemoveAvailability(id) {

        apiFetch(`/availability/${id}`, {
                method: "DELETE",
            })
            .then(assertFetchSuccessful)
            .then(() => setCurrentAvailability(currentAvailability.filter((slot) => slot.id !== id)))
            .catch((err) => showAlert("Error", err.message || "Failed to remove availability."))
            ;

    }

    async function handleSubmit() {
        if (!startTime || !endTime) {
            showAlert(
                "Missing fields",
                "Start time and end time are required.",
            );
            return;
        }

        const payload = {
            employee_id: selectedEmployee,
            start_time: toSecondsFromWeekStart(selectedDate, startTime),
            end_time: toSecondsFromWeekStart(selectedDate, endTime),
        };

        apiFetch("/availability", {
                method: "POST",
                body: JSON.stringify(payload),
            })
            .then(assertFetchSuccessful)
            .then((res) => res.json())
            .then((res) => {
                setCurrentAvailability([...currentAvailability, res]);
                setMode(null);
                setStartTime("");
                setEndTime("");
                showAlert("Success", "Availability has been set.");
            })
            .catch((err) => {
                showAlert("Error", err.message || "Failed to set availability.");
                throw err;
            })
            ;

    }

    const selectedEmployeeName = employees.find(
        (e) => e.id === selectedEmployee,
    );

    return (
    <ScrollView contentContainerStyle={commonUi.screen.pageInnerGaps}>

        {/* Header */}
        <View style={commonUi.auth.formCard}>
            <Text style={commonUi.hero.heroTitle}>Set</Text>
            <Text style={commonUi.hero.heroTitleAccent}>Availability</Text>
            <Text style={commonUi.auth.formDescription}>
                Manage employee schedules using gestures.
            </Text>
        </View>

        {/* Employee Picker */}
        <View style={commonUi.auth.formCard}>
            <Text style={commonUi.auth.inputLabel}>Employee</Text>

            <View
                style={{
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: scheme.borderLightAlt,
                    backgroundColor: scheme.panelBackground,
                    overflow: "hidden",
                }}
            >
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
            </View>
        </View>

        {selectedEmployee && (
            <>
                {/* Availability List */}
                <View style={commonUi.auth.formCard}>
                    <Text style={commonUi.auth.formTitle}>
                        Current Availability
                    </Text>

                    {currentAvailability.length === 0 ? (
                        <Text style={{ color: scheme.textMuted }}>
                            No availability set.
                        </Text>
                    ) : (
                        currentAvailability.map((slot) => (
                            <View
                                key={slot.id}
                                style={{
                                    padding: 12,
                                    borderRadius: 14,
                                    backgroundColor: scheme.panelBackground,
                                    marginTop: 8,
                                    borderWidth: 1,
                                    borderColor: scheme.borderLight,
                                }}
                            >
                                <Text style={{ fontWeight: "600" }}>
                                    {fromSecondsFromWeekStart(slot.start_time)} —{" "}
                                    {fromSecondsFromWeekStart(slot.end_time)}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Date Picker */}
                <View style={commonUi.auth.formCard}>
                    <Text style={commonUi.auth.inputLabel}>Date</Text>

                    <TouchableOpacity
                        style={{
                            backgroundColor: scheme.panelBackground,
                            padding: 16,
                            borderRadius: 18,
                            borderWidth: 1,
                            borderColor: scheme.borderLightAlt,
                        }}
                        onPress={() => setShowCalendar(true)}
                    >
                        <Text style={{ fontWeight: "700" }}>
                            {selectedDate || "Tap to select a date"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Buttons */}
                <View style={{ gap: 10 }}>
                    <Pressable
                        style={commonUi.auth.inlineCtaButton}
                        onPress={() => setMode("add")}
                    >
                        <Text style={commonUi.auth.inlineCtaButtonText}>
                            Add Availability
                        </Text>
                    </Pressable>

                    <Pressable
                        style={commonUi.auth.inlineCtaButton}
                        onPress={() => setMode("remove")}
                    >
                        <Text style={commonUi.auth.inlineCtaButtonText}>
                            Remove Availability
                        </Text>
                    </Pressable>
                </View>
            </>
        )}

        {mode === "add" && (
            <View style={commonUi.auth.formCard}>
                <Text style={commonUi.auth.formTitle}>
                    Select Availability
                </Text>

                <Text style={commonUi.auth.formDescription}>
                    Tap or drag across time slots.
                </Text>

                <TimeRangeSelector
                    times={times}
                    scheme={scheme}
                    commonUi={commonUi}
                    onSelect={(start, end) => {
                        setStartTime(start);
                        setEndTime(end);
                    }}
                />

                <Text style={{ marginTop: 10 }}>
                    Selected: {startTime || "--"} → {endTime || "--"}
                </Text>

                <View style={{ marginTop: 10, gap: 10 }}>
                    <Pressable
                        style={commonUi.auth.primaryButton}
                        onPress={handleSubmit}
                    >
                        <Text style={commonUi.auth.primaryButtonText}>
                            Submit
                        </Text>
                    </Pressable>

                    <Pressable
                        style={commonUi.auth.inlineCtaButton}
                        onPress={() => setMode(null)}
                    >
                        <Text style={commonUi.auth.inlineCtaButtonText}>
                            Cancel
                        </Text>
                    </Pressable>
                </View>
            </View>
        )}

        {mode === "remove" && (
            <View style={commonUi.auth.formCard}>
                {currentAvailability.length === 0 ? (
                    <Text>No availability to remove.</Text>
                ) : (
                    currentAvailability.map((slot) => (
                        <View key={slot.id} style={{ marginBottom: 10 }}>
                            <Text>
                                {fromSecondsFromWeekStart(slot.start_time)} —{" "}
                                {fromSecondsFromWeekStart(slot.end_time)}
                            </Text>

                            <Pressable
                                style={commonUi.auth.inlineCtaButton}
                                onPress={() =>
                                    handleRemoveAvailability(slot.id)
                                }
                            >
                                <Text style={commonUi.auth.inlineCtaButtonText}>
                                    Remove
                                </Text>
                            </Pressable>
                        </View>
                    ))
                )}

                <Pressable
                    style={commonUi.auth.inlineCtaButton}
                    onPress={() => setMode(null)}
                >
                    <Text style={commonUi.auth.inlineCtaButtonText}>
                        Cancel
                    </Text>
                </Pressable>
            </View>
        )}

        {/* Added a modal for calendar view */}
        <Modal
            visible={showCalendar}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowCalendar(false)}
        >
            <TouchableOpacity
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.3)",
                    justifyContent: "center",
                    padding: 20,
                }}
                onPress={() => setShowCalendar(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={{ borderRadius: 20, overflow: "hidden" }}
                >
                    <Calendar
                        onDayPress={(day) => {
                            setSelectedDate(day.dateString);
                            setShowCalendar(false);
                        }}
                        markedDates={{
                            [selectedDate]: {
                                selected: true,
                                selectedColor: scheme.textAccent,
                            },
                        }}
                        minDate={
                            new Date().toISOString().split("T")[0]
                        }
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>

    </ScrollView>
);
}