import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './AppNavigator';
import LoginScreen from './LoginScreen';
import { ChecklistReorder } from "./components/ChecklistReorder";


const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('userSession');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Error cargando sesión:', e);
    } finally {
      setLoading(false);
    }
  };

   const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userSession');
      setUser(null);
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    }
  };

 if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  return user ? (
    <AppNavigator onLogout={handleLogout} />
  ) : (
    <LoginScreen onLoginSuccess={(userData) => setUser(userData)} />
  );
};

export default App;