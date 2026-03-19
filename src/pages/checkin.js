import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import {
    NAV_QR,
} from "../consts";

export function CheckinScreen({ navigation }) {

    const [phone, setPhone] = useState('');

    const handleNumberPress = (num) => {
        if (phone.length < 9) {
            setPhone(phone + num);
        }
    };

    const handleDelete = () => {
        setPhone(phone.slice(0, -1));
    };

    const handleClear = () => {
        setPhone('');
    };

    const handleDone = () => {
        if (phone.length === 9) {
            navigation.navigate(NAV_QR, { phone });
        }
    };

    return (
        <View>

            <Text>Enter Phone Number</Text>

            <Text>{phone}</Text>

            <View>
                {[1,2,3,4,5,6,7,8,9].map((num) => (
                    <TouchableOpacity
                        key={num}
                        onPress={() => handleNumberPress(num.toString())}
                    >
                        <Text>{num}</Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity onPress={handleClear}>
                    <Text>Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleNumberPress("0")}
                >
                    <Text>0</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleDelete}>
                    <Text>⌫</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={handleDone}
                disabled={phone.length !== 9}
            >
                <Text >Done</Text>
            </TouchableOpacity>

        </View>
    );
}
