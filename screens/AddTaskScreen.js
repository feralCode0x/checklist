import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { LogBox } from 'react-native';
import { supabase } from './supabase';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const AddTaskScreen = ({ navigation, route }) => {
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskCategory, setTaskCategory] = useState('');

    const handleAddTask = async () => {
        if (!taskName.trim()) {
            Alert.alert('Validation Error', 'Task name is required.');
            return;
        }

        const { userEmail, tasks, setTasks } = route.params;

        const { data, error } = await supabase
            .from('tasks')
            .insert([
                {
                    user_email: userEmail,
                    name: taskName.trim(),
                    description: taskDescription.trim(),
                    category: taskCategory.trim(),
                },
            ])
            .select();

        if (error) {
            Alert.alert('Error', 'No se pudo guardar la nota en Supabase.');
            console.error(error);
            return;
        }

        if (data && data.length > 0) {
            setTasks([data[0], ...tasks]);
        }

        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Task Screen</Text>

            <TextInput
                style={styles.input}
                placeholder="Task Name *"
                value={taskName}
                onChangeText={setTaskName}
            />

            <TextInput
                style={styles.input}
                placeholder="Task Description"
                value={taskDescription}
                onChangeText={setTaskDescription}
            />

            <TextInput
                style={styles.input}
                placeholder="Task Category"
                value={taskCategory}
                onChangeText={setTaskCategory}
            />

            <Button title="Add Task" onPress={handleAddTask} />

            <Button
                title="Go Back"
                onPress={() => navigation.goBack()}
                color="#808080"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#add8e6' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#333' },
    input: {
        height: 40,
        borderColor: '#b0c4de',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
        backgroundColor: 'white',
    },
});

export default AddTaskScreen;