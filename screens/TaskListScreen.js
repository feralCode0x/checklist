import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const TaskListScreen = ({ navigation, onLogout}) => {
    const [tasks, setTasks] = useState([]);
    const [userEmail, setUserEmail] = useState('');
    const [editingTask, setEditingTask] = useState(null);
    const [editedTask, setEditedTask] = useState(null);

    useEffect(() => {
        initSessionAndLoadTasks();
    }, []);

   useEffect(() => {
        navigation.setOptions({
            title: 'Checklist',
            headerRight: () => (
                <TouchableOpacity
                    onPress={onLogout}
                    style={{
                        backgroundColor: 'white',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        marginRight: 12,
                        borderWidth: 1,
                        borderColor: '#b0c4de',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    <Ionicons name="ios-log-out-outline" size={18} color="#333" style={{ marginRight: 4 }} />
                    <Text style={{ color: '#333', fontWeight: 'bold', fontSize: 13 }}>
                        Cerrar sesión
                    </Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation, onLogout]);

    const initSessionAndLoadTasks = async () => {
        try {
            const sessionData = await AsyncStorage.getItem('userSession');
            if (sessionData) {
                const { email } = JSON.parse(sessionData);
                setUserEmail(email);
                fetchTasks(email);
            }
        } catch (error) {
            console.error('Error cargando sesión:', error);
        }
    };

    const fetchTasks = async (email) => {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_email', email)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error cargando notas de Supabase:', error);
        } else {
            setTasks(data || []);
        }
    };

    const handleDeleteTask = async (taskId) => {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

        if (error) {
            Alert.alert('Error', 'No se pudo eliminar la nota.');
            console.error(error);
            return;
        }

        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    };

    const handleEditTask = (taskId) => {
        setEditingTask(taskId);
        const taskToEdit = tasks.find((task) => task.id === taskId);
        setEditedTask({ ...taskToEdit });
    };

    const handleSaveTask = async () => {
        if (!editedTask || !editedTask.name.trim()) {
            Alert.alert('Validation Error', 'Task name is required.');
            return;
        }

        const { error } = await supabase
            .from('tasks')
            .update({
                name: editedTask.name.trim(),
                description: editedTask.description ? editedTask.description.trim() : '',
                category: editedTask.category ? editedTask.category.trim() : '',
            })
            .eq('id', editingTask);

        if (error) {
            Alert.alert('Error', 'No se pudo actualizar la nota.');
            console.error(error);
            return;
        }

        const updatedTasks = tasks.map((task) =>
            task.id === editingTask ? { ...editedTask } : task
        );
        setTasks(updatedTasks);
        setEditingTask(null);
        setEditedTask(null);
    };

    const renderItem = ({ item }) => (
        <View style={styles.taskItem}>
            <View style={styles.taskInfo}>
                <Text style={styles.taskName}>{item.name}</Text>
                <Text style={styles.taskDescription}>{item.description}</Text>
                <Text style={styles.taskCategory}>{item.category}</Text>
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
                    <View style={styles.deleteButton}>
                        <Ionicons name="ios-trash" size={24} color="white" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleEditTask(item.id)}>
                    <View style={styles.editButton}>
                        <Ionicons name="ios-create" size={24} color="white" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                style={styles.flatList}
            />

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddTask', { tasks, setTasks, userEmail })}
            >
                <Ionicons name="ios-add" size={36} color="white" />
            </TouchableOpacity>

              <Modal
                visible={editingTask !== null}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setEditingTask(null);
                    setEditedTask(null);
                }}
            >
                <View style={styles.editTaskModal}>
                    {/* Fondo oscuro que cierra el modal solo si haces clic fuera de la caja */}
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={() => {
                            setEditingTask(null);
                            setEditedTask(null);
                        }}
                    />

                    {/* Caja blanca del formulario (ya no está dentro del TouchableOpacity) */}
                    <View style={styles.editTaskContainer}>
                        <Text style={styles.editTaskTitle}>Edit Task</Text>
                        <TextInput
                            style={styles.editTaskInput}
                            placeholder="Task Name *"
                            value={editedTask?.name}
                            onChangeText={(text) =>
                                setEditedTask((prevTask) => ({ ...prevTask, name: text }))
                            }
                        />
                        <TextInput
                            style={styles.editTaskInput}
                            placeholder="Task Description"
                            value={editedTask?.description}
                            onChangeText={(text) =>
                                setEditedTask((prevTask) => ({ ...prevTask, description: text }))
                            }
                        />
                        <TextInput
                            style={styles.editTaskInput}
                            placeholder="Task Category"
                            value={editedTask?.category}
                            onChangeText={(text) =>
                                setEditedTask((prevTask) => ({ ...prevTask, category: text }))
                            }
                        />
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveTask}>
                            <Ionicons name="ios-checkmark-circle" size={36} color="blue" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff7bf' },
    taskItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#b0c4de',
        borderRadius: 8,
        padding: 16,
        marginBottom: 8,
        backgroundColor: 'white',
    },
    taskInfo: { flex: 1 },
    taskName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    taskCategory: { color: '#3498db', fontStyle: 'italic' },
    deleteButton: { backgroundColor: '#1e90ff', borderRadius: 10, padding: 5, marginRight: 8 },
    editButton: { backgroundColor: '#1e90ff', borderRadius: 10, padding: 5 },
    addButton: {
        backgroundColor: '#1e90ff',
        borderRadius: 50,
        width: 50,
        height: 50,
        position: 'absolute',
        bottom: 16,
        right: '40%',
        transform: [{ translateX: -25 }],
        justifyContent: 'center',
        alignItems: 'center',
    },
    flatList: { flex: 1 },
    buttonsContainer: { flexDirection: 'row' },
    editTaskModal: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    editTaskContainer: { backgroundColor: 'white', padding: 16, borderRadius: 8, width: '80%' },
    editTaskTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
    editTaskInput: { height: 40, borderColor: '#b0c4de', borderWidth: 1, marginBottom: 16, paddingHorizontal: 8 },
    saveButton: { borderRadius: 50, width: 50, height: 50, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginTop: 16 },
});

export default TaskListScreen;
