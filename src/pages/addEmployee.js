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
import { AdminBackBar } from "../components/AdminBackBar";
import { OptionModal } from "./booking";

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
                { paddingBottom: 32 },
            ]}
            keyboardShouldPersistTaps="handled"
        >
            <AdminBackBar navigation={navigation} />

            <View style={styles.heroCard}>
                <Text style={styles.kicker}>Team</Text>
                <Text style={styles.title}>Employees</Text>
                <Text style={styles.subtitle}>
                    Add new staff or remove someone who no longer works at the salon.
                </Text>
            </View>

            <View style={styles.segmentRow}>
                <Pressable
                    style={({ pressed }) => [
                        styles.segmentBtn,
                        mode === "add" && styles.segmentBtnActive,
                        pressed && styles.pressed,
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
                        pressed && styles.pressed,
                    ]}
                    onPress={() => setMode("remove")}
                >
                    <Text
                        style={[
                            styles.segmentLabel,
                            mode === "remove" && styles.segmentLabelActive,
                        ]}
                    >
                        Remove
                    </Text>
                </Pressable>
            </View>

            {mode === "add" && (
                <View style={styles.card}>
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
                        <Text style={commonUi.auth.primaryButtonText}>
                            Add employee
                        </Text>
                    </Pressable>
                </View>
            )}

            {mode === "remove" && (
                <View style={styles.card}>
                    <Text style={commonUi.auth.inputLabel}>Employee</Text>
                    <Pressable
                        style={({ pressed }) => [
                            styles.selectButton,
                            pressed && styles.pressed,
                        ]}
                        onPress={() => setShowEmployeeModal(true)}
                    >
                        <Text
                            style={[
                                styles.selectValue,
                                !selectedEmployeeId && styles.selectValueMuted,
                            ]}
                        >
                            {employeeFieldLabel}
                        </Text>
                        <Text style={styles.selectChevron}>⌄</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.dangerBtn,
                            pressed && styles.pressed,
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
        heroCard: {
            borderRadius: 28,
            paddingHorizontal: 20,
            paddingVertical: 20,
            backgroundColor: colorScheme.accentTint,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colorScheme.borderAccentSoft,
        },
        kicker: {
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: colorScheme.textAccentSoft,
            marginBottom: 8,
        },
        title: {
            fontSize: 26,
            fontWeight: "800",
            color: colorScheme.textDarkest,
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 14,
            lineHeight: 21,
            color: colorScheme.textSubtle,
            maxWidth: "96%",
        },
        segmentRow: {
            flexDirection: "row",
            backgroundColor: colorScheme.panelBackground,
            borderRadius: 999,
            padding: 4,
            marginBottom: 16,
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
        card: {
            backgroundColor: colorScheme.whiteWarmCard,
            borderRadius: 26,
            padding: 20,
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
        },
        selectButton: {
            backgroundColor: colorScheme.panelBackground,
            borderRadius: 18,
            paddingHorizontal: 16,
            paddingVertical: 15,
            borderWidth: 1,
            borderColor: colorScheme.borderLightAlt,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
        },
        selectValue: {
            flex: 1,
            fontSize: 15,
            fontWeight: "700",
            color: colorScheme.textDefault,
            paddingRight: 10,
        },
        selectValueMuted: {
            color: colorScheme.textLabel,
        },
        selectChevron: {
            fontSize: 24,
            color: colorScheme.textAccentSoft,
            marginTop: -2,
        },
        modalOverlay: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 18,
            backgroundColor: colorScheme.overlayDarkSoft,
        },
        modalBackdrop: {
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        },
        optionModalCard: {
            width: "100%",
            maxWidth: 430,
            maxHeight: "70%",
            backgroundColor: colorScheme.whiteWarmCard,
            borderRadius: 28,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 14,
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
        },
        optionModalHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
        },
        optionModalTitle: {
            fontSize: 18,
            fontWeight: "800",
            color: colorScheme.textDarkest,
        },
        closeButton: {
            paddingHorizontal: 6,
            paddingVertical: 2,
        },
        optionModalClose: {
            fontSize: 18,
            fontWeight: "800",
            color: colorScheme.textAccentSoft,
        },
        optionModalList: {
            maxHeight: 420,
        },
        optionModalListContent: {
            paddingBottom: 8,
        },
        optionRow: {
            backgroundColor: colorScheme.panelBackground,
            borderRadius: 18,
            paddingHorizontal: 14,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: colorScheme.borderLightAlt,
            marginTop: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        optionRowSelected: {
            backgroundColor: colorScheme.accentTint,
            borderColor: colorScheme.textAccent,
        },
        optionRowPressed: {
            opacity: 0.92,
            transform: [{ scale: 0.99 }],
        },
        optionTextWrap: {
            flex: 1,
            paddingRight: 12,
        },
        optionLabel: {
            fontSize: 15,
            fontWeight: "700",
            color: colorScheme.textDefault,
        },
        optionLabelSelected: {
            color: colorScheme.textDarkest,
        },
        optionSubLabel: {
            marginTop: 4,
            fontSize: 12,
            color: colorScheme.textAccentSoft,
            fontWeight: "600",
        },
        optionSubLabelSelected: {
            color: colorScheme.textAccent,
        },
        optionCheck: {
            fontSize: 18,
            fontWeight: "800",
            color: colorScheme.textAccent,
        },
        emptyOptionText: {
            fontSize: 14,
            color: colorScheme.textMuted,
            textAlign: "center",
            paddingVertical: 22,
        },
        dangerBtn: {
            backgroundColor: colorScheme.danger,
            borderRadius: 24,
            paddingVertical: 16,
            alignItems: "center",
        },
        dangerBtnText: {
            color: colorScheme.whiteWarm,
            fontSize: 15,
            fontWeight: "800",
        },
        pressed: {
            opacity: 0.92,
            transform: [{ scale: 0.99 }],
        },
    });
}
