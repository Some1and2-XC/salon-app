import React, { useState, useEffect, useMemo } from "react";
import {
    View,
    Text,
    Pressable,
    ScrollView,
    Platform,
    Alert,
    Modal,
    StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Calendar } from "react-native-calendars";
import { apiFetch, assertFetchSuccessful } from "../utils";
import { useTheme } from "../styles";
import { colorSchemeGreens } from "../colorScheme";
import { AdminBackBar } from "../components/AdminBackBar";
import { OptionModal } from "./booking";

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
    const dateObj = new Date(`${date}T${time}:00`);
    const dayOfWeek = dateObj.getDay();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
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
        "0"
    );
    return `${days[day]} ${hours}:${minutes}`;
}

export function SetAvailabilityScreen({ navigation }) {
    const commonUi = useTheme((state) => state.getCommonUi)();
    const colorScheme =
        useTheme((state) => state.getScheme)() ?? colorSchemeGreens;
    const styles = useMemo(() => makeStyles(colorScheme), [colorScheme]);

    const calendarTheme = useMemo(
        () => ({
            backgroundColor: colorScheme.whiteWarmCard,
            calendarBackground: colorScheme.whiteWarmCard,
            textSectionTitleColor: colorScheme.textMuted,
            selectedDayBackgroundColor: colorScheme.darkSurface,
            selectedDayTextColor: colorScheme.whiteWarm,
            todayTextColor: colorScheme.textAccent,
            dayTextColor: colorScheme.textDark,
            textDisabledColor: colorScheme.textLabel,
            monthTextColor: colorScheme.textDark,
            arrowColor: colorScheme.textAccent,
        }),
        [colorScheme]
    );

    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentAvailability, setCurrentAvailability] = useState([]);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const times = useMemo(() => generateTimes(), []);

    useEffect(() => {
        apiFetch("/employees")
            .then((res) => res.json())
            .then((data) => {
                const list = Array.isArray(data) ? data : data.employees || [];
                setEmployees(list);
            })
            .catch(() => showAlert("Error", "Failed to load employees."));
    }, []);

    const employeeOptions = useMemo(() => {
        const rows = employees.map((employee) => ({
            label:
                employee.first_name && employee.last_name
                    ? `${employee.first_name} ${employee.last_name}`
                    : employee.first_name || `Employee ${employee.id}`,
            value: String(employee.id),
            subLabel: "Team member",
        }));
        return [{ label: "Select employee…", value: "", subLabel: "" }, ...rows];
    }, [employees]);

    useEffect(() => {
        if (!selectedEmployee) return;
        apiFetch("/availability")
            .then((res) => res.json())
            .then((data) =>
                setCurrentAvailability(
                    data.filter(
                        (slot) =>
                            String(slot.employee_id) === String(selectedEmployee)
                    )
                )
            )
            .catch(() => showAlert("Error", "Failed to load availability."));
        setStartTime("");
        setEndTime("");
    }, [selectedEmployee]);

    async function handleRemoveAvailability(id) {
        apiFetch(`/availability/${id}`, {
            method: "DELETE",
        })
            .then(assertFetchSuccessful)
            .then(() =>
                setCurrentAvailability(
                    currentAvailability.filter((slot) => slot.id !== id)
                )
            )
            .catch((err) =>
                showAlert("Error", err.message || "Failed to remove availability.")
            );
    }

    async function handleSubmit() {
        if (!startTime || !endTime) {
            showAlert(
                "Missing fields",
                "Start time and end time are required."
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
                setStartTime("");
                setEndTime("");
                showAlert("Success", "Availability has been set.");
            })
            .catch((err) => {
                showAlert("Error", err.message || "Failed to set availability.");
            });
    }

    const selectedEmployeeName = employees.find(
        (e) => String(e.id) === String(selectedEmployee)
    );

    const employeeFieldLabel = selectedEmployeeName
        ? selectedEmployeeName.first_name && selectedEmployeeName.last_name
            ? `${selectedEmployeeName.first_name} ${selectedEmployeeName.last_name}`
            : selectedEmployeeName.first_name ||
              `Employee ${selectedEmployeeName.id}`
        : "Select employee…";

    const onSelectEmployee = (value) => {
        setSelectedEmployee(value);
        setSelectedDate("");
        setCurrentAvailability([]);
    };

    return (
        <ScrollView
            style={{ backgroundColor: colorScheme.pageBackground }}
            contentContainerStyle={[
                commonUi.screen.pageMargins,
                commonUi.screen.pageInnerGaps,
                { paddingBottom: 32 },
            ]}
            keyboardShouldPersistTaps="handled"
        >
            <AdminBackBar navigation={navigation} />

            <View style={commonUi.card.accentCard}>
                <Text style={commonUi.card.kicker}>Scheduling</Text>
                <Text style={commonUi.card.cardTitle}>Availability</Text>
                <Text style={commonUi.card.cardSubtitle}>
                    Choose a team member, then add or remove bookable time blocks.
                </Text>
            </View>

            <View style={commonUi.card.pageCard}>
                <Text style={commonUi.auth.inputLabel}>Employee</Text>
                <Pressable
                    style={({ pressed }) => [
                        commonUi.form.selectButton,
                        pressed && commonUi.card.pressed,
                    ]}
                    onPress={() => setShowEmployeeModal(true)}
                >
                    <Text
                        style={[
                            commonUi.form.selectValue,
                            !selectedEmployee && commonUi.form.selectValueMuted,
                        ]}
                    >
                        {employeeFieldLabel}
                    </Text>
                    <Text style={commonUi.form.selectChevron}>⌄</Text>
                </Pressable>
            </View>

            {selectedEmployee ? (
                <>
                    <View style={commonUi.card.pageCard}>
                        <Text style={styles.sectionHeading}>
                            Current availability
                            {selectedEmployeeName
                                ? ` · ${selectedEmployeeName.first_name} ${selectedEmployeeName.last_name}`
                                : ""}
                        </Text>

                        {currentAvailability.length === 0 ? (
                            <Text style={styles.muted}>
                                No availability set yet.
                            </Text>
                        ) : (
                            currentAvailability.map((slot) => (
                                <View key={slot.id} style={styles.removeBlock}>
                                    <Text style={styles.slotText}>
                                        {fromSecondsFromWeekStart(slot.start_time)}{" "}
                                        —{" "}
                                        {fromSecondsFromWeekStart(slot.end_time)}
                                    </Text>
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.smallDanger,
                                            pressed && commonUi.card.pressed,
                                        ]}
                                        onPress={() => handleRemoveAvailability(slot.id)}
                                    >
                                        <Text style={styles.smallDangerText}>
                                            Remove
                                        </Text>
                                    </Pressable>
                                </View>
                                
                            ))
                        )}
                    </View>

                    <View style={commonUi.card.pageCard}>
                        <Text style={commonUi.auth.inputLabel}>Date</Text>
                        <Pressable
                            style={({ pressed }) => [
                                styles.dateField,
                                pressed && commonUi.card.pressed,
                            ]}
                            onPress={() => setShowCalendar(true)}
                        >
                            <Text
                                style={
                                    selectedDate
                                        ? styles.dateFieldText
                                        : styles.datePlaceholder
                                }
                            >
                                {selectedDate || "Tap to choose a date"}
                            </Text>
                            <Text style={styles.dateChevron}>⌄</Text>
                        </Pressable>
                    </View>
                </>
            ) : null}

            {selectedEmployee !== "" && selectedDate !== "" && (
                <View style={commonUi.card.pageCard}>
                    <Text style={commonUi.auth.inputLabel}>Start time</Text>
                    <View style={styles.pickerWrap}>
                        <Picker
                            selectedValue={startTime}
                            onValueChange={(v) => setStartTime(v)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select start time…" value="" />
                            {times.map((t) => (
                                <Picker.Item key={t} label={t} value={t} />
                            ))}
                        </Picker>
                    </View>

                    <Text style={commonUi.auth.inputLabel}>End time</Text>
                    <View style={styles.pickerWrap}>
                        <Picker
                            selectedValue={endTime}
                            onValueChange={(v) => setEndTime(v)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select end time…" value="" />
                            {times.map((t) => (
                                <Picker.Item key={t} label={t} value={t} />
                            ))}
                        </Picker>
                    </View>

                    <View style={styles.inlineActions}>
                        <Pressable
                            style={({ pressed }) => [
                                commonUi.auth.primaryButton,
                                pressed && commonUi.auth.cardPressed,
                            ]}
                            onPress={handleSubmit}
                        >
                            <Text style={commonUi.auth.primaryButtonText}>
                                Save slot
                            </Text>
                        </Pressable>
                    </View>
                </View>
            )}

            <OptionModal
                visible={showEmployeeModal}
                title="Choose employee"
                options={employeeOptions}
                selectedValue={selectedEmployee === "" ? "" : String(selectedEmployee)}
                onSelect={onSelectEmployee}
                onClose={() => setShowEmployeeModal(false)}
                emptyText="No employees found"
            />

            <Modal
                visible={showCalendar}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCalendar(false)}
            >
                <View style={styles.calendarModalRoot}>
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={() => setShowCalendar(false)}
                    />
                    <View style={styles.calendarModalCard}>
                        <Calendar
                            theme={calendarTheme}
                            onDayPress={(day) => {
                                setSelectedDate(day.dateString);
                                setShowCalendar(false);
                            }}
                            markedDates={{
                                [selectedDate]: {
                                    selected: true,
                                    selectedColor: colorScheme.darkSurface,
                                },
                            }}
                            minDate={new Date().toISOString().split("T")[0]}
                        />
                        <Pressable
                            style={({ pressed }) => [
                                styles.ghostBtn,
                                { marginTop: 12 },
                                pressed && commonUi.card.pressed,
                            ]}
                            onPress={() => setShowCalendar(false)}
                        >
                            <Text style={styles.ghostBtnText}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

function makeStyles(colorScheme) {
    return StyleSheet.create({
        sectionHeading: {
            fontSize: 16,
            fontWeight: "800",
            color: colorScheme.textDark,
            marginBottom: 10,
        },
        muted: {
            fontSize: 14,
            color: colorScheme.textMuted,
            lineHeight: 21,
        },
        slotRow: {
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: colorScheme.dividerLight,
        },
        slotText: {
            fontSize: 14,
            color: colorScheme.textDefault,
            fontWeight: "600",
        },
        pickerWrap: {
            backgroundColor: colorScheme.panelBackground,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colorScheme.borderLightAlt,
            overflow: "hidden",
            marginBottom: 14,
        },
        picker: {
            width: "100%",
        },
        dateField: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: colorScheme.panelBackground,
            borderRadius: 18,
            paddingHorizontal: 16,
            paddingVertical: 15,
            borderWidth: 1,
            borderColor: colorScheme.borderLightAlt,
            marginTop: 6,
        },
        dateFieldText: {
            fontSize: 15,
            fontWeight: "700",
            color: colorScheme.textDefault,
        },
        datePlaceholder: {
            fontSize: 15,
            fontWeight: "600",
            color: colorScheme.textLabel,
        },
        dateChevron: {
            fontSize: 22,
            color: colorScheme.textAccentSoft,
        },
        rowBtns: {
            flexDirection: "row",
            gap: 10,
        },
        secondaryBtn: {
            flex: 1,
            backgroundColor: colorScheme.panelBackgroundAlt,
            borderRadius: 22,
            paddingVertical: 14,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
        },
        secondaryBtnText: {
            fontSize: 13,
            fontWeight: "800",
            color: colorScheme.textDark,
            textAlign: "center",
        },
        inlineActions: {
            gap: 10,
            marginTop: 8,
        },
        ghostBtn: {
            alignItems: "center",
            paddingVertical: 12,
        },
        ghostBtnText: {
            fontSize: 15,
            fontWeight: "700",
            color: colorScheme.textAccent,
        },
        removeBlock: {
            marginBottom: 14,
            paddingBottom: 14,
            borderBottomWidth: 1,
            borderBottomColor: colorScheme.dividerLight,
        },
        smallDanger: {
            marginTop: 8,
            alignSelf: "flex-start",
            backgroundColor: colorScheme.danger,
            borderRadius: 999,
            paddingVertical: 8,
            paddingHorizontal: 16,
        },
        smallDangerText: {
            color: colorScheme.whiteWarm,
            fontWeight: "800",
            fontSize: 13,
        },
        calendarModalRoot: {
            flex: 1,
            backgroundColor: colorScheme.overlayDarkStrong,
            justifyContent: "center",
            paddingHorizontal: 14,
        },
        calendarModalCard: {
            backgroundColor: colorScheme.whiteWarmCard,
            borderRadius: 26,
            padding: 14,
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
            zIndex: 1,
        },
    });
}
