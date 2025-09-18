import { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { signInWithEmailAndPassword, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebaseConfig';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import NaulifyLogo from './../components/Logo';

const Login = () => {
  // All your state and logic functions remain unchanged.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const validateForm = () => { /* ... no changes here ... */
    setError('');
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return false;
    }
    return true;
  };
  const handleLogin = async () => { /* ... no changes here ... */
    if (!validateForm()) return;
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoading(false); 
      handleAuthError(err);
    }
  };
  const handleGoogleSignIn = async () => { /* ... no changes here ... */
    setGoogleLoading(true);
    setError('');
    try {
      if (Platform.OS === 'web') {
        await signInWithPopup(auth, googleProvider);
      } else {
        await GoogleSignin.hasPlayServices();
        const { idToken } = await GoogleSignin.signIn();
        if (!idToken) {
          throw new Error('Google Sign-In failed to return an ID token.');
        }
        const googleCredential = googleProvider.credential(idToken);
        await signInWithCredential(auth, googleCredential);
      }
    } catch (err: any) {
      setGoogleLoading(false);
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      setError('Google Sign-In failed. Please try again.');
      console.log('Google Sign-In Error:', JSON.stringify(err, null, 2));
    }
  };
  const handleAuthError = (err: any) => { /* ... no changes here ... */
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

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <NaulifyLogo size={60} color="#fff" />
        <Text style={styles.title}>Naulify</Text>
        {/* **FIX 1: Corrected the subtitle text** */}
        <Text style={styles.subtitle}>(PSV Portal)</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tab}>
          <Text style={[styles.tabText, styles.tabTextActive]}>Login</Text>
          <View style={styles.activeTabIndicator} />
        </TouchableOpacity>
        <Link href="/(auth)/sign-up" asChild>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="user@example.com"
        placeholderTextColor="#6e6e6e"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="********"
          placeholderTextColor="#6e6e6e"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
        />
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.eyeIcon}
        >
          <Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={24} color="#888" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity onPress={handleLogin} style={styles.button} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>LOGIN</Text>}
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>
      
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        {/* **FIX 2: Corrected the divider text** */}
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.divider} />
      </View>

      <TouchableOpacity onPress={handleGoogleSignIn} style={styles.googleButton} disabled={googleLoading}>
        {googleLoading ? <ActivityIndicator color="#000" /> : (
            <>
                <Ionicons name="logo-google" size={20} color="#000" />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
        )}
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#2a2a2a',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    marginTop: 4,
    // **FIX 3: Explicitly center the text to prevent truncation**
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 12,
  },
  tabText: {
    fontSize: 16,
    color: '#a0a0a0',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  activeTabIndicator: {
    height: 2,
    width: '40%',
    backgroundColor: '#fff',
    marginTop: 12,
  },
  input: {
    backgroundColor: '#3d3d3d',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#555',
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    height: '100%',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#505050',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  forgotPassword: {
    textAlign: 'center',
    color: '#a0a0a0',
    marginTop: 20,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#555',
  },
  dividerText: {
    color: '#a0a0a0',
    marginHorizontal: 16,
    // **FIX 4: Prevent the text from being squished by the dividers**
    flexShrink: 0,
  },
  googleButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 12,
  },
  errorText: {
    color: '#ff4d4d',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
});

export default Login;
