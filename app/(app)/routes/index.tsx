import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Platform // **1. Import the Platform module**
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '../../../context/AuthContext';
import { Route, listenToRoutes, deleteRoute } from '../../../services/firestore';
import { Ionicons } from '@expo/vector-icons';

const RoutesListScreen = () => {
  const router = useRouter();
  const { user } = useSession();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenToRoutes(user.uid, (newRoutes) => {
      setRoutes(newRoutes);
      if (loading) setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const proceedWithDeletion = async (routeId: string) => {
    if (user) {
      try {
        await deleteRoute(user.uid, routeId);
      } catch (error) {
        Alert.alert("Error", "Failed to delete route. Please try again.");
      }
    }
  };

  // **2. The updated, cross-platform delete handler**
  const handleDeleteRoute = (routeId: string) => {
    const confirmationMessage = "Are you sure you want to permanently delete this fare stage?";

    if (Platform.OS === 'web') {
      // Use the browser's native confirm dialog on web
      if (window.confirm(confirmationMessage)) {
        proceedWithDeletion(routeId);
      }
    } else {
      // Use the React Native Alert API on native (Android, iOS)
      Alert.alert(
        "Delete Route",
        confirmationMessage,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete", 
            style: "destructive", 
            onPress: () => proceedWithDeletion(routeId)
          }
        ]
      );
    }
  };

  const handleAddRoute = () => {
    router.push('/(app)/routes/form');
  };

  const handleEditRoute = (item: Route) => {
    router.push({
      pathname: '/(app)/routes/form',
      params: { route: JSON.stringify(item) }
    });
  };

  // The rest of the component (RouteItem, JSX, styles) remains exactly the same.
  const RouteItem = ({ item }: { item: Route }) => (
    <TouchableOpacity 
      style={styles.itemContainer} 
      onPress={() => handleEditRoute(item)}
      onLongPress={() => handleDeleteRoute(item.id)}
    >
      <View>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <Text style={styles.itemFare}>KSH {item.fare.toFixed(2)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#888" />
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" color="#fff" />;
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={routes}
        renderItem={({ item }) => <RouteItem item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10 }}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No fare stages found.</Text>
            <Text style={styles.emptySubText}>Tap the (+) button to add your first one.</Text>
          </View>
        }
      />
      
      <TouchableOpacity style={styles.fab} onPress={handleAddRoute}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  itemContainer: {
    backgroundColor: '#444',
    padding: 20,
    marginVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemFare: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
  },
  emptyText: {
    fontSize: 18,
    color: '#ccc',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#007bff',
    borderRadius: 30,
    elevation: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default RoutesListScreen;
