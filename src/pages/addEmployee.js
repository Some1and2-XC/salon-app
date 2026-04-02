import React, { useState } from "react";
import { View, Text, TextInput, Button, Platform, Alert } from "react-native";
import { apiFetch } from "../utils";
import { sty } from "../styles";

// alert function, maybe should move to utils
function showAlert(title, message) {
    if (Platform.OS === "web") {
        window.alert(`${title}\n\n${message}`);
    } else {
        Alert.alert(title, message);
    }
}

export function AddEmployeeScreen() {
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        id: "",
    });

    function handleChange(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit() {
        console.log(form);
        if (!form.first_name || !form.last_name || !form.email || !form.id) {
            showAlert(
                "Missing fields",
                "First name, last name, id, and email are required.",
            );
            return;
        }
        try {
            const response = await apiFetch("/employees", {
                method: "POST",
                body: JSON.stringify(form),
            });
            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                const message =
                    errorBody?.message || `Server error: ${response.status}`;
                throw new Error(message);
            }
            showAlert(
                "Success",
                `${form.first_name} ${form.last_name} has been added.`,
            );
            setForm({
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                id: "",
            });
        } catch (err) {
            showAlert("Error", err.message || "Failed to add employee.");
        }
    }

    return (
        <View style={sty.container}>
            <Text>First name</Text>
            <TextInput
                value={form.first_name}
                onChangeText={(v) => handleChange("first_name", v)}
            />

            <Text>Last name</Text>
            <TextInput
                value={form.last_name}
                onChangeText={(v) => handleChange("last_name", v)}
            />

            <Text>Email</Text>
            <TextInput
                value={form.email}
                onChangeText={(v) => handleChange("email", v)}
                keyboardType="email-address"
            />

            <Text>Phone</Text>
            <TextInput
                value={form.phone}
                onChangeText={(v) => handleChange("phone", v)}
                keyboardType="phone-pad"
            />

            <Text>Employee ID</Text>
            <TextInput
                value={form.id}
                onChangeText={(v) => handleChange("id", v)}
            />

            <Button title={"Add Employee"} onPress={handleSubmit} />
        </View>
    );
}
