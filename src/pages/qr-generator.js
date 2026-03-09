import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Button } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export function QRScreen() {
    const [text, setText] = useState('');
    const [qrValue, setQrValue] = useState('');

    const generateQR = () => setQrValue(text);

    return (
    <View styles={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type something"
        value={text}
        onChangeText={setText}
      />
      <Button title="Generate QR" onPress={generateQR} />
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
    input: { 
        width: '100%',
        height: 50,
        borderWidth: 1, 
        borderColor: '#aaa', 
        padding: 10, 
        marginBottom: 20, 
        borderRadius: 5
    },
    qrContainer: {
        alignItems: 'center',    
        justifyContent: 'center',
        margin: 10
    }
});