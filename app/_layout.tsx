import { Slot, useRouter, useSegments } from 'expo-router';
import { SessionProvider, useSession } from '../context/AuthContext';
import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const InitialLayout = () => {
  const { user, profile, loading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    if (user && profile) {
      if (!inAppGroup) {
        router.replace('/(app)');
      }
    } else if (user && !profile) {
      if (segments[0] !== 'onboarding') {
        router.replace('/onboarding');
      }
    } else if (!user) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    }
  }, [user, profile, loading, segments]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
};

const RootLayout = () => {
  return (
    <SessionProvider>
      <InitialLayout />
    </SessionProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333'
  }
});

export default RootLayout;
