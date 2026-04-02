import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    Alert,
    Platform,
    Modal,
    Pressable,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    Animated,
    useWindowDimensions,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { apiFetch } from "../utils";
import { NAV_HOME } from "../consts";
import { commonUi } from "../styles";
import { colorScheme } from "../colorScheme";

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

async function createAppointmentRequest(appointment) {
    const response = await apiFetch("/appointments", {
        method: "POST",
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

function getAvailableTimesForDay(day, availabilities, appointmentLength) {
    const slots = [];

    for (const slot of availabilities) {
        const slotDay = Math.floor(slot.start_time / (24 * 60 * 60));
        if (slotDay !== day) continue;

        const startSeconds = slot.start_time % (24 * 60 * 60);
        const endSeconds = slot.end_time % (24 * 60 * 60);

        let current = startSeconds;
        while (current + appointmentLength * 60 <= endSeconds) {
            const hours = Math.floor(current / 3600);
            const minutes = Math.floor((current % 3600) / 60);
            slots.push(formatTime(hours * 60 + minutes));
            current += appointmentLength * 60;
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

function OptionModal({
    visible,
    title,
    options,
    selectedValue,
    onSelect,
    onClose,
    emptyText = "No options available",
}) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <Pressable style={styles.modalBackdrop} onPress={onClose} />

                <View style={styles.optionModalCard}>
                    <View style={styles.optionModalHeader}>
                        <Text style={styles.optionModalTitle}>{title}</Text>

                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.optionModalClose}>✕</Text>
                        </Pressable>
                    </View>

                    <ScrollView
                        style={styles.optionModalList}
                        contentContainerStyle={styles.optionModalListContent}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                    >
                        {options.length === 0 ? (
                            <Text style={styles.emptyOptionText}>
                                {emptyText}
                            </Text>
                        ) : (
                            options.map((option) => {
                                const isSelected =
                                    option.value === selectedValue;

                                return (
                                    <Pressable
                                        key={String(option.value)}
                                        style={({ pressed }) => [
                                            styles.optionRow,
                                            isSelected &&
                                                styles.optionRowSelected,
                                            pressed && styles.optionRowPressed,
                                        ]}
                                        onPress={() => {
                                            onSelect(option.value);
                                            onClose();
                                        }}
                                    >
                                        <View style={styles.optionTextWrap}>
                                            <Text
                                                style={[
                                                    styles.optionLabel,
                                                    isSelected &&
                                                        styles.optionLabelSelected,
                                                ]}
                                            >
                                                {option.label}
                                            </Text>

                                            {!!option.subLabel && (
                                                <Text
                                                    style={[
                                                        styles.optionSubLabel,
                                                        isSelected &&
                                                            styles.optionSubLabelSelected,
                                                    ]}
                                                >
                                                    {option.subLabel}
                                                </Text>
                                            )}
                                        </View>

                                        {isSelected && (
                                            <Text style={styles.optionCheck}>
                                                ✓
                                            </Text>
                                        )}
                                    </Pressable>
                                );
                            })
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
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
    return (
        <View style={styles.secondaryActionCardFull}>
            <View style={styles.smallTopRow}>
                <View style={styles.iconWrapSmall}>
                    <Text style={styles.iconSmall}>{step}</Text>
                </View>

                {!!meta && <Text style={styles.cornerText}>{meta}</Text>}
            </View>

            <Text style={styles.secondaryTitle}>{title}</Text>
            <Text style={styles.secondaryDescription}>{label}</Text>

            <Pressable
                style={({ pressed }) => [
                    styles.selectButton,
                    disabled && styles.selectButtonDisabled,
                    pressed && !disabled && styles.cardPressed,
                ]}
                onPress={disabled ? undefined : onPress}
            >
                <Text
                    style={[
                        styles.selectValue,
                        disabled && styles.selectValueMuted,
                    ]}
                >
                    {value}
                </Text>
                <Text style={styles.selectChevron}>⌄</Text>
            </Pressable>
        </View>
    );
}

export function BookingScreen({ navigation }) {
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

    const handleCreateAppointment = async () => {
        if (!selectedTaskId) {
            showAlert("No task selected", "Please select a task.");
            return;
        }

        if (!selectedDate) {
            showAlert("No date selected", "Please select a date.");
            return;
        }

        if (!selectedTime) {
            showAlert("No time selected", "Please select an available time.");
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
                showAlert(
                    "No employee available",
                    "No employee is available for that time.",
                );
                return;
            }
        } else if (
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
            selectedDate,
            selectedTime,
            Number(selectedTaskId),
            EMPLOYEE_OPTIONS.SPECIFIC,
            employeeId,
            appointmentLength,
        );

        try {
            await createAppointmentRequest(appointment);
            showAlert("Success", "Your appointment has been booked.");
        } catch (err) {
            console.error(err);

            if (err.message.includes("401") || err.message.includes("403")) {
                showAlert("Session Expired", "Please log in again.");
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

    const isFormComplete =
        !!selectedTaskId &&
        !!selectedDate &&
        !!selectedTime &&
        (employeePreference === EMPLOYEE_OPTIONS.ANY || !!selectedEmployeeId);

    const taskOptions = tasks.map((task) => ({
        label: task.name,
        value: String(task.id),
        subLabel: `${(task.time_for_booking || 900) / 60} min`,
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
            <SafeAreaView
                style={[
                    styles.safeArea,
                    Platform.OS === "web" && styles.safeAreaWeb,
                ]}
            >
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
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={[
                styles.safeArea,
                Platform.OS === "web" && styles.safeAreaWeb,
            ]}
        >
            <StatusBar barStyle="dark-content" />

            <ScrollView
                style={[
                    styles.scrollView,
                    Platform.OS === "web" && styles.scrollViewWeb,
                ]}
                contentContainerStyle={[
                    styles.scrollContent,
                    { minHeight: height },
                ]}
                showsVerticalScrollIndicator={false}
                bounces={true}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View
                    style={[
                        styles.pageWrap,
                        {
                            minHeight: height,
                            opacity: fadeIn,
                            transform: [{ translateY: slideUp }],
                        },
                    ]}
                >
                    <View style={styles.screenInner}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.backButton,
                                pressed && styles.cardPressed,
                            ]}
                            onPress={() => navigation.navigate(NAV_HOME)}
                        >
                            <Text style={styles.backButtonArrow}>←</Text>
                            <Text style={styles.backButtonText}>
                                Back to Home
                            </Text>
                        </Pressable>

                        <View
                            style={[
                                styles.heroCard,
                                { minHeight: heroMinHeight },
                            ]}
                        >
                            <Animated.View
                                style={[
                                    styles.blobOne,
                                    { transform: [{ translateY: blob1Y }] },
                                ]}
                            />
                            <Animated.View
                                style={[
                                    styles.blobTwo,
                                    { transform: [{ translateY: blob2Y }] },
                                ]}
                            />
                            <Animated.View
                                style={[
                                    styles.blobThree,
                                    {
                                        left: width * 0.56,
                                        transform: [{ translateY: blob1Y }],
                                    },
                                ]}
                            />

                            <View style={styles.heroTopRow}>
                                <Text style={styles.kicker}>
                                    BOOK APPOINTMENT
                                </Text>
                            </View>

                            <View style={styles.heroTextBlock}>
                                <Text style={styles.heroTitle}>
                                    Create Your
                                </Text>
                                <Text style={styles.heroTitleAccent}>
                                    Booking
                                </Text>
                                <Text style={styles.heroText}>
                                    Choose a service, pick your stylist, and
                                    reserve a time that works best for you.
                                </Text>
                            </View>

                            <View style={styles.metaRow}>
                                <View style={styles.metaChip}>
                                    <Text style={styles.metaChipText}>
                                        {selectedDate
                                            ? formatDisplayDate(selectedDate)
                                            : "Select your details below"}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.heroFadeWrap}>
                                <View style={styles.heroFadeMain} />
                                <View style={styles.heroFadeSmall} />
                            </View>
                        </View>

                        <InfoSelectCard
                            step="01"
                            title="Choose Service"
                            label="Select the service you want to book."
                            value={selectedTask?.name || "Choose a task"}
                            meta={
                                selectedTask
                                    ? `${appointmentLength} min`
                                    : "Service"
                            }
                            onPress={() => setShowTaskModal(true)}
                        />

                        <View style={styles.secondaryActionCardFull}>
                            <View style={styles.smallTopRow}>
                                <View style={styles.iconWrapSmall}>
                                    <Text style={styles.iconSmall}>02</Text>
                                </View>
                                <Text style={styles.cornerText}>
                                    Preference
                                </Text>
                            </View>

                            <Text style={styles.secondaryTitle}>
                                Employee Choice
                            </Text>
                            <Text style={styles.secondaryDescription}>
                                Pick any available employee or choose someone
                                specific.
                            </Text>

                            <View style={styles.preferenceRow}>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.preferenceChip,
                                        employeePreference ===
                                            EMPLOYEE_OPTIONS.ANY &&
                                            styles.preferenceChipActive,
                                        pressed && styles.cardPressed,
                                    ]}
                                    onPress={() =>
                                        setEmployeePreference(
                                            EMPLOYEE_OPTIONS.ANY,
                                        )
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
                                        employeePreference ===
                                            EMPLOYEE_OPTIONS.SPECIFIC &&
                                            styles.preferenceChipActive,
                                        pressed && styles.cardPressed,
                                    ]}
                                    onPress={() =>
                                        setEmployeePreference(
                                            EMPLOYEE_OPTIONS.SPECIFIC,
                                        )
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

                            {employeePreference ===
                                EMPLOYEE_OPTIONS.SPECIFIC && (
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.selectButton,
                                        styles.employeeSelectButton,
                                        pressed && styles.cardPressed,
                                    ]}
                                    onPress={() => setShowEmployeeModal(true)}
                                >
                                    <Text style={styles.selectValue}>
                                        {summaryEmployee === "Not selected"
                                            ? "Choose an employee"
                                            : summaryEmployee}
                                    </Text>
                                    <Text style={styles.selectChevron}>⌄</Text>
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

                        <View style={styles.primaryActionCard}>
                            <View style={styles.cardGlow} />

                            <View style={styles.cardHeaderRow}>
                                <View style={styles.iconWrapLarge}>
                                    <Text style={styles.iconLarge}>✦</Text>
                                </View>

                                <View style={styles.pillDark}>
                                    <Text style={styles.pillDarkText}>
                                        Booking Summary
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.primaryTitle}>
                                Review Details
                            </Text>
                            <Text style={styles.primaryDescription}>
                                Double-check your booking information before
                                creating the appointment.
                            </Text>

                            <View style={styles.summaryGrid}>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryKey}>Task</Text>
                                    <Text style={styles.summaryValue}>
                                        {selectedTask?.name || "Not selected"}
                                    </Text>
                                </View>

                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryKey}>
                                        Employee
                                    </Text>
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
                                        <Text style={styles.summaryKey}>
                                            Duration
                                        </Text>
                                        <Text style={styles.summaryValue}>
                                            {appointmentLength} min
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.innerCreateButton,
                                    !isFormComplete &&
                                        styles.createButtonDisabled,
                                    pressed &&
                                        isFormComplete &&
                                        styles.cardPressed,
                                ]}
                                onPress={handleCreateAppointment}
                            >
                                <Text style={styles.innerCreateButtonText}>
                                    Create Appointment
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            <Modal
                visible={showCalendar}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCalendar(false)}
            >
                <View style={styles.modalOverlay}>
                    <Pressable
                        style={styles.modalBackdrop}
                        onPress={() => setShowCalendar(false)}
                    />

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
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: commonUi.screen.safeArea,
    safeAreaWeb: commonUi.screen.safeAreaWeb,
    scrollView: commonUi.screen.scrollView,
    scrollViewWeb: commonUi.screen.scrollViewWeb,
    scrollContent: commonUi.screen.scrollContent,
    pageWrap: commonUi.screen.pageWrapNarrow,
    screenInner: commonUi.screen.screenInner,

    backButton: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: colorScheme.whiteWarmCard,
        borderRadius: 999,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: colorScheme.borderLight,
        marginBottom: 12,
    },

    backButtonArrow: {
        fontSize: 18,
        color: colorScheme.textAccentSoft,
        marginRight: 8,
        fontWeight: "800",
    },

    backButtonText: {
        fontSize: 14,
        fontWeight: "700",
        color: colorScheme.textDefault,
    },

    heroCard: commonUi.hero.heroCard,
    heroTopRow: commonUi.hero.heroTopRow,
    heroTextBlock: commonUi.hero.heroTextBlock,
    heroFadeWrap: commonUi.hero.heroFadeWrap,
    heroFadeMain: commonUi.hero.heroFadeMain,
    heroFadeSmall: commonUi.hero.heroFadeSmall,
    blobOne: commonUi.hero.blobOne,
    blobTwo: commonUi.hero.blobTwo,
    blobThree: commonUi.hero.blobThree,
    kicker: commonUi.hero.kicker,
    heroTitle: commonUi.hero.heroTitle,
    heroTitleAccent: commonUi.hero.heroTitleAccent,

    heroText: {
        fontSize: 15,
        lineHeight: 22,
        color: colorScheme.textSubtle,
        maxWidth: "82%",
    },

    metaRow: commonUi.hero.metaRow,
    metaChip: commonUi.hero.metaChip,
    metaChipText: commonUi.hero.metaChipText,

    secondaryActionCardFull: {
        backgroundColor: colorScheme.whiteWarmCard,
        borderRadius: 28,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 18,
        minHeight: 150,
        borderWidth: 1,
        borderColor: colorScheme.borderLight,
        width: "100%",
        marginBottom: 14,
    },

    smallTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },

    iconWrapSmall: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colorScheme.panelBackgroundAlt,
        alignItems: "center",
        justifyContent: "center",
    },

    iconSmall: {
        fontSize: 13,
        fontWeight: "800",
        color: colorScheme.textAccentSoft,
    },

    cornerText: {
        fontSize: 12,
        fontWeight: "700",
        color: colorScheme.textLabel,
    },

    secondaryTitle: {
        fontSize: 22,
        lineHeight: 26,
        fontWeight: "800",
        color: colorScheme.textDark,
        marginBottom: 6,
    },

    secondaryDescription: {
        fontSize: 13.5,
        lineHeight: 20,
        color: colorScheme.textMuted,
        maxWidth: "92%",
        marginBottom: 14,
    },

    selectButton: {
        backgroundColor: colorScheme.panelBackground,
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: colorScheme.borderLightAlt,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    selectButtonDisabled: {
        opacity: 0.6,
    },

    employeeSelectButton: {
        marginTop: 14,
    },

    selectValue: {
        flex: 1,
        fontSize: 15,
        fontWeight: "700",
        color: colorScheme.textDefault,
        paddingRight: 10,
    },

    selectValueMuted: {
        color: colorScheme.textLabel,
    },

    selectChevron: {
        fontSize: 24,
        color: colorScheme.textAccentSoft,
        marginTop: -2,
    },

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

    primaryActionCard: {
        position: "relative",
        overflow: "hidden",
        backgroundColor: colorScheme.darkSurface,
        borderRadius: 28,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 18,
        marginBottom: 8,
        minHeight: 270,
        width: "100%",
    },

    cardGlow: {
        position: "absolute",
        width: 170,
        height: 170,
        borderRadius: 85,
        backgroundColor: colorScheme.accentGlow,
        top: -40,
        right: -30,
        opacity: 0.13,
    },

    cardHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 18,
    },

    iconWrapLarge: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colorScheme.overlayWhiteSoft,
        alignItems: "center",
        justifyContent: "center",
    },

    iconLarge: {
        fontSize: 22,
        color: colorScheme.accentHighlight,
    },

    pillDark: {
        backgroundColor: colorScheme.overlayAccentSoft,
        borderRadius: 999,
        paddingHorizontal: 11,
        paddingVertical: 7,
    },

    pillDarkText: {
        color: colorScheme.accentHighlight,
        fontSize: 12,
        fontWeight: "700",
    },

    primaryTitle: {
        fontSize: 26,
        lineHeight: 31,
        fontWeight: "800",
        color: colorScheme.whiteWarm,
        marginBottom: 9,
        maxWidth: "82%",
    },

    primaryDescription: {
        fontSize: 14,
        lineHeight: 21,
        color: colorScheme.textOnDark,
        maxWidth: "96%",
        marginBottom: 18,
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
        color: colorScheme.textOnDark,
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

    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 18,
        backgroundColor: colorScheme.overlayDarkSoft,
    },

    modalBackdrop: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
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

    optionModalCard: {
        width: "100%",
        maxWidth: 430,
        maxHeight: "70%",
        backgroundColor: colorScheme.whiteWarmCard,
        borderRadius: 28,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 14,
        borderWidth: 1,
        borderColor: colorScheme.borderLight,
    },

    optionModalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },

    optionModalTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: colorScheme.textDarkest,
    },

    closeButton: {
        paddingHorizontal: 6,
        paddingVertical: 2,
    },

    optionModalClose: {
        fontSize: 18,
        fontWeight: "800",
        color: colorScheme.textAccentSoft,
    },

    optionModalList: {
        maxHeight: 420,
    },

    optionModalListContent: {
        paddingBottom: 8,
    },

    optionRow: {
        backgroundColor: colorScheme.panelBackground,
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: colorScheme.borderLightAlt,
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    optionRowSelected: {
        backgroundColor: colorScheme.accentTint,
        borderColor: colorScheme.textAccent,
    },

    optionRowPressed: {
        opacity: 0.92,
        transform: [{ scale: 0.99 }],
    },

    optionTextWrap: {
        flex: 1,
        paddingRight: 12,
    },

    optionLabel: {
        fontSize: 15,
        fontWeight: "700",
        color: colorScheme.textDefault,
    },

    optionLabelSelected: {
        color: colorScheme.textDarkest,
    },

    optionSubLabel: {
        marginTop: 4,
        fontSize: 12,
        color: colorScheme.textAccentSoft,
        fontWeight: "600",
    },

    optionSubLabelSelected: {
        color: colorScheme.textAccent,
    },

    optionCheck: {
        fontSize: 18,
        fontWeight: "800",
        color: colorScheme.textAccent,
    },

    emptyOptionText: {
        fontSize: 14,
        color: colorScheme.textMuted,
        textAlign: "center",
        paddingVertical: 22,
    },

    cardPressed: {
        opacity: 0.93,
        transform: [{ scale: 0.985 }],
    },
});
