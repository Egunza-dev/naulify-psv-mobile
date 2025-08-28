import React, { useState } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import { useSession } from '../context/AuthContext';
import { createPsvProfile, PsvProfile } from '../services/firestore';
import { useRouter } from 'expo-router';

type VehicleType = 'van' | 'bus' | 'mini-bus';

const OnboardingScreen = () => {
  const { user, reloadSession } = useSession();
  const router = useRouter();

  const [ownerName, setOwnerName] = useState('');
  const [vehicleRegistration, setVehicleRegistration] = useState('');
  const [mpesaShortCode, setMpesaShortCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('bus');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    setError('');
    if (!ownerName || !vehicleRegistration || !mpesaShortCode || !phoneNumber) {
      setError('Please fill in all fields.');
      return false;
    }
    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateForm() || !user) {
      return;
    }

    setLoading(true);

    const profileData: Omit<PsvProfile, 'uid' | 'createdAt'> = {
      ownerName,
      vehicleRegistration,
      phoneNumber,
      mpesaShortCode,
      vehicleType,
    };

    try {
      await createPsvProfile(user.uid, profileData);
      await reloadSession();
      router.replace('/(app)');

    } catch (err) {
      setError('Failed to save profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Welcome to Naulify!</Text>
      <Text style={styles.subtitle}>Complete your profile to get started.</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Text style={styles.label}>Owner's Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., John Doe"
        placeholderTextColor="#888"
        value={ownerName}
        onChangeText={setOwnerName}
      />

      <Text style={styles.label}>Vehicle License Plate</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., KDC 123A"
        placeholderTextColor="#888"
        value={vehicleRegistration}
        onChangeText={setVehicleRegistration}
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Your M-PESA Till / Paybill Number</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 123456"
        placeholderTextColor="#888"
        value={mpesaShortCode}
        onChangeText={setMpesaShortCode}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Your Phone Number (for contact)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 0712 345 678"
        placeholderTextColor="#888"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Vehicle Type</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={vehicleType}
          onValueChange={(itemValue) => setVehicleType(itemValue)}
          style={styles.picker}
          dropdownIconColor="#fff"
          // **THE FIX IS HERE:** Use itemStyle to ensure all parts of the picker are styled
          itemStyle={{ color: '#fff', backgroundColor: '#444' }}
        >
          <Picker.Item label="Bus" value="bus" />
          <Picker.Item label="Mini-bus" value="mini-bus" />
          <Picker.Item label="Van" value="van" />
        </Picker>
      </View>

      <TouchableOpacity onPress={handleSaveProfile} style={styles.button} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>SAVE & GET STARTED</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#333'
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
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
  pickerContainer: {
    backgroundColor: '#444',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#555',
    marginBottom: 30,
    // On web, the container needs to control the text color sometimes
    color: '#fff',
  },
  picker: {
    color: '#fff',
    height: 50,
    // Add a specific style for web to override default browser styles
    backgroundColor: '#444',
  },
  button: {
    backgroundColor: '#555',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
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

export default OnboardingScreen;
