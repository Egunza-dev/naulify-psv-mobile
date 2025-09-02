import { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native'; // Import ScrollView
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import NaulifyLogo from './../components/Logo';

// **UPDATED COMPONENT to fix overflow**
const PasswordStrengthIndicator = ({ password }: { password?: string }) => {
    if (!password) return null;
  
    const checkStrength = () => {
      let score = 0;
      if (password.length >= 8) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;
      return score;
    };
  
    const strengthScore = checkStrength();
    const strength = {
      0: { text: '', color: 'transparent' },
      1: { text: 'Weak', color: '#ff4d4d' },
      2: { text: 'Fair', color: '#ffa500' },
      3: { text: 'Good', color: '#90ee90' },
      4: { text: 'Strong', color: '#008000' },
    }[strengthScore];
  
    return (
      <View style={styles.strengthContainer}>
        {/* 1. Bar container now has flex: 1 to properly calculate child width */}
        <View style={styles.strengthBarContainer}>
            {/* 2. The colored bar itself */}
            <View style={[styles.strengthBar, { width: `${strengthScore * 25}%`, backgroundColor: strength?.color }]} />
        </View>
        <Text style={[styles.strengthText, { color: strength?.color, width: 60 }]}>{strength?.text}</Text>
      </View>
    );
};

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSignUp = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      Alert.alert("Verification Email Sent", "Your account has been created. Please check your inbox to verify your email address.");
    } catch (err: any) {
      setLoading(false);
      switch (err.code) {
        case 'auth/email-already-in-use': setError('This email address is already registered.'); break;
        case 'auth/weak-password': setError('Password must be at least 8 characters long.'); break;
        case 'auth/invalid-email': setError('Please enter a valid email address.'); break;
        default: setError('An unexpected error occurred. Please try again.'); break;
      }
    }
  };

  const validateForm = () => {
    // ... validation logic ...
    return true;
  };

  return (
    // **Use ScrollView to prevent overflow on smaller screens**
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <NaulifyLogo size={80} />
        <Text style={styles.title}>Naulify</Text>
        <Text style={styles.subtitle}>(PSV Portal)</Text>
      </View>

      <View style={styles.tabs}>
        <Link href="/(auth)/login" asChild><TouchableOpacity><Text style={styles.tab}>Login</Text></TouchableOpacity></Link>
        <Text style={[styles.tab, styles.activeTab]}>Sign Up</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput style={styles.input} placeholder="user@example.com" placeholderTextColor="#888" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>
      
      <View style={styles.passwordContainer}>
        <TextInput style={styles.passwordInput} placeholder="Create a Password" placeholderTextColor="#888" value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible}/>
        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
            <Ionicons name={isPasswordVisible ? "eye-off" : "eye"} size={24} color="#888" />
        </TouchableOpacity>
      </View>

      <PasswordStrengthIndicator password={password} />
      
      <TouchableOpacity onPress={handleSignUp} style={styles.button} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SIGN UP</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#333' },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#fff', marginBottom: 10,},
    subtitle: { fontSize: 16, textAlign: 'center', color: '#ccc', marginBottom: 30, },
    tabs: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20,},
    tab: { fontSize: 18, color: '#ccc', paddingBottom: 10,},
    activeTab: { color: '#fff', borderBottomWidth: 2, borderBottomColor: '#fff', },
    input: { backgroundColor: '#444', color: '#fff', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 5, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#555',},
    passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#444', borderRadius: 5, borderWidth: 1, borderColor: '#555', marginBottom: 15,},
    passwordInput: { flex: 1, color: '#fff', paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, },
    eyeIcon: { padding: 10, },
    button: { backgroundColor: '#555', padding: 15, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16,},
    errorText: { color: '#ff4d4d', textAlign: 'center', marginBottom: 10, fontWeight: 'bold', },
    strengthContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: -10, },
    // **NEW STYLES**
    strengthBarContainer: {
        flex: 1, // Take up remaining space
        height: 8,
        backgroundColor: '#555', // The "empty" part of the bar
        borderRadius: 4,
        overflow: 'hidden', // This is the key to clipping the child bar
    },
    strengthBar: { 
        height: '100%',
        borderRadius: 4, // Match parent's borderRadius
    },
    strengthText: { 
        marginLeft: 10, 
        fontSize: 12, 
        fontWeight: 'bold',
        width: 60, // Give text a fixed width to stabilize layout
        textAlign: 'right',
    }
});

export default SignUp;
