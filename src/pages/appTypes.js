import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Platform,
    StatusBar,
} from "react-native";

import { useTheme } from "../styles";
import { apiFetch, showAppToast } from "../utils";
import { colorSchemeDefault, MAP_COLOR_SCHEME } from "../colorScheme";
import { TOAST_TYPE_ERROR } from "../consts";
import { BackButton } from "../components/BackButton";
import { OptionModal } from "../components/OptionModal";

export function AdminAppointmentTypesScreen({ navigation }) {

    const commonUi = useTheme((state) => state.getCommonUi)();
    const scheme = useTheme((state) => state.scheme);
    const colorScheme = MAP_COLOR_SCHEME[scheme] ?? colorSchemeDefault;
    const styles = useMemo(() => makeStyles(colorScheme), [colorScheme]);

    const [tasks, setTasks] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [time, setTime] = useState("");

    const taskCategories = [
        { id: 0, name: "Manicure" },
        { id: 1, name: "Pedicure" },
        { id: 2, name: "Extension" },
        { id: 3, name: "Kids" },
        { id: 4, name: "Add-On Service" },
        { id: 5, name: "Special Package" },
    ];

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        apiFetch("/tasks")
            .then((res) => res.json())
            .then((json) => setTasks(json))
            .catch(console.error);
    };

    const categoryOptions = taskCategories.map((cat) => ({
        label: cat.name,
        value: cat.id.toString(),
        subLabel: "Service category",
    }));

    const selectedCategoryName =
        taskCategories.find((cat) => cat.id.toString() === category)?.name ||
        "Select Category";

    const canSave = useMemo(() => {
        const hasName = name.trim().length > 0;
        const hasCategory = category !== "";
        const priceValue = Number(price);
        const timeValue = Number(time);

        return (
            hasName &&
            hasCategory &&
            Number.isFinite(priceValue) &&
            priceValue > 0 &&
            Number.isFinite(timeValue) &&
            timeValue > 0
        );
    }, [name, price, category, time]);

    const openCreateModal = () => {
        setEditingTask(null);
        setName("");
        setPrice("");
        setCategory("");
        setTime("");
        setModalVisible(true);
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setName(task.name);
        setPrice((task.price_cad_cent / 100).toFixed(2));
        setCategory(task.task_category_id.toString());
        setTime((task.time_for_booking / 60).toString());
        setModalVisible(true);
    };

    const saveTask = async () => {
        const payload = {
            name: name.trim(),
            price_cad_cent: Math.round(Number(price) * 100),
            task_category_id: Number(category),
            time_for_booking: Math.round(Number(time) * 60),
        };

        if (editingTask) {
            apiFetch(`/tasks/${editingTask.id}`, { method: "PATCH", body: JSON.stringify(payload), })
                .catch(console.error)
                ;
        } else {
            apiFetch("/tasks", { method: "POST", body: JSON.stringify(payload), })
                .catch(console.error)
                ;
        }

        setModalVisible(false);
        await fetchTasks();
    };

    const confirmDeleteTask = (task) => {
        setTaskToDelete(task);
        setDeleteModalVisible(true);
    };

    const deleteTask = async () => {
        if (!taskToDelete) return;

        apiFetch(`/tasks/${taskToDelete.id}`, { method: "DELETE" })
            .catch((err) => showAppToast(TOAST_TYPE_ERROR, "Server Error", err))
            ;

        setDeleteModalVisible(false);
        setTaskToDelete(null);
        await fetchTasks();
    };

    const renderTaskCard = ({ item }) => {
        const categoryName =
            taskCategories.find((cat) => cat.id === item.task_category_id)?.name ||
            "Unknown";

        return (
            <View style={styles.taskCard}>
                <View style={styles.taskCardTop}>
                    <View>
                        <Text style={styles.taskName}>{item.name}</Text>
                        <View style={styles.categoryChip}>
                            <Text style={styles.categoryChipText}>{categoryName}</Text>
                        </View>
                    </View>
                    <View style={commonUi.hero.metaChip}>
                        <Text style={commonUi.hero.metaChipText}>
                            ${(item.price_cad_cent / 100).toFixed(2)}
                        </Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Duration</Text>
                    <Text style={styles.detailValue}>
                        {Math.round(item.time_for_booking / 60)} minutes
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Created</Text>
                    <Text style={styles.detailValue}>
                        {new Date(Number(item.date_created)).toLocaleString()}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Updated</Text>
                    <Text style={styles.detailValue}>
                        {new Date(Number(item.last_modified)).toLocaleString()}
                    </Text>
                </View>

                <View style={styles.cardActionRow}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.secondaryButton,
                            styles.actionButton,
                            pressed && commonUi.auth.cardPressed,
                        ]}
                        onPress={() => openEditModal(item)}
                    >
                        <Text style={styles.secondaryButtonText}>Edit</Text>
                    </Pressable>
                    <Pressable
                        style={({ pressed }) => [
                            styles.dangerButton, styles.actionButton,
                            pressed && commonUi.card.cardPressed,
                        ]}
                        onPress={() => confirmDeleteTask(item)}
                    >
                        <Text style={styles.dangerButtonText}>Delete</Text>
                    </Pressable>
                </View>
            </View>
        );
    };

    return (
        <ScrollView
            style={commonUi.screen.pageMargins}
            contentContainerStyle={commonUi.screen.pageInnerGaps}
        >
            <BackButton navigation={navigation} />

            <View style={commonUi.hero.heroCard}>
                <View style={commonUi.hero.blobOne} />
                <View style={commonUi.hero.blobTwo} />

                <View style={commonUi.hero.heroTopRow}>
                    <Text style={commonUi.hero.kicker}>Admin Dashboard</Text>
                </View>

                <View style={commonUi.hero.heroTextBlock}>
                    <Text style={commonUi.hero.heroTitle}>Appointment Types</Text>
                    <Text style={commonUi.hero.heroText}>
                        Create, update, and organize salon services.
                    </Text>
                </View>

                <View style={commonUi.hero.metaRow}>
                    <View style={commonUi.hero.metaChip}>
                        <Text style={commonUi.hero.metaChipText}>
                            {tasks.length} Service{tasks.length === 1 ? "" : "s"} Provided
                        </Text>
                    </View>
                </View>

                <Pressable
                    style={({ pressed }) => [
                        commonUi.auth.primaryButton,
                        commonUi.auth.heroButton,
                        pressed && commonUi.auth.cardPressed,
                    ]}
                    onPress={openCreateModal}
                >
                    <Text style={commonUi.auth.primaryButtonText}>Add New Service</Text>
                </Pressable>
            </View>

            <Text style={styles.sectionTitle}>All Services</Text>

            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={renderTaskCard}
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <Text style={styles.emptyTitle}>No appointment types yet</Text>
                        <Text style={styles.emptyText}>
                            Start by adding your first service so staff can manage bookings
                            more easily.
                        </Text>
                        <Pressable
                            style={({ pressed }) => [
                                commonUi.auth.primaryButton,
                                commonUi.auth.emptyButton,
                                pressed && commonUi.card.cardPressed,
                            ]}
                            onPress={openCreateModal}
                        >
                            <Text style={commonUi.auth.primaryButtonText}>Create First Service</Text>
                        </Pressable>
                    </View>
                }
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.formModalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={commonUi.auth.formTitle}>
                            {editingTask ? "Edit Appointment Type" : "Create Appointment Type"}
                        </Text>
                        <Text style={commonUi.auth.formDescription}>
                            Enter the service name, category, duration, and price.
                        </Text>

                        <ScrollView>
                            <View style={commonUi.auth.inputGroup}>
                                <Text style={commonUi.auth.inputLabel}>Service Name</Text>
                                <TextInput
                                    placeholder="e.g. Acrylic Refill"
                                    placeholderTextColor={colorScheme.placeholder}
                                    value={name}
                                    onChangeText={setName}
                                    style={commonUi.auth.input}
                                />
                            </View>

                            <View style={styles.rowInputs}>
                                <View style={commonUi.auth.inputGroup}>
                                    <Text style={commonUi.auth.inputLabel}>Price (CAD)</Text>
                                    <TextInput
                                        placeholder="e.g. 45"
                                        placeholderTextColor={colorScheme.placeholder}
                                        value={price}
                                        onChangeText={setPrice}
                                        keyboardType="numeric"
                                        style={commonUi.auth.input}
                                    />
                                </View>

                                <View style={commonUi.auth.inputGroup}>
                                    <Text style={commonUi.auth.inputLabel}>Duration (Minutes)</Text>
                                    <TextInput
                                        placeholder="e.g. 60"
                                        placeholderTextColor={colorScheme.placeholder}
                                        value={time}
                                        onChangeText={setTime}
                                        keyboardType="numeric"
                                        style={commonUi.auth.input}
                                    />
                                </View>
                            </View>

                            <View style={commonUi.auth.inputGroup}>
                                <Text style={commonUi.auth.inputLabel}>Category</Text>
                                <Pressable
                                    style={({ pressed }) => [
                                        commonUi.form.selectButton,
                                        pressed && commonUi.auth.cardPressed,
                                    ]}
                                    onPress={() => setShowCategoryModal(true)}
                                >
                                    <Text
                                        style={[
                                            commonUi.form.selectValue,
                                            category === "" && commonUi.form.selectValueMuted,
                                        ]}
                                    >
                                        {selectedCategoryName}
                                    </Text>
                                    <Text style={commonUi.form.selectChevron}>⌄</Text>
                                </Pressable>
                            </View>
                        </ScrollView>

                        <View style={styles.modalActionRow}>
                            <Pressable
                                style={({ pressed }) => [
                                    commonUi.auth.primaryButton,
                                    !canSave && styles.primaryButtonDisabled,
                                    pressed && commonUi.auth.cardPressed,
                                ]}
                                disabled={!canSave}
                                onPress={saveTask}
                            >
                                <Text style={commonUi.auth.primaryButtonText}>
                                    {editingTask ? "Save Changes" : "Create Service"}
                                </Text>
                            </Pressable>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.secondaryButton,
                                    pressed && commonUi.auth.cardPressed,
                                ]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.secondaryButtonText}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={deleteModalVisible} animationType="fade" transparent>
                <View style={styles.formModalBackdrop}>
                    <View style={[ styles.modalCard, {maxWidth: 420} ]}>
                        <Text style={styles.confirmTitle}>Delete Appointment Type?</Text>
                        <Text style={styles.confirmText}>
                            Are you sure you want to delete{" "}
                            {taskToDelete ? `"${taskToDelete.name}"` : "this service"}?
                            This action cannot be undone.
                        </Text>

                        <View style={styles.modalActionRow}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.dangerButton,
                                    pressed && commonUi.auth.cardPressed,
                                ]}
                                onPress={deleteTask}
                            >
                                <Text style={styles.dangerButtonText}>Yes, Delete</Text>
                            </Pressable>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.secondaryButton,
                                    pressed && commonUi.auth.cardPressed,
                                ]}
                                onPress={() => setDeleteModalVisible(false)}
                            >
                                <Text style={styles.secondaryButtonText}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <OptionModal
                visible={showCategoryModal}
                title="Choose a Category"
                options={categoryOptions}
                selectedValue={category}
                onSelect={setCategory}
                onClose={() => setShowCategoryModal(false)}
                emptyText="No categories available"
            />
        </ScrollView>
    );
}

function makeStyles(colorScheme) {
    return StyleSheet.create({
        sectionTitle: {
            fontSize: 22,
            fontWeight: "800",
            color: colorScheme.textDark,
            marginBottom: 10,
            marginTop: 2,
        },
        taskCard: {
            backgroundColor: colorScheme.whiteWarmCard,
            borderRadius: 24,
            padding: 16,
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
            marginBottom: 12,
        },
        taskCardTop: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 10,
            marginBottom: 12,
        },
        taskName: {
            fontSize: 18,
            fontWeight: "800",
            color: colorScheme.textDark,
            marginBottom: 8,
        },
        categoryChip: {
            alignSelf: "flex-start",
            backgroundColor: colorScheme.panelBackgroundAlt,
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderWidth: 1,
            borderColor: colorScheme.categoryBorder,
        },
        categoryChipText: {
            color: colorScheme.chipTextDark,
            fontSize: 12.5,
            fontWeight: "700",
        },
        detailRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            paddingVertical: 6,
            borderBottomWidth: 1,
            borderBottomColor: colorScheme.dividerLight,
        },
        detailLabel: {
            fontSize: 13,
            fontWeight: "700",
            color: colorScheme.textLabel,
            flex: 0.8,
        },
        detailValue: {
            fontSize: 13,
            color: colorScheme.textSubtle,
            flex: 1.4,
            textAlign: "right",
        },
        cardActionRow: {
            flexDirection: "row",
            gap: 10,
            marginTop: 16,
        },
        actionButton: {
            flex: 1,
        },
        emptyWrap: {
            backgroundColor: colorScheme.whiteWarmCard,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
            padding: 22,
            alignItems: "center",
        },
        emptyTitle: {
            fontSize: 18,
            fontWeight: "800",
            color: colorScheme.textDark,
            marginBottom: 6,
            textAlign: "center",
        },
        emptyText: {
            fontSize: 13.5,
            color: colorScheme.textMuted,
            textAlign: "center",
            lineHeight: 20,
            marginBottom: 14,
        },
        formModalBackdrop: {
            flex: 1,
            backgroundColor: colorScheme.overlayDarkStrong,
            justifyContent: "center",
            paddingHorizontal: 14,
        },
        modalCard: {
            backgroundColor: colorScheme.whiteWarmCard,
            borderRadius: 26,
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
            maxHeight: "88%",
            padding: 18,
            alignSelf: "center",
            width: "100%",
        },
        confirmTitle: {
            fontSize: 20,
            fontWeight: "800",
            color: colorScheme.textDark,
            marginBottom: 8,
        },
        confirmText: {
            fontSize: 14,
            color: colorScheme.textSubtle,
            lineHeight: 21,
            marginBottom: 14,
        },
        rowInputs: {
            overflow: "visible",
            flexDirection: "row",
            gap: 10,
        },
        modalActionRow: {
            gap: 10,
            marginTop: 10,
        },
        primaryButtonDisabled: {
            opacity: 0.55,
        },
        secondaryButton: {
            backgroundColor: colorScheme.panelBackgroundAlt,
            borderRadius: 24,
            paddingVertical: 15,
            alignItems: "center",
        },
        secondaryButtonText: {
            color: colorScheme.textDefault,
            fontSize: 14,
            fontWeight: "700",
        },
        dangerButton: {
            backgroundColor: colorScheme.danger,
            borderRadius: 24,
            paddingVertical: 15,
            alignItems: "center",
        },
        dangerButtonText: {
            color: colorScheme.whiteWarm,
            fontSize: 14,
            fontWeight: "800",
        },
    });
}
