import { useState, useEffect } from 'react';
import { Button, Text, View } from 'react-native';

import { NAV_CHECKIN_CONFIRM_ADMIN_LIST, APPOINTMENT_STATE_ACCEPTED, APPOINTMENT_STATE_CANCELLED } from "../consts";
import { sty } from "../styles";
import { apiFetch } from "../utils";

/**
 * Route for the admin checkin.
 * This handles the confirm/deny screen for admins confirming appointments.
 * This route expects an appointment object to be passed through the route parameters.
 */
export function AdminCheckinConfirm({ navigation, route }) {

    const [params, setParams] = useState(route.params);
    const [user, setUser] = useState(null);

    useEffect(() => {

        // Sets default parameters if none were passed
        if (!params) {
            // Just gets the first one.
            // This should be removed for non-debug purposes
            apiFetch("/appointments", { method: "GET" })
                .then((res) => res.json())
                .then((res) => setParams(res[0]))
                .catch(console.error)
                ;
        }

        console.log(params);

        // If params still aren't set.
        if (!params) {
            console.error("Failed to get parameters (params set to null after request)!");
            return;
        }

        // Assumes params is set here.
        // Gets associated user
        apiFetch(`/users/${params.uuid}`, { method: "GET" })
            .then((res) => res.json())
            .then(setUser)
            .catch(console.error)
            .await
            ;

        console.log(user);
        if (!user) {
            console.error("Failed to get user (user set to null after request)!");
            return;
        }

    }, []);

    console.log(params);

    const handleResponse = async (confirmed) => {

        // Sets up patch parameters depending on response.
        const fetch_body = {
            method: "PATCH",
            body: JSON.stringify({
                appointment_state_id: confirmed ? APPOINTMENT_STATE_ACCEPTED : APPOINTMENT_STATE_CANCELLED
            })
        };

        if (params.uuid) {
            // Makes fetch request
            apiFetch(`/appointments/${params.uuid}`, fetch_body)
                .then((res) => res.json())
                .catch(console.error)
                ;
        }
        else {
            console.error("Attempted to update appointment state but params.uuid is not set!");
        }

        // Navigates to other route
        console.log("Redirecting to admin list...");
        console.log("This may or may not be implemented yet. If this causes an error, that is okay!");

        navigation.navigate(NAV_CHECKIN_CONFIRM_ADMIN_LIST);

    }

    const user_name = user ? `{user.first_name user.last_name} ({user.email})` : "NOT_FOUND";

    const last_modified_seconds = params ? params.last_modified : 0;
    const last_modified_date = Date(last_modified_seconds);

    return (
        <View style={sty.container}>
            <Text style={sty.h1}>Confirm Booking?</Text>
            <View>
                <Text>Customer: {user_name}</Text>
                <Text>Date Created: {last_modified_date.toLocaleString()}</Text>
                <Text>{"\n"}</Text>
                <Button color="rgb(44, 193, 86)" onPress={() => handleResponse(true) } title="Confirm" />
                <Button color="red"              onPress={() => handleResponse(false)} title="Deny"    />
            </View>
        </View>
    );

}
