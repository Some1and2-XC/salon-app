import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, ScrollView, Modal} from "react-native";
import { Picker } from "@react-native-picker/picker";

const API = process.env.EXPO_PUBLIC_DATABASE_API_DOMAIN;

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

    const fetchTasks = async () => {
        try { 
            const res = await fetch(`${API}/tasks`);
            const data = await res.json();
            setTasks(data);
        } catch (err) {
            console.log("Error fetching tasks: ", err);
        }
    };

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
            name,
            price_cad_cent: Math.round(Number(price) * 100), // convert dollars to cents
            task_category_id: Number(category),
            time_for_booking: Math.round(Number(time) * 60), // convert minutes to seconds
        };

        if (editingTask) {
            await fetch(`${API}/tasks/${editingTask.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
        } else {
            await fetch(`${API}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
        }

        setModalVisible(false);
        fetchTasks();
    };

    const confirmDeleteTask = (task) => {
        setTaskToDelete(task);
        setDeleteModalVisible(true);
    };

    const deleteTask = async () => {
        await fetch(`${API}/tasks/${taskToDelete.id}`, { method: "DELETE" });
        setDeleteModalVisible(false);
        fetchTasks();
    };


    return (
        <View>
            <Text>Admin Manage Services</Text>

            <TouchableOpacity onPress={openCreateModal}>
                <Text>+</Text>
            </TouchableOpacity>

            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View>
                        <Text>{item.name}</Text>
                        <Text>Price: ${ (item.price_cad_cent / 100).toFixed(2) }</Text>
                        <Text>Category: {taskCategories[item.task_category_id]?.name}</Text>
                        <Text>Time: { Math.round(item.time_for_booking / 60) } minutes</Text>
                        <Text>Date Created: {new Date(Number(item.date_created)).toLocaleString()}</Text>
                        <Text>Last Modified: {new Date(Number(item.last_modified)).toLocaleString()}</Text>

                        <View>
                            <TouchableOpacity onPress={() => openEditModal(item)}>
                                <Text>Update</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => confirmDeleteTask(item)}>
                                <Text>Delete</Text>
                            </TouchableOpacity>
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

            <Modal visible={deleteModalVisible} transparent animationType="fade">
                <View>
                    <View>
                        <Text>Are you sure you want to delete this task?</Text>
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
