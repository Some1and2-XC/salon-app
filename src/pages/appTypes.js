import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, ScrollView, Modal} from "react-native";
import { Picker } from "@react-native-picker/picker";

import { sty } from "../styles";
import { apiFetch } from "../utils";

export function AdminAppointmentTypesScreen() {

    const [tasks, setTasks] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
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

    const fetchTasks = async () => {
        await apiFetch("/tasks")
            .then((res) => res.json())
            .then((json) => setTasks(json))
            .catch(console.error)
            ;
    };

    const saveTask = async () => {
        const payload = {
            name,
            price_cad_cent: Math.round(Number(price) * 100), // convert dollars to cents
            task_category_id: Number(category),
            time_for_booking: Math.round(Number(time) * 60), // convert minutes to seconds
        };

        if (editingTask) {
            await apiFetch(`/tasks/${editingTask.id}`, { method: "PATCH", body: payload, })
                .catch(console.error)
                ;
        } else {
            await apiFetch("/tasks", { method: "POST", body: payload, })
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

        await apiFetch(`/tasks/${taskToDelete.id}`, { method: "DELETE" })
            .catch(console.error)
            ;

        setDeleteModalVisible(false);
        fetchTasks();

    };


    return (
        <View style={sty.container}>
            <Text style={sty.h1}>Admin Manage Services</Text>

            <Button title="New Appointment Type" onPress={openCreateModal} color="#2cc156" />

            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={sty.containerCard}>
                        <Text style={sty.textBold}>{item.name}</Text>
                        <Text>Price: ${ (item.price_cad_cent / 100).toFixed(2) }</Text>
                        <Text>Category: {taskCategories[item.task_category_id]?.name}</Text>
                        <Text>Time: { Math.round(item.time_for_booking / 60) } minutes</Text>
                        <Text>Date Created: {new Date(Number(item.date_created)).toLocaleString()}</Text>
                        <Text>Last Modified: {new Date(Number(item.last_modified)).toLocaleString()}</Text>

                        <View>
                            <Button onPress={() => openEditModal(item)} title="Update" />
                            <Button onPress={() => confirmDeleteTask(item)} title="Delete" color="red" />
                        </View>
                    </View>
                )}
            />

            {/* Modal for Create / Update */}
            <Modal visible={modalVisible} animationType="slide">
                <View>
                    <View>
                        <Text>{editingTask ? "Update Task" : "Create Task"}</Text>

                        <TextInput
                            placeholder="Service Name"
                            value={name}
                            onChangeText={setName}
                        />
                        <TextInput
                            placeholder="Price ($)"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                        />
                        <Text>Category:</Text>
                        <Picker selectedValue={category} onValueChange={(val) => setCategory(val)}>
                            <Picker.Item label="Select Category" value="" />
                            {taskCategories.map((cat) => (
                                <Picker.Item key={cat.id} label={cat.name} value={cat.id.toString()} />
                            ))}
                        </Picker>
                        <TextInput
                            placeholder="Time (minutes)"
                            value={time}
                            onChangeText={setTime}
                            keyboardType="numeric"
                        />

                        <View>
                            <Button title={editingTask ? "Update" : "Create"} onPress={saveTask} />
                            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={deleteModalVisible} animationType="fade">
                <View>
                    <View>
                        <Text>Are you sure you want to delete this task? ({taskToDelete ? `${taskToDelete.name}` : "NULL" })</Text>
                        <View>
                            <Button title="Yes" onPress={deleteTask} />
                            <Button title="Cancel" color="red" onPress={() => setDeleteModalVisible(false)} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
