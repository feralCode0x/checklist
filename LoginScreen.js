import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      Alert.alert('Error', 'Ingresa un correo electrónico válido.');
      return;
    }

    const userSession = { email: cleanEmail };
    try {
      await AsyncStorage.setItem('userSession', JSON.stringify(userSession));
      onLoginSuccess(userSession);
    } catch (error) {
      console.error('Error guardando sesión:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checklist</Text>
      
      {/* Nuevo contenedor para controlar el ancho */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu correo (ej. ana@mail.com)"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Button title="Entrar" onPress={handleLogin} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', // Centra horizontalmente el formContainer
    padding: 20, 
    backgroundColor: '#fff7bf' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  formContainer: {
    width: '80%',       // Ajusta este porcentaje o usa un número fijo (ej. 280)
    maxWidth: 350,      // Evita que se vea muy ancho en tablets o pantallas grandes
  },
  input: {
    height: 45,
    borderColor: '#b0c4de',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: 'white',
  },
});

export default LoginScreen;
