import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * This component defines the navigation stack for the "Manage Routes" feature.
 */
const RoutesLayout = () => {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2a2a2a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Fare Stages',
          headerLeft: () => (
            // **THE FIX IS HERE:**
            // Instead of router.back(), we use an explicit replace to go home.
            // This cleanly exits the "routes" feature stack and returns to the app's index.
            <TouchableOpacity onPress={() => router.replace('/(app)')} style={{ marginLeft: 10 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <Stack.Screen 
        name="form" 
        options={{ 
          title: 'Add / Edit Route',
          presentation: 'modal',
        }} 
      />
    </Stack>
  );
};

export default RoutesLayout;
