import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ScrollView,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useSession } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Verification Banner component (no changes needed here)
const VerificationBanner = () => {
  const { user } = useSession();
  if (user?.emailVerified) return null;

  const handleResendVerification = async () => { /* ... */ };

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
  const { profile } = useSession();
  const router = useRouter();

  const handleLogout = () => {
    signOut(auth);
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Naulify</Text>
        <Text style={styles.headerGreeting} numberOfLines={1}>
          Hello, {profile?.ownerName?.split(' ')[0]}
        </Text>
      </View>

      {/* Verification Banner */}
      <VerificationBanner />

      <View style={styles.content}>
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Your Profile</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/profile')}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.profileText}>Vehicle: {profile?.vehicleRegistration} ({profile?.vehicleType})</Text>
          <Text style={styles.profileText}>M-PESA: {profile?.mpesaShortCode}</Text>
        </View>
        
        {/* Earnings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>TODAY'S EARNINGS</Text>
          <Text style={styles.earningsText}>KSH 0.00</Text>
        </View>

        {/* Navigation Buttons */}
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/(app)/routes')}>
          <Ionicons name="map-outline" size={20} color="#fff" />
          <Text style={styles.navButtonText}>Manage Routes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/(app)/qr-code')}>
          <Ionicons name="qr-code-outline" size={20} color="#fff" />
          <Text style={styles.navButtonText}>Generate QR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/(app)/reports')}>
          <Ionicons name="bar-chart-outline" size={20} color="#fff" />
          <Text style={styles.navButtonText}>View</Text>
        </TouchableOpacity>
        
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>LOGOUT</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// --- THIS IS THE NEW, PROFESSIONALLY RE-STYLED STYLESHEET ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e', // A slightly off-black for depth
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50, // More space for modern phone notches
    paddingBottom: 16,
    backgroundColor: '#1c1c1e',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerGreeting: {
    fontSize: 16,
    color: '#a0a0a0',
    // **THE FIX for the missing name**
    flex: 1, // Allows the text to take up available space
    textAlign: 'right', // Aligns the text to the right
  },
  bannerContainer: {
    backgroundColor: '#4d3d1e', // A darker, more integrated warning color
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerText: {
    color: '#ffc107', // Amber text color
    flex: 1,
  },
  bannerLink: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#2c2c2e', // A lighter shade of dark for cards
    borderRadius: 16, // More rounded corners for a modern look
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a0a0a0',
    textTransform: 'uppercase',
  },
  editLink: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: 'bold',
  },
  profileText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  earningsText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  navButton: {
    backgroundColor: '#2c2c2e',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
  },
  logoutButton: {
    backgroundColor: '#d9534f', // A standard, accessible red color
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
