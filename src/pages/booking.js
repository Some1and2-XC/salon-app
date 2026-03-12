import React, { useMemo, useState } from "react";
import { View, Text, Button, Alert } from "react-native";
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

const TASKS = [
    { id: 1, name: "nails1" },
    { id: 2, name: "nails2" },
    { id: 3, name: "nails3" },
];

const EMPLOYEES = [
    { id: 1, name: "Anna" },
    { id: 2, name: "John" },
    { id: 3, name: "Mike" },
];

const EMPLOYEE_OPTIONS = {
    ANY: "ANY",
    SPECIFIC: "SPECIFIC",
};

// examples availabilities for now (lenght in seconds)
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

function buildAppointment(day, time, taskId, employeePreference, employeeId) {
    return {
        uuid: null,
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
        user_id: null,
    };
}

function formatTime(totalMinutes) {
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

async function createAppointmentRequest(appointment) {
    console.log("saving", appointment);
    return appointment;
}

export function BookingScreen() {
    const [selectedDay, setSelectedDay] = useState(1);
    const [selectedTime, setSelectedTime] = useState(
        getAvailableTimesForDay(1)[0] || "",
    );
    const [selectedTaskId, setSelectedTaskId] = useState(TASKS[0].id);
    const [employeePreference, setEmployeePreference] = useState(
        EMPLOYEE_OPTIONS.ANY,
    );
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(
        EMPLOYEES[0].id,
    );

    const availableTimes = useMemo(() => {
        return getAvailableTimesForDay(selectedDay);
    }, [selectedDay]);

    const handleDayChange = (day) => {
        setSelectedDay(day);

        const nextTimes = getAvailableTimesForDay(day);
        setSelectedTime(nextTimes.length > 0 ? nextTimes[0] : "");
    };

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
            selectedDay,
            selectedTime,
            selectedTaskId,
            employeePreference,
            selectedEmployeeId,
        );

        await createAppointmentRequest(appointment);

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
                {TASKS.map((task) => (
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
                        {EMPLOYEES.map((employee) => (
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

// export function BookingScreen() {
//   const staff = ["Anna", "John", "Mike"];

//   const generateTimeSlots = () => {
//     const times = [];
//     let hour = 6;
//     let minutes = 0;

//     while (hour < 12) {
//       // change to 22 for full day
//       const formattedHour = hour.toString().padStart(2, "0");
//       const formattedMin = minutes.toString().padStart(2, "0");

//       times.push(`${formattedHour}:${formattedMin}`);

//       minutes += 15;
//       if (minutes === 60) {
//         minutes = 0;
//         hour++;
//       }
//     }

//     return times;
//   };

//   const timeSlots = generateTimeSlots();

//   return (
//     <View>
//       {/* Header Row */}
//       <View>
//         <View>
//           <Text>Time</Text>
//         </View>

//         {staff.map((person, index) => (
//           <View key={index}>
//             <Text>{person}</Text>
//           </View>
//         ))}
//       </View>

//       {/* Time Rows */}
//       {timeSlots.map((time, rowIndex) => (
//         <View key={rowIndex}>
//           <View>
//             <Text>{time}</Text>
//           </View>

//           {staff.map((_, colIndex) => (
//             <TouchableOpacity
//               key={colIndex}
//               onPress={() => alert(`Booked ${time}`)}
//             >
//               <Text></Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       ))}
//     </View>
//   );
// }
