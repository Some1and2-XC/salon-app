import { StyleSheet, Text, View } from 'react-native';

export function CheckinConfirmScreen({ route }) {

    const { phone } = route.params;

    return (
        <View>
            <Text>Check In Successful</Text>
            <Text>Phone: {phone}</Text>
        </View>
    );
}
