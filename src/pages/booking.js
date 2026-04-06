import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    Animated,
    useWindowDimensions,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { apiFetch, assertFetchSuccessful, showAppToast } from "../utils";
import { NAV_HOME, TOAST_TYPE_ERROR } from "../consts";
import { useTheme } from "../styles";
import { colorSchemeDefault, MAP_COLOR_SCHEME } from "../colorScheme";
import { OptionModal } from "../components/OptionModal";

const EMPLOYEE_OPTIONS = {
    ANY: "ANY",
    SPECIFIC: "SPECIFIC",
};

function getAvailableTimesForDay(day, availabilities, appointmentLength) {
    const seen = new Set();
    const slots = [];

    for (const slot of availabilities) {
        const slotDay = Math.floor(slot.start_time / (24 * 60 * 60));
        if (slotDay !== day) continue;

        const startSeconds = slot.start_time % (24 * 60 * 60);
        const endSeconds = slot.end_time % (24 * 60 * 60);

        let current = startSeconds;

        const step = 30 * 60;
        const appointmentSeconds = appointmentLength * 60;

        while (current + appointmentSeconds <= endSeconds) {
            const hours = Math.floor(current / 3600);
            const minutes = Math.floor((current % 3600) / 60);
            const timeStr = formatTime(hours * 60 + minutes);

            if (!seen.has(timeStr)) {
                seen.add(timeStr);
                slots.push(timeStr);
            }

            current += step;
        }
    }

    return slots;
}

function findAvailableEmployeeForSlot(
    day,
    timeString,
    availabilities,
    appointmentLength,
) {
    const [hours, minutes] = timeString.split(":").map(Number);
    const timeInSeconds = hours * 3600 + minutes * 60;

    for (const slot of availabilities) {
        const slotDay = Math.floor(slot.start_time / (24 * 60 * 60));
        if (slotDay !== day) continue;

        const startSeconds = slot.start_time % (24 * 60 * 60);
        const endSeconds = slot.end_time % (24 * 60 * 60);

        if (
            timeInSeconds >= startSeconds &&
            timeInSeconds + appointmentLength * 60 <= endSeconds
        ) {
            return slot.employee_id;
        }
    }

    return null;
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

    const appointment = {
        appointment_state_id: 0,
        length: appointmentLength,
        start_time: Math.floor(startDate.getTime() / 1000),
        task_id: taskId,
    };

    if (employeePreference === EMPLOYEE_OPTIONS.SPECIFIC && employeeId) {
        appointment.employee_id = employeeId;
    }

    return appointment;
}

function formatTime(totalMinutes) {
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatDisplayDate(dateString) {
    if (!dateString) return "Tap to select a date";

    const d = new Date(dateString + "T12:00:00");

    return d.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
}

function InfoSelectCard({
    step,
    title,
    label,
    value,
    meta,
    onPress,
    disabled = false,
}) {

    const commonUi = useTheme((state) => state.getCommonUi)();

    return (
        <View style={commonUi.card.secondaryActionCard}>
            <View style={commonUi.card.smallTopRow}>
                <View style={commonUi.card.iconWrapSmall}>
                    <Text style={[commonUi.card.iconSmall, { fontSize: 13, fontWeight: "800" }]}>{step}</Text>
                </View>

                {!!meta && <Text style={commonUi.card.cornerText}>{meta}</Text>}
            </View>

            <Text style={commonUi.card.secondaryTitle}>{title}</Text>
            <Text style={[commonUi.card.secondaryDescription, { marginBottom: 14 }]}>{label}</Text>

            <Pressable
                style={({ pressed }) => [
                    commonUi.form.selectButton,
                    disabled && commonUi.form.selectButtonDisabled,
                    pressed && !disabled && commonUi.card.cardPressed,
                ]}
                onPress={disabled ? undefined : onPress}
            >
                <Text
                    style={[
                        commonUi.form.selectValue,
                        disabled && commonUi.form.selectValueMuted,
                    ]}
                >
                    {value}
                </Text>
                <Text style={commonUi.form.selectChevron}>⌄</Text>
            </Pressable>
        </View>
    );
}

export function BookingScreen({ navigation }) {

    const commonUi = useTheme((state) => state.getCommonUi)();
    const scheme = useTheme((state) => state.scheme);
    const colorScheme = MAP_COLOR_SCHEME[scheme] ?? colorSchemeDefault;
    const styles = useMemo(() => makeStyles(colorScheme), [colorScheme]);

    const { width, height } = useWindowDimensions();

    const fadeIn = useRef(new Animated.Value(0)).current;
    const slideUp = useRef(new Animated.Value(18)).current;
    const float1 = useRef(new Animated.Value(0)).current;
    const float2 = useRef(new Animated.Value(0)).current;

    const [tasks, setTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState("");
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [availabilities, setAvailabilities] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState("");
    const [showCalendar, setShowCalendar] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [employeePreference, setEmployeePreference] = useState(
        EMPLOYEE_OPTIONS.ANY,
    );

    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [showTimeModal, setShowTimeModal] = useState(false);

    const selectedTask = tasks.find(
        (t) => String(t.id) === String(selectedTaskId),
    );
    const selectedEmployee = employees.find(
        (e) => String(e.id) === String(selectedEmployeeId),
    );
    const appointmentLength = (selectedTask?.time_for_booking || 900) / 60;

    const filteredAvailabilities = useMemo(() => {
        if (employeePreference === EMPLOYEE_OPTIONS.ANY) {
            return availabilities;
        }

        if (!selectedEmployeeId) return [];

        return availabilities.filter(
            (a) => String(a.employee_id) === String(selectedEmployeeId),
        );
    }, [availabilities, employeePreference, selectedEmployeeId]);

    const availableTimes = useMemo(() => {
        if (!selectedDate) return [];
        return getAvailableTimesForDay(
            new Date(selectedDate + "T12:00:00").getDay(),
            filteredAvailabilities,
            appointmentLength,
        );
    }, [selectedDate, filteredAvailabilities, appointmentLength]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeIn, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.timing(slideUp, {
                toValue: 0,
                duration: 700,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(float1, {
                    toValue: 1,
                    duration: 3600,
                    useNativeDriver: true,
                }),
                Animated.timing(float1, {
                    toValue: 0,
                    duration: 3600,
                    useNativeDriver: true,
                }),
            ]),
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(float2, {
                    toValue: 1,
                    duration: 4300,
                    useNativeDriver: true,
                }),
                Animated.timing(float2, {
                    toValue: 0,
                    duration: 4300,
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, [fadeIn, slideUp, float1, float2]);

    useEffect(() => {
        Promise.all([
            apiFetch("/tasks")
                .then((r) => r.json())
                .then((d) => (Array.isArray(d) ? d : d.tasks || [])),
            apiFetch("/employees")
                .then((r) => r.json())
                .then((d) => (Array.isArray(d) ? d : d.employees || [])),
            apiFetch("/availability")
                .then((r) => r.json())
                .then((d) => (Array.isArray(d) ? d : d || [])),
        ])
            .then(([taskData, employeeData, availabilityData]) => {
                setTasks(taskData);
                setEmployees(employeeData);

                if (employeeData.length > 0) {
                    setSelectedEmployeeId(String(employeeData[0].id));
                }

                setAvailabilities(availabilityData);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        setSelectedDate(null);
        setSelectedTime("");
    }, [selectedTaskId]);

    useEffect(() => {
        setSelectedTime("");
    }, [selectedDate]);

    useEffect(() => {
        setSelectedEmployeeId("");
        setSelectedDate(null);
        setSelectedTime("");
    }, [employeePreference]);

    useEffect(() => {
        setSelectedTime("");
    }, [availableTimes]);

    const handleDayChange = (weekday) => {
        const nextTimes = getAvailableTimesForDay(
            weekday,
            availabilities,
            appointmentLength,
        );

        setSelectedTime(nextTimes.length > 0 ? nextTimes[0] : "");
    };

    function formatPriceCad(cents) {
        if (cents == null) return null;
        return `CA$${(cents / 100).toFixed(2)}`;
    }

    const handleCreateAppointment = async () => {
        if (!selectedTaskId) {
            showAppToast(TOAST_TYPE_ERROR, "No task selected", "Please select a task.");
            return;
        }

        if (!selectedDate) {
            showAppToast(TOAST_TYPE_ERROR, "No date selected", "Please select a date.");
            return;
        }

        if (!selectedTime) {
            showAppToast(TOAST_TYPE_ERROR, "No time selected", "Please select an available time.");
            return;
        }

        let employeeId = selectedEmployeeId;

        if (employeePreference === EMPLOYEE_OPTIONS.ANY) {
            const day = new Date(selectedDate + "T12:00:00").getDay();
            employeeId = findAvailableEmployeeForSlot(
                day,
                selectedTime,
                availabilities,
                appointmentLength,
            );

            if (!employeeId) {
                showAppToast(TOAST_TYPE_ERROR,
                    "No employee available",
                    "No employee is available for that time.",
                );
                return;
            }
        } else if (
            employeePreference === EMPLOYEE_OPTIONS.SPECIFIC &&
            !selectedEmployeeId
        ) {
            showAppToast(TOAST_TYPE_ERROR,
                "No employee selected",
                "Please select an employee or choose any.",
            );
            return;
        }

        const appointment = buildAppointment(
            selectedDate,
            selectedTime,
            Number(selectedTaskId),
            EMPLOYEE_OPTIONS.SPECIFIC,
            employeeId,
            appointmentLength,
        );

        apiFetch("/appointments", {
            method: "POST",
            body: JSON.stringify(appointment),
        })
            .then((res) => res.json())
            .then(assertFetchSuccessful)
            .then(() => showAppToast(TOAST_TYPE_ERROR, "Success", "Your appointment has been booked."))
            .catch((err) => showAppToast(TOAST_TYPE_ERROR, "Server Error", err))
            .finally(() => navigation.navigate(NAV_HOME, { toastMessage: `Appointment Created Successfully!`}))
            ;
    };

    const isFormComplete =
        !!selectedTaskId &&
        !!selectedDate &&
        !!selectedTime &&
        (employeePreference === EMPLOYEE_OPTIONS.ANY || !!selectedEmployeeId);

    const taskOptions = tasks.map((task) => ({
        label: task.name,
        value: String(task.id),
        subLabel: `${(task.time_for_booking || 900) / 60} min${task.price_cad_cent != null ? ` · ${formatPriceCad(task.price_cad_cent)}` : ""}`,
    }));

    const employeeOptions = employees.map((employee) => ({
        label:
            employee.first_name && employee.last_name
                ? `${employee.first_name} ${employee.last_name}`
                : employee.first_name || `Employee ${employee.id}`,
        value: String(employee.id),
    }));

    const timeOptions = availableTimes.map((time) => ({
        label: time,
        value: time,
    }));

    const summaryEmployee =
        employeePreference === EMPLOYEE_OPTIONS.ANY
            ? "Any employee"
            : selectedEmployee
              ? selectedEmployee.first_name && selectedEmployee.last_name
                  ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
                  : selectedEmployee.first_name ||
                    `Employee ${selectedEmployee.id}`
              : "Not selected";

    const blob1Y = float1.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -14],
    });

    const blob2Y = float2.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 16],
    });

    const heroMinHeight = Math.max(240, Math.min(height * 0.32, 300));

    if (isLoading) {
        return (
            <>
                <StatusBar barStyle="dark-content" />
                <View style={styles.loadingWrap}>
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="large" color="#9b664d" />
                        <Text style={styles.loadingTitle}>
                            Preparing Booking
                        </Text>
                        <Text style={styles.loadingText}>
                            Loading services, employees, and available times...
                        </Text>
                    </View>
                </View>
            </>
        );
    }

    return (
        <ScrollView style={commonUi.screen.pageMargins}>
            <Animated.View
                style={[
                    commonUi.screen.pageInnerGaps,
                    { minHeight: height, opacity: fadeIn, transform: [{ translateY: slideUp }] },
                ]}
            >
                <Pressable
                    style={({ pressed }) => [
                        commonUi.auth.backButton,
                        pressed && commonUi.card.cardPressed,
                    ]}
                    onPress={() => navigation.navigate(NAV_HOME)}
                >
                    <Text style={commonUi.auth.backButtonArrow}>←</Text>
                    <Text style={commonUi.auth.backButtonText}>Back</Text>
                </Pressable>

                <View
                    style={[
                        commonUi.hero.heroCard,
                        { minHeight: heroMinHeight },
                    ]}
                >
                    <Animated.View
                        style={[
                            commonUi.hero.blobOne,
                            { transform: [{ translateY: blob1Y }] },
                        ]}
                    />
                    <Animated.View
                        style={[
                            commonUi.hero.blobTwo,
                            { transform: [{ translateY: blob2Y }] },
                        ]}
                    />
                    <Animated.View
                        style={[
                            commonUi.hero.blobThree,
                            {
                                left: width * 0.56,
                                transform: [{ translateY: blob1Y }],
                            },
                        ]}
                    />

                    <View style={commonUi.hero.heroTopRow}>
                        <Text style={commonUi.hero.kicker}>
                            BOOK APPOINTMENT
                        </Text>
                    </View>

                    <View style={commonUi.hero.heroTextBlock}>
                        <Text style={commonUi.hero.heroTitle}>Create Your</Text>
                        <Text style={commonUi.hero.heroTitleAccent}>
                            Booking
                        </Text>
                        <Text style={commonUi.hero.heroText}>
                            Choose a service, pick your stylist, and reserve a
                            time that works best for you.
                        </Text>
                    </View>

                    <View style={commonUi.hero.metaRow}>
                        <View style={commonUi.hero.metaChip}>
                            <Text style={commonUi.hero.metaChipText}>
                                {selectedDate
                                    ? formatDisplayDate(selectedDate)
                                    : "Select your details below"}
                            </Text>
                        </View>
                    </View>

                    <View style={commonUi.hero.heroFadeWrap}>
                        <View style={commonUi.hero.heroFadeMain} />
                        <View style={commonUi.hero.heroFadeSmall} />
                    </View>
                </View>

                <InfoSelectCard
                    step="01"
                    title="Choose Service"
                    label="Select the service you want to book."
                    value={selectedTask?.name || "Choose a task"}
                    meta={selectedTask ? `${appointmentLength} min` : "Service"}
                    onPress={() => setShowTaskModal(true)}
                />

                <View style={commonUi.card.secondaryActionCard}>
                    <View style={commonUi.card.smallTopRow}>
                        <View style={commonUi.card.iconWrapSmall}>
                            <Text style={[commonUi.card.iconSmall, { fontSize: 13, fontWeight: "800" }]}>02</Text>
                        </View>
                        <Text style={commonUi.card.cornerText}>Preference</Text>
                    </View>

                    <Text style={commonUi.card.secondaryTitle}>Employee Choice</Text>
                    <Text style={[commonUi.card.secondaryDescription, { marginBottom: 14 }]}>
                        Pick any available employee or choose someone specific.
                    </Text>

                    <View style={styles.preferenceRow}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.preferenceChip,
                                employeePreference === EMPLOYEE_OPTIONS.ANY && styles.preferenceChipActive,
                                pressed && commonUi.card.cardPressed,
                            ]}
                            onPress={() =>
                                setEmployeePreference(EMPLOYEE_OPTIONS.ANY)
                            }
                        >
                            <Text
                                style={[
                                    styles.preferenceChipText,
                                    employeePreference ===
                                        EMPLOYEE_OPTIONS.ANY &&
                                        styles.preferenceChipTextActive,
                                ]}
                            >
                                Any employee
                            </Text>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [
                                styles.preferenceChip,
                                employeePreference === EMPLOYEE_OPTIONS.SPECIFIC && styles.preferenceChipActive,
                                pressed && commonUi.card.cardPressed,
                            ]}
                            onPress={() =>
                                setEmployeePreference(EMPLOYEE_OPTIONS.SPECIFIC)
                            }
                        >
                            <Text
                                style={[
                                    styles.preferenceChipText,
                                    employeePreference ===
                                        EMPLOYEE_OPTIONS.SPECIFIC &&
                                        styles.preferenceChipTextActive,
                                ]}
                            >
                                Specific employee
                            </Text>
                        </Pressable>
                    </View>

                    {employeePreference === EMPLOYEE_OPTIONS.SPECIFIC && (
                        <Pressable
                            style={({ pressed }) => [
                                commonUi.form.selectButton,
                                styles.employeeSelectButton,
                                pressed && commonUi.card.cardPressed,
                            ]}
                            onPress={() => setShowEmployeeModal(true)}
                        >
                            <Text style={commonUi.form.selectValue}>
                                {summaryEmployee === "Not selected" ? "Choose an employee" : summaryEmployee}
                            </Text>
                            <Text style={commonUi.form.selectChevron}>⌄</Text>
                        </Pressable>
                    )}
                </View>

                <InfoSelectCard
                    step="03"
                    title="Choose Date"
                    label="Select the day for your appointment."
                    value={formatDisplayDate(selectedDate)}
                    meta="Calendar"
                    onPress={() => setShowCalendar(true)}
                />

                <InfoSelectCard
                    step="04"
                    title="Choose Time"
                    label="Pick from the available times for that day."
                    value={
                        selectedTime ||
                        (availableTimes.length === 0
                            ? "No times available"
                            : "Choose a time")
                    }
                    meta="Time"
                    onPress={() => {
                        if (availableTimes.length > 0) {
                            setShowTimeModal(true);
                        }
                    }}
                    disabled={availableTimes.length === 0}
                />

                <View style={[commonUi.card.primaryActionCard, { minHeight: 270 }]}>
                    <View style={commonUi.card.cardGlow} />

                    <View style={commonUi.card.cardHeaderRow}>
                        <View style={commonUi.card.iconWrapLarge}>
                            <Text style={commonUi.card.iconLarge}>✦</Text>
                        </View>
                        <View style={commonUi.card.pillDark}>
                            <Text style={commonUi.card.pillDarkText}>Booking Summary</Text>
                        </View>
                    </View>

                    <Text style={commonUi.card.primaryTitle}>Review Details</Text>
                    <Text style={[commonUi.card.primaryDescription, { maxWidth: "96%" }]}>
                        Double-check your booking information before creating the appointment.
                    </Text>

                    <View style={styles.summaryGrid}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryKey}>Task</Text>
                            <Text style={styles.summaryValue}>
                                {selectedTask?.name || "Not selected"}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryKey}>Employee</Text>
                            <Text style={styles.summaryValue}>
                                {summaryEmployee}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryKey}>Date</Text>
                            <Text style={styles.summaryValue}>
                                {selectedDate
                                    ? formatDisplayDate(selectedDate)
                                    : "Not selected"}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryKey}>Time</Text>
                            <Text style={styles.summaryValue}>
                                {selectedTime || "Not selected"}
                            </Text>
                        </View>
                        {!!selectedTask && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryKey}>Duration</Text>
                                <Text style={styles.summaryValue}>
                                    {appointmentLength} min
                                </Text>
                            </View>
                        )}
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryKey}>Price</Text>
                            <Text style={styles.summaryValue}>
                                {formatPriceCad(selectedTask?.price_cad_cent) || "CA$0.00"}
                            </Text>
                        </View>
                    </View>

                    <Pressable
                        style={({ pressed }) => [
                            styles.innerCreateButton,
                            !isFormComplete && styles.createButtonDisabled,
                            pressed && isFormComplete && styles.cardPressed,
                        ]}
                        onPress={handleCreateAppointment}
                    >
                        <Text style={styles.innerCreateButtonText}>
                            Create Appointment
                        </Text>
                    </Pressable>
                </View>
            </Animated.View>

            <Modal
                visible={showCalendar}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCalendar(false)}
            >
                <View style={commonUi.modal.overlay}>
                    <Pressable style={commonUi.modal.backdrop} onPress={() => setShowCalendar(false)} />

                    <View style={styles.calendarCard}>
                        <Text style={styles.calendarTitle}>Choose a Date</Text>

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
                            markedDates={
                                selectedDate
                                    ? {
                                          [selectedDate]: {
                                              selected: true,
                                              selectedColor:
                                                  colorScheme.textAccent,
                                          },
                                      }
                                    : {}
                            }
                            minDate={new Date().toISOString().split("T")[0]}
                            theme={{
                                backgroundColor: colorScheme.whiteWarmCard,
                                calendarBackground: colorScheme.whiteWarmCard,
                                textSectionTitleColor:
                                    colorScheme.textAccentSoft,
                                selectedDayBackgroundColor:
                                    colorScheme.textAccent,
                                selectedDayTextColor: colorScheme.whiteSoft,
                                todayTextColor: colorScheme.textAccent,
                                dayTextColor: colorScheme.textDefault,
                                textDisabledColor: colorScheme.textDisabled,
                                monthTextColor: colorScheme.textDefault,
                                arrowColor: colorScheme.textAccent,
                            }}
                        />
                    </View>
                </View>
            </Modal>

            <OptionModal
                visible={showTaskModal}
                title="Choose a Task"
                options={taskOptions}
                selectedValue={selectedTaskId}
                onSelect={setSelectedTaskId}
                onClose={() => setShowTaskModal(false)}
            />

            <OptionModal
                visible={showEmployeeModal}
                title="Choose an Employee"
                options={employeeOptions}
                selectedValue={selectedEmployeeId}
                onSelect={setSelectedEmployeeId}
                onClose={() => setShowEmployeeModal(false)}
            />

            <OptionModal
                visible={showTimeModal}
                title="Choose a Time"
                options={timeOptions}
                selectedValue={selectedTime}
                onSelect={setSelectedTime}
                onClose={() => setShowTimeModal(false)}
                emptyText="No times available for this date"
                styles={styles}
            />
        </ScrollView>
    );
}

export function makeStyles(colorScheme) {
    return StyleSheet.create({
        preferenceRow: {
            flexDirection: "row",
            gap: 10,
            flexWrap: "wrap",
        },
        preferenceChip: {
            flex: 1,
            minWidth: 140,
            backgroundColor: colorScheme.panelBackground,
            borderRadius: 16,
            paddingVertical: 13,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderColor: colorScheme.borderLightAlt,
            alignItems: "center",
            justifyContent: "center",
        },
        preferenceChipActive: {
            backgroundColor: colorScheme.darkSurface,
            borderColor: colorScheme.darkSurface,
        },
        preferenceChipText: {
            fontSize: 14,
            fontWeight: "700",
            color: colorScheme.textMuted,
        },
        preferenceChipTextActive: {
            color: colorScheme.whiteWarm,
        },
        employeeSelectButton: {
            marginTop: 14,
        },
        summaryGrid: {
            gap: 8,
            marginBottom: 18,
        },
        summaryRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 10,
            paddingVertical: 3,
        },
        summaryKey: {
            fontSize: 14,
            color: colorScheme.whiteWarm,
            fontWeight: "700",
        },
        summaryValue: {
            flex: 1,
            textAlign: "right",
            fontSize: 14,
            color: colorScheme.whiteWarm,
            fontWeight: "700",
        },
        innerCreateButton: {
            backgroundColor: colorScheme.accentButton,
            borderRadius: 24,
            paddingVertical: 16,
            paddingHorizontal: 18,
            alignItems: "center",
            justifyContent: "center",
            marginTop: "auto",
        },
        innerCreateButtonText: {
            fontSize: 15,
            fontWeight: "800",
            color: colorScheme.textDefault,
            letterSpacing: 0.2,
        },
        createButtonDisabled: {
            opacity: 0.72,
        },
        loadingWrap: {
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: 20,
            backgroundColor: colorScheme.pageBackground,
        },
        loadingCard: {
            backgroundColor: colorScheme.whiteWarmCard,
            borderRadius: 28,
            paddingHorizontal: 24,
            paddingVertical: 28,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
        },
        loadingTitle: {
            marginTop: 16,
            fontSize: 20,
            fontWeight: "800",
            color: colorScheme.textDarkest,
        },
        loadingText: {
            marginTop: 8,
            fontSize: 14,
            lineHeight: 21,
            color: colorScheme.textMuted,
            textAlign: "center",
        },
        calendarCard: {
            width: "100%",
            maxWidth: 420,
            backgroundColor: colorScheme.whiteWarmCard,
            borderRadius: 28,
            padding: 16,
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
        },
        calendarTitle: {
            fontSize: 18,
            fontWeight: "800",
            color: colorScheme.textDarkest,
            marginBottom: 12,
            textAlign: "center",
        },
    });
}
