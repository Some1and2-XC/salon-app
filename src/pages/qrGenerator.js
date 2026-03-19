import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export function QRScreen({route}) {
    const { uid } = route.params;
    const [qrValue, setQrValue] = useState('');

    useEffect(() => {
      setQrValue(uid);
    }, [uid]);

    return (
    <View styles={styles.container}>
      <Text>Checkin Confirmed! Use this to checkin for your appointment!</Text>
      {qrValue !== '' && (
        <View style={styles.qrContainer}>
          <QRCode value={qrValue} size={250} />
        </View>
      )}
    </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    text: { 
      fontSize: 18,
      marginBottom: 20
    },
    qrContainer: {
        alignItems: 'center',    
        justifyContent: 'center',
        margin: 10
    }
});