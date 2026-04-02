import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Platform, Alert } from "react-native";
import { apiFetch } from "../utils";
import { sty } from "../styles";
import { v7 as uuidv7 } from "uuid";
import { Picker } from "@react-native-picker/picker";

function showAlert(title, message) {
    if (Platform.OS === "web") {
        window.alert(`${title}\n\n${message}`);
    } else {
        Alert.alert(title, message);
    }
}

const emptyForm = () => ({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    id: uuidv7(),
});

export function AddEmployeeScreen() {
    const [form, setForm] = useState(emptyForm());
    const [mode, setMode] = useState("add");
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

    useEffect(() => {
        apiFetch("/employees")
            .then((r) => r.json())
            .then((data) => {
                const list = Array.isArray(data) ? data : data.employees || [];
                setEmployees(list);
            })
            .catch(console.error);
    }, []);

    function handleChange(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleRemove() {
        if (!selectedEmployeeId) {
            showAlert("Error", "Please select an employee.");
            return;
        }
        try {
            const res = await apiFetch(`/employees/${selectedEmployeeId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error(`Failed: ${res.status}`);
            }

            showAlert("Success", "Employee removed.");
            setEmployees((prev) =>
                prev.filter((e) => String(e.id) !== selectedEmployeeId),
            );
            setSelectedEmployeeId("");
        } catch (err) {
            showAlert("Error", err.message || "Failed to remove employee.");
        }
    }

    async function handleSubmit() {
        if (!form.first_name || !form.last_name || !form.email) {
            showAlert(
                "Missing fields",
                "First name, last name, and email are required.",
            );
            return;
        }
        try {
            const res = await apiFetch("/employees", {
                method: "POST",
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => null);
                throw new Error(err?.message || `Server error: ${res.status}`);
            }

            showAlert(
                "Success",
                `${form.first_name} ${form.last_name} has been added.`,
            );
            setForm(emptyForm());
        } catch (err) {
            showAlert("Error", err.message || "Failed to add employee.");
        }
    }

    return (
        <View style={sty.container}>
            <View style={{ flexDirection: "row", marginBottom: 20 }}>
                <Button title="Add" onPress={() => setMode("add")} />
                <Button title="Remove" onPress={() => setMode("remove")} />
            </View>

            {mode === "add" && (
                <>
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

                    <Button title="Add Employee" onPress={handleSubmit} />
                </>
            )}

            {mode === "remove" && (
                <>
                    <Picker
                        selectedValue={selectedEmployeeId}
                        onValueChange={(v) => setSelectedEmployeeId(v)}
                    >
                        <Picker.Item label="Select employee..." value="" />
                        {employees.map((emp) => (
                            <Picker.Item
                                key={emp.id}
                                label={`${emp.first_name} ${emp.last_name}`}
                                value={String(emp.id)}
                            />
                        ))}
                    </Picker>

                    <Button title="Remove Employee" onPress={handleRemove} />
                </>
            )}
        </View>
    );
}
