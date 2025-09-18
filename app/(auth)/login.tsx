import { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
// **UPDATED: Import the web-specific popup method**
import { signInWithEmailAndPassword, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebaseConfig';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import NaulifyLogo from './../components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const validateForm = () => {
    setError(''); // Clear any previous errors at the start of validation
    
    // Check 1: Ensure both fields are filled
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return false; // Validation fails
    }

    // Note: A simple email format check could be added here if desired,
    // but Firebase's error handling for 'auth/invalid-email' also covers this effectively.
    
    // If all checks pass
    return true; // Validation succeeds
};

  // Email/Password login logic (no changes needed here)
  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true); // Start the spinner
    setError(''); // Clear previous errors

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // On success, we do not set loading to false.
      // The router will navigate away, and this component will be unmounted.
      // This ensures the spinner stays active until the screen transition is complete.

    } catch (err: any) {
      // On failure, we must stop the spinner and show the error.
      setLoading(false); 
      handleAuthError(err);
    }
    };
  
  
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      if (Platform.OS === 'web') {
        // --- WEB-SPECIFIC FLOW ---
        // Use the standard Firebase web pop-up flow.
        await signInWithPopup(auth, googleProvider);
        // On success, the onAuthStateChanged listener in our SessionProvider
        // will take over, and the router will navigate away automatically.
        // We don't need to do anything else.
      } else {
        // --- NATIVE (ANDROID) FLOW ---
        // Use the @react-native-google-signin library.
        await GoogleSignin.hasPlayServices();
        const { idToken } = await GoogleSignin.signIn();
        if (!idToken) {
          throw new Error('Google Sign-In failed to return an ID token.');
        }
        const googleCredential = googleProvider.credential(idToken);
        await signInWithCredential(auth, googleCredential);
      }
      // On success on either platform, we don't set loading to false.
      // The component will unmount upon successful navigation.
    } catch (err: any) {
      // On failure, stop the spinner and show an error.
      setGoogleLoading(false);
      
      // We can also check for specific error codes if needed
      if (err.code === 'auth/popup-closed-by-user') {
        // This is not really an error, so we just stop loading.
        return;
      }
      
      setError('Google Sign-In failed. Please try again.');
      console.log('Google Sign-In Error:', JSON.stringify(err, null, 2));
    }
  };

  const handleAuthError = (err: any) => {
    switch (err.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        setError('Invalid email or password. Please try again.');
        break;
      case 'auth/invalid-email':
        setError('Please enter a valid email address.');
        break;
      case 'auth/network-request-failed':
        setError('Network error. Please check your internet connection.');
        break;
      default:
        setError('An unexpected error occurred. Please try again.');
        break;
    }
    };

  // The JSX part of the component remains unchanged.
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <NaulifyLogo size={80} />
        <Text style={styles.title}>Naulify</Text>
        <Text style={styles.subtitle}>(PSV Portal)</Text>
      </View>

      <View style={styles.tabs}>
        <Text style={[styles.tab, styles.activeTab]}>Login</Text>
        <Link href="/(auth)/sign-up" asChild>
          <TouchableOpacity>
            <Text style={styles.tab}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput style={styles.input} placeholder="user@example.com" placeholderTextColor="#888" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>
      
      <View style={styles.passwordContainer}>
        <TextInput style={styles.passwordInput} placeholder="********" placeholderTextColor="#888" value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible}/>
        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
            <Ionicons name={isPasswordVisible ? "eye-off" : "eye"} size={24} color="#888" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity onPress={handleLogin} style={styles.button} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>LOGIN</Text>}
      </TouchableOpacity>

      <Link href="/(auth)/forgot-password" asChild>
        <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </Link>
      
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.divider} />
      </View>

      <TouchableOpacity onPress={handleGoogleSignIn} style={[styles.button, styles.googleButton]} disabled={googleLoading}>
        {googleLoading ? <ActivityIndicator color="#000" /> : (
            <>
                <Ionicons name="logo-google" size={24} color="#000" />
                <Text style={[styles.buttonText, styles.googleButtonText]}>Continue with Google</Text>
            </>
        )}
      </TouchableOpacity>

    </View>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#333' },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#fff', marginBottom: 10,},
    subtitle: { fontSize: 16, textAlign: 'center', color: '#ccc', marginBottom: 30, },
    tabs: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20,},
    tab: { fontSize: 18, color: '#ccc', paddingBottom: 10,},
    activeTab: { color: '#fff', borderBottomWidth: 2, borderBottomColor: '#fff', },
    input: { backgroundColor: '#444', color: '#fff', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 5, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#555',},
    passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#444', borderRadius: 5, borderWidth: 1, borderColor: '#555', marginBottom: 15,},
    passwordInput: { flex: 1, color: '#fff', paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, },
    eyeIcon: { padding: 10, },
    button: { backgroundColor: '#555', padding: 15, borderRadius: 5, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16,},
    errorText: { color: '#ff4d4d', textAlign: 'center', marginBottom: 10, fontWeight: 'bold', },
    forgotPassword: { textAlign: 'center', color: '#ccc', marginTop: 20, },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30, },
    divider: { flex: 1, height: 1, backgroundColor: '#555' },
    dividerText: { color: '#888', marginHorizontal: 10, },
    googleButton: { backgroundColor: '#fff' },
    googleButtonText: { color: '#000', marginLeft: 10 },
});

export default Login;
