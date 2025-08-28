import { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { Link } from 'expo-router';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    setError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError('Please enter your email address.');
      return false;
    }
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handlePasswordReset = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Check Your Email",
        "If an account exists for this email, a password reset link has been sent."
      );
    } catch (err: any) {
      // For security, we don't want to confirm if an email is registered or not.
      // The generic success message in the Alert handles all cases for the user.
      // We can log the actual error for debugging purposes if needed.
      console.log("Password reset attempt finished. Error if any:", err.code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your email to receive a password reset link.</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="user@example.com"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TouchableOpacity onPress={handlePasswordReset} style={styles.button} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>SEND RESET LINK</Text>
        )}
      </TouchableOpacity>

      <Link href="/(auth)/login" asChild>
        <TouchableOpacity>
            <Text style={styles.backToLogin}>Back to Login</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#333'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#fff',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#ccc',
        marginBottom: 30,
    },
    input: {
        backgroundColor: '#444',
        color: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 5,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#555',
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
        marginBottom: 10,
        fontWeight: 'bold',
    },
    backToLogin: {
        textAlign: 'center',
        color: '#ccc',
        marginTop: 20,
    },
});

export default ForgotPassword;
