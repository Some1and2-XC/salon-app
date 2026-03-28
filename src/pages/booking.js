import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  Platform,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { apiFetch } from "../utils";

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
    const message = errorBody?.message || `Server error: ${response.status}`;
    throw new Error(message);
  }

  return await response.json();
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
  appointmentLength
) {
  const [hours, minutes] = time.split(":").map(Number);
  const startDate = new Date(date + "T00:00:00");
  startDate.setHours(hours, minutes, 0, 0);
  const startTimestamp = Math.floor(startDate.getTime() / 1000);

  const appointment = {
    appointment_state_id: 0,
    length: appointmentLength,
    start_time: startTimestamp,
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
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.optionModalCard}>
          <View style={styles.optionModalHeader}>
            <Text style={styles.optionModalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.optionModalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.optionModalList}
            contentContainerStyle={styles.optionModalListContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {options.length === 0 ? (
              <Text style={styles.emptyOptionText}>{emptyText}</Text>
            ) : (
              options.map((option) => {
                const isSelected = option.value === selectedValue;
                return (
                  <TouchableOpacity
                    key={String(option.value)}
                    style={[
                      styles.optionRow,
                      isSelected && styles.optionRowSelected,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => {
                      onSelect(option.value);
                      onClose();
                    }}
                  >
                    <View style={styles.optionTextWrap}>
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {!!option.subLabel && (
                        <Text
                          style={[
                            styles.optionSubLabel,
                            isSelected && styles.optionSubLabelSelected,
                          ]}
                        >
                          {option.subLabel}
                        </Text>
                      )}
                    </View>
                    {isSelected && <Text style={styles.optionCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function BookingScreen() {
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
    EMPLOYEE_OPTIONS.ANY
  );

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  const selectedTask = tasks.find((t) => String(t.id) === String(selectedTaskId));
  const selectedEmployee = employees.find(
    (e) => String(e.id) === String(selectedEmployeeId)
  );
  const appointmentLength = (selectedTask?.time_for_booking || 900) / 60;

  const availableTimes = useMemo(() => {
    if (!selectedDate) return [];
    return getAvailableTimesForDay(
      new Date(selectedDate + "T12:00:00").getDay(),
      availabilities,
      appointmentLength
    );
  }, [selectedDate, availabilities, appointmentLength]);

  useEffect(() => {
    setSelectedTime(availableTimes.length > 0 ? availableTimes[0] : "");
  }, [availableTimes]);

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

  const handleDayChange = (weekday) => {
    const nextTimes = getAvailableTimesForDay(
      weekday,
      availabilities,
      appointmentLength
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
        "Please select an employee or choose any."
      );
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

    const appointment = buildAppointment(
      selectedDate,
      selectedTime,
      Number(selectedTaskId),
      employeePreference,
      selectedEmployeeId,
      appointmentLength
    );

    try {
      await createAppointmentRequest(appointment);
      showAlert("Success", "Your appointment has been booked.");
    } catch (err) {
      console.error(err);
      if (err.message.includes("401") || err.message.includes("403")) {
        showAlert("Session Expired", "Please log in again.");
      } else if (err.message.includes("Network request failed")) {
        showAlert("No Connection", "Check your internet and try again.");
      } else {
        showAlert("Error", err.message || "Failed to create appointment.");
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
        : selectedEmployee.first_name || `Employee ${selectedEmployee.id}`
      : "Not selected";

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.safeArea, Platform.OS === "web" && styles.safeAreaWeb]}
      >
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingWrap}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#9b664d" />
            <Text style={styles.loadingTitle}>Preparing Booking</Text>
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
      style={[styles.safeArea, Platform.OS === "web" && styles.safeAreaWeb]}
    >
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={[styles.scrollView, Platform.OS === "web" && styles.scrollViewWeb]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.pageWrap}>
          <View style={styles.heroCard}>
            <View style={styles.heroBubbleOne} />
            <View style={styles.heroBubbleTwo} />
            <Text style={styles.kicker}>BOOK APPOINTMENT</Text>
            <Text style={styles.heroTitle}>Create Your</Text>
            <Text style={styles.heroAccent}>Booking</Text>
            <Text style={styles.heroText}>
              Choose a service, your stylist and reserve a
              time that works best for you.
            </Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>1. Select a task</Text>
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.selectButton}
              onPress={() => setShowTaskModal(true)}
            >
              <View>
                <Text style={styles.selectLabel}>Service</Text>
                <Text style={styles.selectValue}>
                  {selectedTask?.name || "Choose a task"}
                </Text>
              </View>
              <View style={styles.selectRight}>
                {!!selectedTask && (
                  <Text style={styles.selectMeta}>{appointmentLength} min</Text>
                )}
                <Text style={styles.selectChevron}>⌄</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>2. Employee preference</Text>

            <View style={styles.preferenceRow}>
              <TouchableOpacity
                activeOpacity={0.88}
                style={[
                  styles.preferenceChip,
                  employeePreference === EMPLOYEE_OPTIONS.ANY &&
                    styles.preferenceChipActive,
                ]}
                onPress={() => setEmployeePreference(EMPLOYEE_OPTIONS.ANY)}
              >
                <Text
                  style={[
                    styles.preferenceChipText,
                    employeePreference === EMPLOYEE_OPTIONS.ANY &&
                      styles.preferenceChipTextActive,
                  ]}
                >
                  Any employee
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                style={[
                  styles.preferenceChip,
                  employeePreference === EMPLOYEE_OPTIONS.SPECIFIC &&
                    styles.preferenceChipActive,
                ]}
                onPress={() =>
                  setEmployeePreference(EMPLOYEE_OPTIONS.SPECIFIC)
                }
              >
                <Text
                  style={[
                    styles.preferenceChipText,
                    employeePreference === EMPLOYEE_OPTIONS.SPECIFIC &&
                      styles.preferenceChipTextActive,
                  ]}
                >
                  Specific employee
                </Text>
              </TouchableOpacity>
            </View>

            {employeePreference === EMPLOYEE_OPTIONS.SPECIFIC && (
              <TouchableOpacity
                activeOpacity={0.88}
                style={[styles.selectButton, { marginTop: 14 }]}
                onPress={() => setShowEmployeeModal(true)}
              >
                <View>
                  <Text style={styles.selectLabel}>Employee</Text>
                  <Text style={styles.selectValue}>
                    {summaryEmployee === "Not selected"
                      ? "Choose an employee"
                      : summaryEmployee}
                  </Text>
                </View>
                <Text style={styles.selectChevron}>⌄</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>3. Select a date</Text>
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.selectButton}
              onPress={() => setShowCalendar(true)}
            >
              <View>
                <Text style={styles.selectLabel}>Appointment day</Text>
                <Text style={styles.selectValue}>
                  {formatDisplayDate(selectedDate)}
                </Text>
              </View>
              <Text style={styles.selectChevron}>⌄</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>4. Select a time</Text>
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.selectButton}
              onPress={() => {
                if (availableTimes.length > 0) {
                  setShowTimeModal(true);
                }
              }}
            >
              <View>
                <Text style={styles.selectLabel}>Available time</Text>
                <Text style={styles.selectValue}>
                  {selectedTime ||
                    (availableTimes.length === 0
                      ? "No times available"
                      : "Choose a time")}
                </Text>
              </View>
              <Text style={styles.selectChevron}>⌄</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Task</Text>
              <Text style={styles.summaryValue}>
                {selectedTask?.name || "Not selected"}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Employee</Text>
              <Text style={styles.summaryValue}>{summaryEmployee}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Date</Text>
              <Text style={styles.summaryValue}>
                {selectedDate ? formatDisplayDate(selectedDate) : "Not selected"}
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
                <Text style={styles.summaryValue}>{appointmentLength} min</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.createButton,
              !isFormComplete && styles.createButtonDisabled,
            ]}
            onPress={handleCreateAppointment}
          >
            <Text style={styles.createButtonText}>Create Appointment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowCalendar(false)}
          />
          <View style={styles.calendarCard}>
            <Text style={styles.calendarTitle}>Choose a Date</Text>
            <Calendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                handleDayChange(
                  new Date(day.dateString + "T12:00:00").getDay()
                );
                setShowCalendar(false);
              }}
              markedDates={
                selectedDate
                  ? {
                      [selectedDate]: {
                        selected: true,
                        selectedColor: "#9b664d",
                      },
                    }
                  : {}
              }
              minDate={new Date().toISOString().split("T")[0]}
              theme={{
                backgroundColor: "#fff8f2",
                calendarBackground: "#fff8f2",
                textSectionTitleColor: "#7f5d4d",
                selectedDayBackgroundColor: "#9b664d",
                selectedDayTextColor: "#fffaf6",
                todayTextColor: "#9b664d",
                dayTextColor: "#2b1b15",
                textDisabledColor: "#ccb8ab",
                monthTextColor: "#2b1b15",
                arrowColor: "#9b664d",
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
  safeArea: {
    flex: 1,
    backgroundColor: "#f5efe9",
  },

  // Web: stack/nav parents often don't pass a bounded height; without this the
  // ScrollView grows with content and the page clips with no scroll.
  safeAreaWeb: {
    height: "100vh",
    maxHeight: "100vh",
    overflow: "hidden",
  },

  scrollView: {
    flex: 1,
    width: "100%",
  },

  // Web: allow the flex child to shrink so overflow scrolls inside the viewport.
  scrollViewWeb: {
    minHeight: 0,
  },

  scrollContent: {
    paddingBottom: 80,
  },

  pageWrap: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 24,
    gap: 12,
  },

  heroCard: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#ead7ca",
    borderRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 26,
  },

  heroBubbleOne: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#d9c3b4",
    opacity: 0.35,
    right: -40,
    top: -30,
  },

  heroBubbleTwo: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#f3e7de",
    opacity: 0.8,
    right: 34,
    bottom: -18,
  },

  kicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.7,
    textTransform: "uppercase",
    color: "#7f5d4d",
    marginBottom: 12,
  },

  heroTitle: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "800",
    color: "#231712",
  },

  heroAccent: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "800",
    color: "#9b664d",
    marginBottom: 12,
  },

  heroText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#5e473c",
    maxWidth: "84%",
  },

  sectionCard: {
    backgroundColor: "#fff8f2",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: "#ead9ce",
  },

  sectionLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#281c17",
    marginBottom: 12,
  },

  selectButton: {
    backgroundColor: "#f3e7de",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "#e5d2c5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8b6d5e",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  selectValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2b1b15",
  },

  selectRight: {
    alignItems: "flex-end",
    gap: 4,
  },

  selectMeta: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8b6d5e",
  },

  selectChevron: {
    fontSize: 24,
    color: "#7f5d4d",
    marginLeft: 12,
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
    backgroundColor: "#f3e7de",
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e5d2c5",
    alignItems: "center",
    justifyContent: "center",
  },

  preferenceChipActive: {
    backgroundColor: "#241713",
    borderColor: "#241713",
  },

  preferenceChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6a5348",
  },

  preferenceChipTextActive: {
    color: "#fff8f3",
  },

  summaryCard: {
    backgroundColor: "#ead7ca",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#231712",
    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 5,
    gap: 10,
  },

  summaryKey: {
    fontSize: 14,
    color: "#6a5348",
    fontWeight: "700",
  },

  summaryValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    color: "#2b1b15",
    fontWeight: "700",
  },

  createButton: {
    backgroundColor: "#241713",
    borderRadius: 22,
    paddingVertical: 17,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  createButtonDisabled: {
    opacity: 0.72,
  },

  createButtonText: {
    color: "#fff8f3",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f5efe9",
  },

  loadingCard: {
    backgroundColor: "#fff8f2",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ead9ce",
  },

  loadingTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "800",
    color: "#231712",
  },

  loadingText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#6a5348",
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
    backgroundColor: "rgba(36, 23, 19, 0.22)",
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
    backgroundColor: "#fff8f2",
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ead9ce",
  },

  calendarTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#231712",
    marginBottom: 12,
    textAlign: "center",
  },

  optionModalCard: {
    width: "100%",
    maxWidth: 430,
    maxHeight: "70%",
    backgroundColor: "#fff8f2",
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: "#ead9ce",
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
    color: "#231712",
  },

  optionModalClose: {
    fontSize: 18,
    fontWeight: "800",
    color: "#7f5d4d",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  optionModalList: {
    maxHeight: 420,
  },

  optionModalListContent: {
    paddingBottom: 8,
  },

  optionRow: {
    backgroundColor: "#f3e7de",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e5d2c5",
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionRowSelected: {
    backgroundColor: "#ead7ca",
    borderColor: "#9b664d",
  },

  optionTextWrap: {
    flex: 1,
    paddingRight: 12,
  },

  optionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2b1b15",
  },

  optionLabelSelected: {
    color: "#231712",
  },

  optionSubLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#7f5d4d",
    fontWeight: "600",
  },

  optionSubLabelSelected: {
    color: "#9b664d",
  },

  optionCheck: {
    fontSize: 18,
    fontWeight: "800",
    color: "#9b664d",
  },

  emptyOptionText: {
    fontSize: 14,
    color: "#6a5348",
    textAlign: "center",
    paddingVertical: 22,
  },
});