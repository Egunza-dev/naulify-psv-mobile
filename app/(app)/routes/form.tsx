import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../../../context/AuthContext';
import { addRoute, updateRoute, Route } from '../../../services/firestore';

const RouteFormScreen = () => {
  const router = useRouter();
  const { user } = useSession();
  const params = useLocalSearchParams();

  // State for the form fields
  const [description, setDescription] = useState('');
  const [fare, setFare] = useState('');
  
  // State for UI feedback
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Determine if we are in "edit" mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [routeToEdit, setRouteToEdit] = useState<Route | null>(null);

  // This effect runs ONLY when the route parameter changes, not on every render.
  useEffect(() => {
    // Check if the 'route' parameter from the URL exists.
    if (params.route && typeof params.route === 'string') {
      try {
        const routeData = JSON.parse(params.route) as Route;
        
        // Set all the state for edit mode
        setIsEditMode(true);
        setRouteToEdit(routeData);
        setDescription(routeData.description);
        setFare(routeData.fare.toString());

      } catch (e) {
        console.error("Failed to parse route params:", e);
        Alert.alert("Error", "Could not load route data to edit.");
      }
    }
  // **THE CRITICAL FIX IS HERE**
  // We make the dependency specific to the 'route' parameter string.
  }, [params.route]);

  const validateForm = () => {
    setError('');
    if (!description.trim()) {
      setError('Route description cannot be empty.');
      return false;
    }
    const fareNumber = parseFloat(fare);
    if (isNaN(fareNumber) || fareNumber <= 0) {
      setError('Please enter a valid, positive number for the fare.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !user) {
      return;
    }

    setLoading(true);
    const fareNumber = parseFloat(fare);

    try {
      if (isEditMode && routeToEdit) {
        // Update the existing route
        await updateRoute(user.uid, routeToEdit.id, { description, fare: fareNumber });
      } else {
        // Add a new route
        await addRoute(user.uid, { description, fare: fareNumber });
      }
      
      // If successful, go back to the previous screen
      router.back();

    } catch (err) {
      setError('Failed to save route. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Text style={styles.label}>Route Description</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Town Center -> Westlands"
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Fare (KSH)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 100"
        placeholderTextColor="#888"
        value={fare}
        onChangeText={setFare}
        keyboardType="numeric"
      />

      <TouchableOpacity onPress={handleSave} style={styles.button} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>SAVE CHANGES</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#333'
  },
  label: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#444',
    color: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 5,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#555',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#ff4d4d',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
  }
});

export default RouteFormScreen;
