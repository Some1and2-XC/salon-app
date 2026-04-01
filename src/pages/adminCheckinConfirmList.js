import { View, Text } from 'react-native';

import { sty } from "../styles";

/**
 * Route for the admin checkin list.
 * This handles showing a list of checkin requests from the admin side.
 * This route should redirect to a specified check-in request.
 *
 */
export function AdminCheckinConfirmList() {
    return (
        <View style={sty.container}>
            <Text style={sty.h1}>Admin Checkin Confirm List</Text>
            <Text>This is a placeholder screen for showing a list of checkin requests an admin can see.</Text>
        </View>
    );
}
