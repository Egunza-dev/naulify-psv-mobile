import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  Button 
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useSession } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// A simple banner component for the email verification prompt
const VerificationBanner = () => {
  const { user } = useSession();

  const handleResendVerification = async () => {
    if (user) {
      // Logic for resending verification email can be added here
      Alert.alert("Resend Verification", "Functionality to resend verification email can be implemented here.");
    }
  };

  if (user?.emailVerified) {
    return null; // Don't show the banner if email is verified
  }

  return (
    <View style={styles.bannerContainer}>
      <Text style={styles.bannerText}>Please check your inbox to verify your email.</Text>
      <TouchableOpacity onPress={handleResendVerification}>
        <Text style={styles.bannerLink}>Resend</Text>
      </TouchableOpacity>
    </View>
  );
};


const HomeScreen = () => {
  const { user, profile } = useSession();
  const router = useRouter();

  const handleLogout = () => {
    signOut(auth);
    // The root layout will automatically navigate to the login screen.
  };
  
  // A simple handler for the remaining placeholder button
  const handleFeaturePress = (featureName: string) => {
    Alert.alert(featureName, "This feature will be implemented in a future step.");
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Naulify</Text>
        <Text style={styles.headerGreeting}>Hello, {profile?.ownerName?.split(' ')[0]}!</Text>
      </View>

      {/* Verification Banner */}
      <VerificationBanner />

      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Your Profile</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/profile')}>
            <Text style={styles.editLink}>Edit &gt;</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.profileDetails}>
          <Text style={styles.profileText}>Vehicle: {profile?.vehicleRegistration} ({profile?.vehicleType})</Text>
          <Text style={styles.profileText}>M-PESA: {profile?.mpesaShortCode}</Text>
        </View>
      </View>
      
      {/* Earnings Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>TODAY'S EARNINGS</Text>
        <Text style={styles.earningsText}>KSH 0.00</Text>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navContainer}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => router.push('/(app)/routes')}
        >
          <Ionicons name="map-outline" size={24} color="#fff" />
          <Text style={styles.navButtonText}>Manage Routes</Text>
        </TouchableOpacity>
        
        {/* --- THE ONLY CHANGE IS IN THE onPress PROP BELOW --- */}
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => router.push('/(app)/qr-code')}
        >
          <Ionicons name="qr-code-outline" size={24} color="#fff" />
          <Text style={styles.navButtonText}>Generate QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => router.push('/(app)/reports')}
        >
          <Ionicons name="bar-chart-outline" size={24} color="#fff" />
          <Text style={styles.navButtonText}>View Reports</Text>
        </TouchableOpacity>
      </View>
      
      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button title="Logout" onPress={handleLogout} color="#ff4d4d" />
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#2a2a2a',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerGreeting: {
    fontSize: 16,
    color: '#ccc',
  },
  bannerContainer: {
    backgroundColor: '#fff3cd',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerText: {
    color: '#856404',
    flex: 1,
  },
  bannerLink: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#444',
    borderRadius: 8,
    padding: 20,
    margin: 20,
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  editLink: {
    fontSize: 14,
    color: '#007bff',
  },
  profileDetails: {
    marginTop: 10,
  },
  profileText: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 5,
  },
  earningsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  navContainer: {
    margin: 20,
  },
  navButton: {
    backgroundColor: '#555',
    borderRadius: 8,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
  },
  logoutContainer: {
    margin: 20,
    marginTop: 10,
  }
});

export default HomeScreen;
