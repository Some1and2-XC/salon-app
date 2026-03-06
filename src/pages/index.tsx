import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';

import { sty } from "../styles";

import {
    NAV_EXAMPLE_HOME,
    NAV_BOOKING,
    NAV_CHECKIN,
    NAV_CHECKINCONFIRM,
    NAV_HOME,
    NAV_LOGIN,
    NAV_SIGNUP,
} from "../consts";

export function ExampleHome({ navigation }: any ): React.JSX.Element {

   const ENDPOINTS: string[] = [
      // NAV_EXAMPLE_HOME,
      NAV_BOOKING,
      NAV_CHECKIN,
      NAV_CHECKINCONFIRM,
      NAV_HOME,
      NAV_LOGIN,
      NAV_SIGNUP,
   ];

   return (
       <View style={ sty.container }>
           <Text style={ sty.h1 }>Home Page!</Text>
           <Text>This is an example home page made so that other pages can be built with this as a reference!</Text>

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
