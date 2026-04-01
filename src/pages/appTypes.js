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

import { commonUi } from "../styles";
import { apiFetch } from "../utils";

function OptionModal({
    visible,
    title,
    options,
    selectedValue,
    onSelect,
    onClose,
    emptyText = "No options available",
}) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <Pressable style={styles.modalBackdrop} onPress={onClose} />

                <View style={styles.optionModalCard}>
                    <View style={styles.optionModalHeader}>
                        <Text style={styles.optionModalTitle}>{title}</Text>

                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.optionModalClose}>✕</Text>
                        </Pressable>
                    </View>

                    <ScrollView
                        style={styles.optionModalList}
                        contentContainerStyle={styles.optionModalListContent}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                    >
                        {options.length === 0 ? (
                            <Text style={styles.emptyOptionText}>{emptyText}</Text>
                        ) : (
                            options.map((option) => {
                                const isSelected = option.value === selectedValue;

                                return (
                                    <Pressable
                                        key={String(option.value)}
                                        style={({ pressed }) => [
                                            styles.optionRow,
                                            isSelected && styles.optionRowSelected,
                                            pressed && styles.optionRowPressed,
                                        ]}
                                        onPress={() => {
                                            onSelect(option.value);
                                            onClose();
                                        }}
                                    >
                                        <View style={styles.optionTextWrap}>
                                            <Text
                                                style={[
                                                    styles.optionLabel,
                                                    isSelected && styles.optionLabelSelected,
                                                ]}
                                            >
                                                {option.label}
                                            </Text>

                                            {!!option.subLabel && (
                                                <Text
                                                    style={[
                                                        styles.optionSubLabel,
                                                        isSelected &&
                                                            styles.optionSubLabelSelected,
                                                    ]}
                                                >
                                                    {option.subLabel}
                                                </Text>
                                            )}
                                        </View>

                                        {isSelected && (
                                            <Text style={styles.optionCheck}>✓</Text>
                                        )}
                                    </Pressable>
                                );
                            })
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

export function AdminAppointmentTypesScreen() {
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
        await apiFetch("/tasks")
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
            await apiFetch(`/tasks/${editingTask.id}`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            }).catch(console.error);
        } else {
            await apiFetch("/tasks", {
                method: "POST",
                body: JSON.stringify(payload),
            }).catch(console.error);
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

        await apiFetch(`/tasks/${taskToDelete.id}`, {
            method: "DELETE",
        }).catch(console.error);

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
                    <View style={styles.taskHeaderLeft}>
                        <Text style={styles.taskName}>{item.name}</Text>
                        <View style={styles.categoryChip}>
                            <Text style={styles.categoryChipText}>{categoryName}</Text>
                        </View>
                    </View>

                    <View style={styles.metaChip}>
                        <Text style={styles.metaChipText}>
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
                            pressed && styles.cardPressed,
                        ]}
                        onPress={() => openEditModal(item)}
                    >
                        <Text style={styles.secondaryButtonText}>Edit</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.dangerButton,
                            styles.actionButton,
                            pressed && styles.cardPressed,
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
        <SafeAreaView style={[styles.safeArea, Platform.OS === "web" && styles.safeAreaWeb]}>
            <StatusBar barStyle="dark-content" backgroundColor="#f5efe9" />

            <FlatList
                style={[styles.scrollView, Platform.OS === "web" && styles.scrollViewWeb]}
                contentContainerStyle={styles.scrollContent}
                data={tasks}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.pageWrap}>
                        <View style={styles.heroCard}>
                            <View style={styles.blobOne} />
                            <View style={styles.blobTwo} />

                            <Text style={styles.kicker}>Admin Dashboard</Text>
                            <Text style={styles.heroTitle}>Appointment Types</Text>
                            <Text style={styles.heroText}>
                                Create, update, and organize salon services.
                            </Text>

                            <View style={styles.heroMetaRow}>
                                <View style={styles.metaChip}>
                                    <Text style={styles.metaChipText}>
                                        {tasks.length} Service{tasks.length === 1 ? "" : "s"} Provided
                                    </Text>
                                </View>
                            </View>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.primaryButton,
                                    styles.heroButton,
                                    pressed && styles.cardPressed,
                                ]}
                                onPress={openCreateModal}
                            >
                                <Text style={styles.primaryButtonText}>Add New Service</Text>
                            </Pressable>
                        </View>

                        <Text style={styles.sectionTitle}>All Services</Text>
                    </View>
                }
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
                                styles.primaryButton,
                                styles.emptyButton,
                                pressed && styles.cardPressed,
                            ]}
                            onPress={openCreateModal}
                        >
                            <Text style={styles.primaryButtonText}>Create First Service</Text>
                        </Pressable>
                    </View>
                }
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.formModalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.formTitle}>
                            {editingTask ? "Edit Appointment Type" : "Create Appointment Type"}
                        </Text>
                        <Text style={styles.formDescription}>
                            Enter the service name, category, duration, and price.
                        </Text>

                        <ScrollView
                            contentContainerStyle={styles.modalFormWrap}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Service Name</Text>
                                <TextInput
                                    placeholder="e.g. Acrylic Refill"
                                    placeholderTextColor="#9a7e70"
                                    value={name}
                                    onChangeText={setName}
                                    style={styles.input}
                                />
                            </View>

                            <View style={styles.rowInputs}>
                                <View style={[styles.inputGroup, styles.halfInput]}>
                                    <Text style={styles.inputLabel}>Price (CAD)</Text>
                                    <TextInput
                                        placeholder="e.g. 45"
                                        placeholderTextColor="#9a7e70"
                                        value={price}
                                        onChangeText={setPrice}
                                        keyboardType="numeric"
                                        style={styles.input}
                                    />
                                </View>

                                <View style={[styles.inputGroup, styles.halfInput]}>
                                    <Text style={styles.inputLabel}>Duration (Minutes)</Text>
                                    <TextInput
                                        placeholder="e.g. 60"
                                        placeholderTextColor="#9a7e70"
                                        value={time}
                                        onChangeText={setTime}
                                        keyboardType="numeric"
                                        style={styles.input}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Category</Text>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.selectButton,
                                        pressed && styles.cardPressed,
                                    ]}
                                    onPress={() => setShowCategoryModal(true)}
                                >
                                    <Text
                                        style={[
                                            styles.selectValue,
                                            category === "" && styles.selectValueMuted,
                                        ]}
                                    >
                                        {selectedCategoryName}
                                    </Text>
                                    <Text style={styles.selectChevron}>⌄</Text>
                                </Pressable>
                            </View>
                        </ScrollView>

                        <View style={styles.modalActionRow}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.primaryButton,
                                    !canSave && styles.primaryButtonDisabled,
                                    pressed && styles.cardPressed,
                                ]}
                                disabled={!canSave}
                                onPress={saveTask}
                            >
                                <Text style={styles.primaryButtonText}>
                                    {editingTask ? "Save Changes" : "Create Service"}
                                </Text>
                            </Pressable>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.secondaryButton,
                                    pressed && styles.cardPressed,
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
                    <View style={styles.confirmCard}>
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
                                    pressed && styles.cardPressed,
                                ]}
                                onPress={deleteTask}
                            >
                                <Text style={styles.dangerButtonText}>Yes, Delete</Text>
                            </Pressable>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.secondaryButton,
                                    pressed && styles.cardPressed,
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: commonUi.screen.safeArea,
    safeAreaWeb: commonUi.screen.safeAreaWeb,
    scrollView: commonUi.screen.scrollView,
    scrollViewWeb: commonUi.screen.scrollViewWeb,
    scrollContent: {
        ...commonUi.screen.scrollContent,
        paddingTop: 10,
        paddingHorizontal: 14,
    },

    pageWrap: {
        marginBottom: 10,
    },

    heroCard: {
        ...commonUi.hero.heroCard,
        marginBottom: 14,
    },
    blobOne: commonUi.hero.blobOne,
    blobTwo: commonUi.hero.blobTwo,
    kicker: commonUi.hero.kicker,
    heroTitle: {
        ...commonUi.hero.heroTitle,
        fontSize: 31,
        lineHeight: 36,
        marginTop: 6,
    },
    heroText: {
        fontSize: 14,
        lineHeight: 21,
        color: "#5e473c",
        marginTop: 10,
        marginBottom: 14,
        maxWidth: "94%",
    },
    heroMetaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 14,
        zIndex: 2,
    },
    heroButton: {
        marginTop: 0,
    },

    sectionTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#281c17",
        marginBottom: 10,
        marginTop: 2,
    },

    taskCard: {
        backgroundColor: "#fff8f2",
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: "#ead9ce",
        marginBottom: 12,
    },
    taskCardTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 12,
    },
    taskHeaderLeft: {
        flex: 1,
    },
    taskName: {
        fontSize: 18,
        fontWeight: "800",
        color: "#281c17",
        marginBottom: 8,
    },
    categoryChip: {
        alignSelf: "flex-start",
        backgroundColor: "#f2e4d8",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: "#e2cfc1",
    },
    categoryChipText: {
        color: "#5a4034",
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
        borderBottomColor: "#f0e2d8",
    },
    detailLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#8b6d5e",
        flex: 0.8,
    },
    detailValue: {
        fontSize: 13,
        color: "#5e473c",
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
        backgroundColor: "#fff8f2",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#ead9ce",
        padding: 22,
        alignItems: "center",
        marginTop: 4,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#281c17",
        marginBottom: 6,
        textAlign: "center",
    },
    emptyText: {
        fontSize: 13.5,
        color: "#6a5348",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 14,
    },
    emptyButton: {
        alignSelf: "stretch",
    },

    formModalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(16, 10, 8, 0.45)",
        justifyContent: "center",
        paddingHorizontal: 14,
    },
    modalCard: {
        backgroundColor: "#fff8f2",
        borderRadius: 26,
        borderWidth: 1,
        borderColor: "#ead9ce",
        maxHeight: "88%",
        padding: 18,
    },
    confirmCard: {
        backgroundColor: "#fff8f2",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#ead9ce",
        padding: 18,
    },
    confirmTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#281c17",
        marginBottom: 8,
    },
    confirmText: {
        fontSize: 14,
        color: "#5e473c",
        lineHeight: 21,
        marginBottom: 14,
    },

    modalFormWrap: {
        paddingTop: 4,
        paddingBottom: 8,
    },
    rowInputs: {
        flexDirection: "row",
        gap: 10,
    },
    halfInput: {
        flex: 1,
    },

    formTitle: commonUi.auth.formTitle,
    formDescription: commonUi.auth.formDescription,
    inputGroup: commonUi.auth.inputGroup,
    inputLabel: commonUi.auth.inputLabel,
    input: commonUi.auth.input,

    selectButton: {
        backgroundColor: "#f3e7de",
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: "#e5d2c5",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    selectValue: {
        flex: 1,
        fontSize: 15,
        fontWeight: "700",
        color: "#2b1b15",
        paddingRight: 10,
    },
    selectValueMuted: {
        color: "#8b6d5e",
    },
    selectChevron: {
        fontSize: 24,
        color: "#7f5d4d",
        marginTop: -2,
    },

    modalActionRow: {
        gap: 10,
        marginTop: 10,
    },

    primaryButton: commonUi.auth.primaryButton,
    primaryButtonText: commonUi.auth.primaryButtonText,
    primaryButtonDisabled: {
        opacity: 0.55,
    },

    secondaryButton: {
        backgroundColor: "#f2e4d8",
        borderRadius: 24,
        paddingVertical: 15,
        alignItems: "center",
    },
    secondaryButtonText: {
        color: "#2b1b15",
        fontSize: 14,
        fontWeight: "700",
    },

    dangerButton: {
        backgroundColor: "#7a211d",
        borderRadius: 24,
        paddingVertical: 15,
        alignItems: "center",
    },
    dangerButtonText: {
        color: "#fff8f3",
        fontSize: 14,
        fontWeight: "800",
    },

    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 18,
        backgroundColor: "rgba(36, 23, 19, 0.22)",
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
        backgroundColor: "#fff8f2",
        borderRadius: 28,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 14,
        borderWidth: 1,
        borderColor: "#ead9ce",
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
        color: "#231712",
    },
    closeButton: {
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    optionModalClose: {
        fontSize: 18,
        fontWeight: "800",
        color: "#7f5d4d",
    },
    optionModalList: {
        maxHeight: 420,
    },
    optionModalListContent: {
        paddingBottom: 8,
    },
    optionRow: {
        backgroundColor: "#f3e7de",
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: "#e5d2c5",
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    optionRowSelected: {
        backgroundColor: "#ead7ca",
        borderColor: "#9b664d",
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
        color: "#2b1b15",
    },
    optionLabelSelected: {
        color: "#231712",
    },
    optionSubLabel: {
        marginTop: 4,
        fontSize: 12,
        color: "#7f5d4d",
        fontWeight: "600",
    },
    optionSubLabelSelected: {
        color: "#9b664d",
    },
    optionCheck: {
        fontSize: 18,
        fontWeight: "800",
        color: "#9b664d",
    },
    emptyOptionText: {
        fontSize: 14,
        color: "#6a5348",
        textAlign: "center",
        paddingVertical: 22,
    },

    metaChip: commonUi.hero.metaChip,
    metaChipText: commonUi.hero.metaChipText,
    cardPressed: commonUi.auth.cardPressed,
});