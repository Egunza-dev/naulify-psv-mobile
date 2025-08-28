import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp,
  FieldValue,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  getDocs,     // NEW import
  where,       // NEW import
  Timestamp    // NEW import
} from "firebase/firestore";
import { db } from '../firebaseConfig';

// --- PSV PROFILE LOGIC ---

export interface PsvProfile {
  uid: string;
  ownerName: string;
  vehicleRegistration: string;
  phoneNumber: string;
  mpesaShortCode: string;
  vehicleType: 'van' | 'bus' | 'mini-bus';
  createdAt: FieldValue;
}

export type UpdatePsvProfileData = Partial<Omit<PsvProfile, 'uid' | 'createdAt'>>;

export const getPsvProfile = async (uid: string): Promise<PsvProfile | null> => {
  const profileDocRef = doc(db, 'psvs', uid);
  try {
    const docSnap = await getDoc(profileDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as PsvProfile;
    } else {
      console.log("No PSV profile found for user:", uid);
      return null;
    }
  } catch (error) {
    console.error("Error fetching PSV profile:", error);
    throw error;
  }
};

export const createPsvProfile = async (
  uid: string, 
  profileData: Omit<PsvProfile, 'uid' | 'createdAt'>
): Promise<void> => {
  const profileDocRef = doc(db, 'psvs', uid);
  const newProfile = {
    ...profileData,
    uid: uid,
    createdAt: serverTimestamp(),
  };
  try {
    await setDoc(profileDocRef, newProfile);
  } catch (error) {
    console.error("Error creating PSV profile:", error);
    throw error;
  }
};

export const updatePsvProfile = async (
  uid: string, 
  profileData: UpdatePsvProfileData
): Promise<void> => {
  const profileDocRef = doc(db, 'psvs', uid);
  try {
    await updateDoc(profileDocRef, profileData);
  } catch (error) {
    console.error("Error updating PSV profile:", error);
    throw error;
  }
};


// --- ROUTES SUBCOLLECTION LOGIC ---

export interface Route {
  id: string;
  description: string;
  fare: number;
  createdAt: FieldValue;
}

export type NewRouteData = Omit<Route, 'id' | 'createdAt'>;

export const listenToRoutes = (uid: string, onDataChange: (routes: Route[]) => void) => {
  const routesCollectionRef = collection(db, 'psvs', uid, 'routes');
  const q = query(routesCollectionRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const routes: Route[] = [];
    querySnapshot.forEach((doc) => {
      routes.push({ id: doc.id, ...doc.data() } as Route);
    });
    onDataChange(routes);
  }, (error) => {
    console.error("Error listening to routes:", error);
  });

  return unsubscribe;
};

export const addRoute = async (uid: string, routeData: NewRouteData): Promise<void> => {
  const routesCollectionRef = collection(db, 'psvs', uid, 'routes');
  await addDoc(routesCollectionRef, {
    ...routeData,
    createdAt: serverTimestamp(),
  });
};

export const updateRoute = async (uid: string, routeId: string, routeData: NewRouteData): Promise<void> => {
  const routeDocRef = doc(db, 'psvs', uid, 'routes', routeId);
  await updateDoc(routeDocRef, routeData);
};

export const deleteRoute = async (uid: string, routeId: string): Promise<void> => {
  const routeDocRef = doc(db, 'psvs', uid, 'routes', routeId);
  await deleteDoc(routeDocRef);
};


// --- NEW PAYMENTS SUBCOLLECTION LOGIC ---

/**
 * Interface representing a payment document from the psvs/{psvId}/payments subcollection.
 * Based on SDS Section 6.1.
 */
export interface Payment {
  id: string;
  amountPaid: number;
  paidAt: Timestamp; // Firestore Timestamp object
  mpesaReceiptNumber: string;
  commuterPhoneNumber: string;
  passengerCount: number;
  selections: Array<{
    description: string;
    quantity: number;
    fare: number;
  }>;
}

/**
 * Fetches payment documents for a user within a specific date range.
 * 
 * @param uid The user's unique ID.
 * @param startDate The start of the date range.
 * @param endDate The end of the date range.
 * @returns A promise that resolves with an array of payment documents.
 */
export const getPaymentsForDateRange = async (
  uid: string,
  startDate: Date,
  endDate: Date
): Promise<Payment[]> => {
  const paymentsCollectionRef = collection(db, 'psvs', uid, 'payments');
  
  // Create a query to get documents within the date range, ordered by most recent first.
  const q = query(
    paymentsCollectionRef,
    where('paidAt', '>=', startDate),
    where('paidAt', '<=', endDate),
    orderBy('paidAt', 'desc')
  );

  try {
    const querySnapshot = await getDocs(q);
    const payments: Payment[] = [];
    querySnapshot.forEach((doc) => {
      payments.push({ id: doc.id, ...doc.data() } as Payment);
    });
    return payments;
  } catch (error) {
    console.error("Error fetching payments for date range:", error);
    // Note: Firestore might require an index for this query. 
    // The error message in the console will provide a link to create it automatically.
    throw error;
  }
};
