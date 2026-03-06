import { StyleSheet, Text, View } from 'react-native';

import {sty} from "../styles";

export function CheckinConfirmScreen({ route }) {

    const { phone } = route.params ? route.params : { "phone": "+0123456789" };

    return (
        <View style={ sty.container }>
            <Text>Check In Successful</Text>
            <Text>Phone: {phone}</Text>
        </View>
    );
}
