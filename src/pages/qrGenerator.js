import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { sty } from "../styles";

export function QRScreen({route}) {

    const qrValue = JSON.stringify(route.params.data);

    // TODO remove this log call (or console.trace or something...).
    console.log(qrValue);

    return (
        <View styles={sty.container}>
            <Text>Checkin Confirmed! Use this to checkin for your appointment!</Text>
            {qrValue !== '' && (
                <View style={sty.containerCentered}>
                    <QRCode value={qrValue} size={250} />
                </View>
            )}
        </View>
    );
}
