import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

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

// examples availabilities for now (lenght in minutes)
const AVAILABILITIES = [
  { week_day: 1, starting_hour: 9, starting_minute: 0, length: 30 },
  { week_day: 1, starting_hour: 13, starting_minute: 0, length: 60 },
  { week_day: 2, starting_hour: 10, starting_minute: 0, length: 120 },
  { week_day: 3, starting_hour: 11, starting_minute: 0, length: 30 },
  { week_day: 4, starting_hour: 9, starting_minute: 30, length: 60 },
  { week_day: 5, starting_hour: 12, starting_minute: 0, length: 45 },
];

export function BookingScreen() {
  const staff = ["Anna", "John", "Mike"];

  const generateTimeSlots = () => {
    const times = [];
    let hour = 6;
    let minutes = 0;

    while (hour < 12) {
      // change to 22 for full day
      const formattedHour = hour.toString().padStart(2, "0");
      const formattedMin = minutes.toString().padStart(2, "0");

      times.push(`${formattedHour}:${formattedMin}`);

      minutes += 15;
      if (minutes === 60) {
        minutes = 0;
        hour++;
      }
    }

    return times;
  };

  const timeSlots = generateTimeSlots();

  return (
    <View>
      {/* Header Row */}
      <View>
        <View>
          <Text>Time</Text>
        </View>

        {staff.map((person, index) => (
          <View key={index}>
            <Text>{person}</Text>
          </View>
        ))}
      </View>

      {/* Time Rows */}
      {timeSlots.map((time, rowIndex) => (
        <View key={rowIndex}>
          <View>
            <Text>{time}</Text>
          </View>

          {staff.map((_, colIndex) => (
            <TouchableOpacity
              key={colIndex}
              onPress={() => alert(`Booked ${time}`)}
            >
              <Text></Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}
