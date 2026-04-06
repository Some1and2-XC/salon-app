import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "../styles";
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
import { Calendar } from "react-native-calendars";
import { apiFetch, assertFetchSuccessful } from "../utils";
import { colorSchemeGreens, MAP_COLOR_SCHEME } from "../colorScheme";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { makeStyles as makeBookingStyles } from "../pages/booking";
import { OptionModal } from "../components/OptionModal";
import { BackButton } from "../components/BackButton";

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
        "0",
    );
    return `${days[day]} ${hours}:${minutes}`;
}

function TimeRangeSelector({ times, onSelect, scheme }) {
    const [startIdx, setStartIdx] = useState(null);
    const [endIdx, setEndIdx] = useState(null);

    const visibleTimes = times.slice(0, 24);

    const CELL_WIDTH = 72;
    const CELL_HEIGHT = 52;
    const NUM_COLUMNS = 4;

    const getIndex = (e) => {
        const fullWidth = CELL_WIDTH + 8;   // margin: 4 + 4
        const fullHeight = CELL_HEIGHT + 8;

        const col = Math.floor(e.x / fullWidth);
        const row = Math.floor(e.y / fullHeight);

        const index = row * NUM_COLUMNS + col;

        return Math.max(0, Math.min(index, visibleTimes.length - 1));
    };

    const updateSelection = (index) => {
        if (index < 0 || index >= visibleTimes.length) return;

        if (startIdx === null) {
            setStartIdx(index);
            setEndIdx(index);
            return;
        }

        if (index === endIdx) return; // 🔥 prevents unnecessary re-renders

        setEndIdx(index);

        const start = Math.min(startIdx, index);
        const end = Math.max(startIdx, index);

        onSelect(visibleTimes[start], visibleTimes[end]);
    };

    const pan = Gesture.Pan()
        .onBegin((e) => {
            const index = getIndex(e);
            setStartIdx(index);
            setEndIdx(index);
        })
        .onUpdate((e) => {
            const index = getIndex(e);
            updateSelection(index);
        });

    const tap = Gesture.Tap().onEnd((e) => {
        const index = getIndex(e);

        if (startIdx === null) {
            setStartIdx(index);
            setEndIdx(index);
        } else {
            const start = Math.min(startIdx, index);
            const end = Math.max(startIdx, index);

            onSelect(visibleTimes[start], visibleTimes[end]);

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
                {visibleTimes.map((time, index) => {
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
                                height: CELL_HEIGHT,
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

export function SetAvailabilityScreen({ navigation }) {

    const commonUi = useTheme((state) => state.getCommonUi)();
    const scheme = useTheme((state) => state.scheme);
    const colorScheme = MAP_COLOR_SCHEME[scheme] ?? colorSchemeDefault;

    const styles = useMemo(
        () => makeAvailabilityStyles(colorScheme),
        [colorScheme],
    );

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
        [colorScheme],
    );

    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentAvailability, setCurrentAvailability] = useState([]);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [mode, setMode] = useState(null);

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
                            String(slot.employee_id) === String(selectedEmployee),
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
            .then(() =>
                setCurrentAvailability((prev) =>
                    prev.filter((slot) => slot.id !== id),
                ),
            )
            .catch((err) =>
                showAlert(
                    "Error",
                    err.message || "Failed to remove availability.",
                ),
            );
    }

    async function handleSubmit() {
        if (!selectedDate) {
            showAlert("Missing date", "Please choose a date first.");
            return;
        }
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
                setCurrentAvailability((prev) => [...prev, res]);
                setStartTime("");
                setEndTime("");
                setMode(null);
                showAlert("Success", "Availability has been set.");
            })
            .catch((err) => {
                showAlert("Error", err.message || "Failed to set availability.");
            });
    }

    const selectedEmployeeName = employees.find(
        (e) => String(e.id) === String(selectedEmployee),
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
        setMode(null);
    };

    return (
        <ScrollView
            style={commonUi.screen.pageBackground}
            contentContainerStyle={[
                commonUi.screen.pageMargins,
                commonUi.screen.pageInnerGaps,
                { paddingBottom: 32 },
            ]}
            keyboardShouldPersistTaps="handled"
        >
            <BackButton navigation={navigation} />

            <View style={commonUi.auth.formCard}>
                <Text style={commonUi.hero.kicker}>Scheduling</Text>
                <Text style={commonUi.auth.formTitle}>Availability</Text>
                <Text style={commonUi.auth.formDescription}>
                    Choose a team member, pick a date, then add time with tap or
                    drag—or remove existing slots.
                </Text>
            </View>

            <View style={commonUi.auth.formCard}>
                <Text style={commonUi.auth.inputLabel}>Employee</Text>
                <Pressable
                    style={({ pressed }) => [
                        commonUi.auth.inputField,
                        pressed && commonUi.auth.cardPressed,
                    ]}
                    onPress={() => setShowEmployeeModal(true)}
                >
                    <Text
                        style={[
                            commonUi.auth.inputText,
                            !selectedEmployee && commonUi.auth.inputPlaceholder,
                        ]}
                    >
                        {employeeFieldLabel}
                    </Text>
                    <Text style={commonUi.auth.inputChevron}>⌄</Text>
                </Pressable>
            </View>

            {selectedEmployee ? (
                <>
                    <View style={commonUi.auth.formCard}>
                        <Text style={commonUi.auth.formTitle}>
                            Current availability
                            {selectedEmployeeName
                                ? ` · ${selectedEmployeeName.first_name} ${selectedEmployeeName.last_name}`
                                : ""}
                        </Text>

                        {currentAvailability.length === 0 ? (
                            <Text
                                style={[
                                    commonUi.auth.formDescription,
                                    { color: colorScheme.textMuted },
                                ]}
                            >
                                No availability set yet.
                            </Text>
                        ) : (
                            currentAvailability.map((slot) => (
                                <View key={slot.id} style={styles.removeBlock}>
                                    <Text style={commonUi.auth.formDescription}>
                                        {fromSecondsFromWeekStart(
                                            slot.start_time,
                                        )}{" "}
                                        —{" "}
                                        {fromSecondsFromWeekStart(slot.end_time)}
                                    </Text>
                                </View>
                            ))
                        )}
                    </View>

                    <View style={commonUi.auth.formCard}>
                        <Text style={commonUi.auth.inputLabel}>Date</Text>
                        <Pressable
                            style={({ pressed }) => [
                                styles.dateField,
                                pressed && commonUi.auth.cardPressed,
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

                    <View style={commonUi.auth.formCard}>
                        <View style={styles.rowBtns}>
                            <Pressable
                                style={({ pressed }) => [
                                    commonUi.auth.inlineCtaButton,
                                    { flex: 1 },
                                    pressed && commonUi.auth.cardPressed,
                                ]}
                                onPress={() => setMode("add")}
                            >
                                <Text style={commonUi.auth.inlineCtaButtonText}>
                                    Add availability
                                </Text>
                            </Pressable>

                            <Pressable
                                style={({ pressed }) => [
                                    commonUi.auth.inlineCtaButton,
                                    { flex: 1 },
                                    pressed && commonUi.auth.cardPressed,
                                ]}
                                onPress={() => setMode("remove")}
                            >
                                <Text style={commonUi.auth.inlineCtaButtonText}>
                                    Remove availability
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </>
            ) : null}

            {mode === "add" && selectedEmployee ? (
                <View style={commonUi.auth.formCard}>
                    <Text style={commonUi.auth.formTitle}>
                        Select time range
                    </Text>

                    <Text style={commonUi.auth.formDescription}>
                        Tap or drag across time slots (first half of the day).
                    </Text>

                    <TimeRangeSelector
                        times={times}
                        scheme={colorScheme}
                        onSelect={(start, end) => {
                            setStartTime(start);
                            setEndTime(end);
                        }}
                    />

                    <Text style={[commonUi.auth.formDescription, { marginTop: 10 }]}>
                        Selected: {startTime || "--"} → {endTime || "--"}
                    </Text>

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

                        <Pressable
                            style={({ pressed }) => [
                                commonUi.auth.inlineCtaButton,
                                pressed && commonUi.auth.cardPressed,
                            ]}
                            onPress={() => setMode(null)}
                        >
                            <Text style={commonUi.auth.inlineCtaButtonText}>
                                Cancel
                            </Text>
                        </Pressable>
                    </View>
                </View>
            ) : null}

            {mode === "remove" && selectedEmployee ? (
                <View style={commonUi.auth.formCard}>
                    {currentAvailability.length === 0 ? (
                        <Text
                            style={[
                                commonUi.auth.formDescription,
                                { color: colorScheme.textMuted },
                            ]}
                        >
                            No availability to remove.
                        </Text>
                    ) : (
                        currentAvailability.map((slot) => (
                            <View key={slot.id} style={styles.removeBlock}>
                                <Text style={commonUi.auth.formDescription}>
                                    {fromSecondsFromWeekStart(slot.start_time)}{" "}
                                    —{" "}
                                    {fromSecondsFromWeekStart(slot.end_time)}
                                </Text>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.smallDanger,
                                        pressed && commonUi.auth.cardPressed,
                                    ]}
                                    onPress={() =>
                                        handleRemoveAvailability(slot.id)
                                    }
                                >
                                    <Text style={styles.smallDangerText}>
                                        Remove
                                    </Text>
                                </Pressable>
                            </View>
                        ))
                    )}

                    <Pressable
                        style={({ pressed }) => [
                            commonUi.auth.inlineCtaButton,
                            { marginTop: 12 },
                            pressed && commonUi.auth.cardPressed,
                        ]}
                        onPress={() => setMode(null)}
                    >
                        <Text style={commonUi.auth.inlineCtaButtonText}>
                            Cancel
                        </Text>
                    </Pressable>
                </View>
            ) : null}

            <OptionModal
                visible={showEmployeeModal}
                title="Choose employee"
                options={employeeOptions}
                selectedValue={
                    selectedEmployee === "" ? "" : String(selectedEmployee)
                }
                onSelect={onSelectEmployee}
                onClose={() => setShowEmployeeModal(false)}
                emptyText="No employees found"
                styles={styles}
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
                                commonUi.auth.inlineCtaButton,
                                { marginTop: 12 },
                                pressed && commonUi.auth.cardPressed,
                            ]}
                            onPress={() => setShowCalendar(false)}
                        >
                            <Text style={commonUi.auth.inlineCtaButtonText}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

function makeAvailabilityStyles(colorScheme) {
    return StyleSheet.create({
        muted: {
            fontSize: 14,
            color: colorScheme.textMuted,
            lineHeight: 21,
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
