import { Stack } from 'expo-router';
import React from 'react';

/**
 * This component defines the main navigation stack for the authenticated user.
 */
const AppLayout = () => {
  return (
    <Stack
      // Define a default header style for consistency across screens in this stack
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
      {/* 
        This is the main dashboard screen (app/(app)/index.tsx).
      */}
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false // Hide the header for the custom dashboard header
        }} 
      />
      
      {/* 
        This is the "Edit Profile" screen.
      */}
      <Stack.Screen 
        name="profile" 
        options={{ 
          title: 'Edit Your Profile',
          presentation: 'modal', 
        }} 
      />

      {/* 
        This is the "Manage Routes" feature stack.
      */}
      <Stack.Screen 
        name="routes" 
        options={{ 
          headerShown: false 
        }} 
      />

      {/* **--- NEW: The Generate QR Code screen ---** */}
      <Stack.Screen 
        name="qr-code" // This corresponds to the file we will create: qr-code.tsx
        options={{ 
          title: "Your Vehicle's QR Code"
        }} 
      />

      {/* 
        This is the Reports screen (already present in your file).
      */}
      <Stack.Screen 
        name="reports" 
        options={{ 
          title: 'Reports'
        }} 
      />
    </Stack>
  );
};

export default AppLayout;
