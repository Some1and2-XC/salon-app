import React, { useState, useEffect, useMemo } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    Platform,
    Alert,
    StyleSheet,
} from "react-native";
import { v7 as uuidv7 } from "uuid";

import { apiFetch, assertFetchSuccessful } from "../utils";
import { useTheme } from "../styles";
import { colorSchemeGreens } from "../colorScheme";
import { BackButton } from "../components/BackButton";
import { OptionModal } from "../components/OptionModal";

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

export function AddEmployeeScreen({ navigation }) {
    const commonUi = useTheme((state) => state.getCommonUi)();
    const colorScheme =
        useTheme((state) => state.getScheme)() ?? colorSchemeGreens;
    const styles = useMemo(() => makeStyles(colorScheme), [colorScheme]);

    const [form, setForm] = useState(emptyForm());
    const [mode, setMode] = useState("add");
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);

    useEffect(() => {
        apiFetch("/employees")
            .then((r) => r.json())
            .then((data) => {
                const list = Array.isArray(data) ? data : data.employees || [];
                setEmployees(list);
            })
            .catch(console.error);
    }, []);

    const employeeOptions = useMemo(() => {
        const rows = employees.map((employee) => ({
            label:
                employee.first_name && employee.last_name
                    ? `${employee.first_name} ${employee.last_name}`
                    : employee.first_name || `Employee ${employee.id}`,
            value: String(employee.id),
            subLabel: "Team member",
        }));
        return [{ label: "Select employee…", value: "", subLabel: "" }, ...rows];
    }, [employees]);

    const selectedEmployee = employees.find(
        (e) => String(e.id) === String(selectedEmployeeId)
    );

    const employeeFieldLabel = selectedEmployee
        ? selectedEmployee.first_name && selectedEmployee.last_name
            ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
            : selectedEmployee.first_name || `Employee ${selectedEmployee.id}`
        : "Select employee…";

    function handleChange(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleRemove() {
        if (!selectedEmployeeId) {
            showAlert("Error", "Please select an employee.");
            return;
        }

        apiFetch(`/employees/${selectedEmployeeId}`, { method: "DELETE" })
            .then(assertFetchSuccessful)
            .then(() => {
                setEmployees(
                    employees.filter((e) => String(e.id) !== String(selectedEmployeeId))
                );
                setSelectedEmployeeId("");
                showAlert("Success", "Removed employee successfully!");
            })
            .catch((err) =>
                showAlert("Error", err.message || "Failed to remove employee.")
            );
    }

    async function handleSubmit() {
        if (!form.first_name || !form.last_name || !form.email) {
            showAlert(
                "Missing fields",
                "First name, last name, and email are required."
            );
            return;
        }

        apiFetch("/employees", {
            method: "POST",
            body: JSON.stringify(form),
        })
            .then(assertFetchSuccessful)
            .then(() =>
                showAlert(
                    "Success",
                    `${form.first_name} ${form.last_name} has been added.`
                )
            )
            .then(() => setForm(emptyForm()))
            .catch((err) =>
                showAlert("Error", err.message || "Failed to add employee.")
            );
    }

    return (
        <ScrollView
            style={{ backgroundColor: colorScheme.pageBackground }}
            contentContainerStyle={[
                commonUi.screen.pageMargins,
                commonUi.screen.pageInnerGaps,
                { paddingBottom: 32 },
            ]}
            keyboardShouldPersistTaps="handled"
        >
            <BackButton navigation={navigation} />

            <View style={commonUi.card.accentCard}>
                <Text style={commonUi.card.kicker}>Team</Text>
                <Text style={commonUi.card.cardTitle}>Employees</Text>
                <Text style={commonUi.card.cardSubtitle}>
                    Add new staff or remove someone who no longer works at the salon.
                </Text>
            </View>

            <View style={styles.segmentRow}>
                <Pressable
                    style={({ pressed }) => [
                        styles.segmentBtn,
                        mode === "add" && styles.segmentBtnActive,
                        pressed && commonUi.card.pressed,
                    ]}
                    onPress={() => setMode("add")}
                >
                    <Text
                        style={[
                            styles.segmentLabel,
                            mode === "add" && styles.segmentLabelActive,
                        ]}
                    >
                        Add
                    </Text>
                </Pressable>
                <Pressable
                    style={({ pressed }) => [
                        styles.segmentBtn,
                        mode === "remove" && styles.segmentBtnActive,
                        pressed && commonUi.card.pressed,
                    ]}
                    onPress={() => setMode("remove")}
                >
                    <Text style={[styles.segmentLabel, mode === "remove" && styles.segmentLabelActive]}>
                        Remove
                    </Text>
                </Pressable>
            </View>

            {mode === "add" && (
                <View style={commonUi.card.pageCard}>
                    <View style={commonUi.auth.inputGroup}>
                        <Text style={commonUi.auth.inputLabel}>First name</Text>
                        <TextInput
                            value={form.first_name}
                            onChangeText={(v) => handleChange("first_name", v)}
                            placeholder="Jane"
                            placeholderTextColor={colorScheme.placeholder}
                            style={commonUi.auth.input}
                        />
                    </View>
                    <View style={commonUi.auth.inputGroup}>
                        <Text style={commonUi.auth.inputLabel}>Last name</Text>
                        <TextInput
                            value={form.last_name}
                            onChangeText={(v) => handleChange("last_name", v)}
                            placeholder="Doe"
                            placeholderTextColor={colorScheme.placeholder}
                            style={commonUi.auth.input}
                        />
                    </View>
                    <View style={commonUi.auth.inputGroup}>
                        <Text style={commonUi.auth.inputLabel}>Email</Text>
                        <TextInput
                            value={form.email}
                            onChangeText={(v) => handleChange("email", v)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="jane@salon.com"
                            placeholderTextColor={colorScheme.placeholder}
                            style={commonUi.auth.input}
                        />
                    </View>
                    <View style={commonUi.auth.inputGroup}>
                        <Text style={commonUi.auth.inputLabel}>Phone</Text>
                        <TextInput
                            value={form.phone}
                            onChangeText={(v) => handleChange("phone", v)}
                            keyboardType="phone-pad"
                            placeholder="Optional"
                            placeholderTextColor={colorScheme.placeholder}
                            style={commonUi.auth.input}
                        />
                    </View>

                    <Pressable
                        style={({ pressed }) => [
                            commonUi.auth.primaryButton,
                            pressed && commonUi.auth.cardPressed,
                        ]}
                        onPress={handleSubmit}
                    >
                        <Text style={commonUi.auth.primaryButtonText}>Add employee</Text>
                    </Pressable>
                </View>
            )}

            {mode === "remove" && (
                <View style={commonUi.card.pageCard}>
                    <Text style={commonUi.auth.inputLabel}>Employee</Text>
                    <Pressable
                        style={({ pressed }) => [
                            commonUi.form.selectButton,
                            pressed && commonUi.card.pressed,
                        ]}
                        onPress={() => setShowEmployeeModal(true)}
                    >
                        <Text
                            style={[
                                commonUi.form.selectValue,
                                !selectedEmployeeId && commonUi.form.selectValueMuted,
                            ]}
                        >
                            {employeeFieldLabel}
                        </Text>
                        <Text style={commonUi.form.selectChevron}>⌄</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.dangerBtn,
                            pressed && commonUi.card.pressed,
                        ]}
                        onPress={handleRemove}
                    >
                        <Text style={styles.dangerBtnText}>Remove employee</Text>
                    </Pressable>
                </View>
            )}

            <OptionModal
                visible={showEmployeeModal}
                title="Choose employee"
                options={employeeOptions}
                selectedValue={
                    selectedEmployeeId === ""
                        ? ""
                        : String(selectedEmployeeId)
                }
                onSelect={(v) => setSelectedEmployeeId(v)}
                onClose={() => setShowEmployeeModal(false)}
                emptyText="No employees found"
                styles={styles}
            />
        </ScrollView>
    );
}

function makeStyles(colorScheme) {
    return StyleSheet.create({
        segmentRow: {
            flexDirection: "row",
            backgroundColor: colorScheme.panelBackground,
            borderRadius: 999,
            padding: 4,
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
        },
        segmentBtn: {
            flex: 1,
            paddingVertical: 12,
            alignItems: "center",
            borderRadius: 999,
        },
        segmentBtnActive: {
            backgroundColor: colorScheme.whiteWarmCard,
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
        },
        segmentLabel: {
            fontSize: 14,
            fontWeight: "700",
            color: colorScheme.textMuted,
        },
        segmentLabelActive: {
            color: colorScheme.textDark,
        },
        dangerBtn: {
            backgroundColor: colorScheme.danger,
            borderRadius: 24,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 14,
        },
        dangerBtnText: {
            color: colorScheme.whiteWarm,
            fontSize: 15,
            fontWeight: "800",
        },
    });
}
