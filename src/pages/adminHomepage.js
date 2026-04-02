import React, { useEffect, useState } from "react"; 
import { Text, View, Button} from "react-native"; 
import { sty } from "../styles"; 
import {
    NAV_CHECKIN_CONFIRM_ADMIN, 
    NAV_CHECKIN_CONFIRM_ADMIN_LIST, 
    NAV_APP_TYPES, 
    NAV_BARCODE_SCANNER,
    NAV_ADD_EMPLOYEE
} from "../consts"; 

export function AdminHomepageScreen({ navigation }) { 

    const ENDPOINTS = [
    NAV_CHECKIN_CONFIRM_ADMIN, 
    NAV_CHECKIN_CONFIRM_ADMIN_LIST, 
    NAV_APP_TYPES, 
    NAV_BARCODE_SCANNER,
    NAV_ADD_EMPLOYEE
    ]; return ( 

        <View style={ sty.container }> 
            <Text style={ sty.h1 }>Admin Home Page!</Text> 

            {ENDPOINTS.map((v) => (<> 
                <Button 
                    key={v} 
                    title={v} 
                    onPress={() => navigation.navigate(v)}
                /> 
            </>))} 
        </View> 
    ); 
}