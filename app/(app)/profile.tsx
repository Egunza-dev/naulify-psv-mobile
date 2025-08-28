import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSession } from '../../context/AuthContext';
import { updatePsvProfile, UpdatePsvProfileData } from '../../services/firestore';
import { useRouter } from 'expo-router';

type VehicleType = 'van' | 'bus' | 'mini-bus';

const EditProfileScreen = () => {
  const { profile, user, reloadSession } = useSession();
  const router = useRouter();

  const [ownerName, setOwnerName] = useState(profile?.ownerName || '');
  const [vehicleRegistration, setVehicleRegistration] = useState(profile?.vehicleRegistration || '');
  const [mpesaShortCode, setMpesaShortCode] = useState(profile?.mpesaShortCode || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [vehicleType, setVehicleType] = useState<VehicleType>(profile?.vehicleType || 'bus');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setOwnerName(profile.ownerName);
      setVehicleRegistration(profile.vehicleRegistration);
      setMpesaShortCode(profile.mpesaShortCode);
      setPhoneNumber(profile.phoneNumber);
      setVehicleType(profile.vehicleType);
    }
  }, [profile]);

  const validateForm = () => {
    setError('');
    if (!ownerName || !vehicleRegistration || !mpesaShortCode || !phoneNumber) {
      setError('Please fill in all fields.');
      return false;
    }
    return true;
  };

  const handleSaveChanges = async () => {
    if (!validateForm() || !user) {
      return;
    }
    setLoading(true);
    const updatedData: UpdatePsvProfileData = {
      ownerName,
      vehicleRegistration,
      phoneNumber,
      mpesaShortCode,
      vehicleType,
    };
    try {
      await updatePsvProfile(user.uid, updatedData);
      await reloadSession();
      Alert.alert("Success", "Your profile has been updated.");
      router.replace('/(app)');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Text style={styles.label}>Owner's Full Name</Text>
      <TextInput style={styles.input} value={ownerName} onChangeText={setOwnerName}/>

      <Text style={styles.label}>Vehicle License Plate</Text>
      <TextInput style={styles.input} value={vehicleRegistration} onChangeText={setVehicleRegistration} autoCapitalize="characters"/>

      <Text style={styles.label}>M-PESA Till / Paybill Number</Text>
      <TextInput style={styles.input} value={mpesaShortCode} onChangeText={setMpesaShortCode} keyboardType="number-pad"/>

      <Text style={styles.label}>Contact Phone Number</Text>
      <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad"/>

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

      <TouchableOpacity onPress={handleSaveChanges} style={styles.button} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SAVE CHANGES</Text>}
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
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
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

export default EditProfileScreen;
