import React, { useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Platform // 1. Import the Platform module
} from 'react-native';
import { useSession } from '../../context/AuthContext';
import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { encode } from 'base-64';

const QrCodeScreen = () => {
  const { profile } = useSession();
  const qrCodeRef = useRef<any>(null);

  const qrCodeData = useMemo(() => {
    if (!profile) return null;
    const payload = { psvId: profile.uid, plate: profile.vehicleRegistration };
    const jsonString = JSON.stringify(payload);
    const encodedData = encode(jsonString);
    return `https://naulify-commuter-web.vercel.app/pay?data=${encodedData}`;
  }, [profile]);

  // 2. The updated, cross-platform download handler
  const handleDownloadPdf = async () => {
    if (!qrCodeRef.current || !profile) {
      Alert.alert("Error", "Could not generate QR code data.");
      return;
    }

    qrCodeRef.current.toDataURL(async (data: string) => {
      const htmlContent = `
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 40px;">
            <h1 style="font-size: 24px;">Scan this code to pay fare for:</h1>
            <h2 style="font-size: 32px; margin: 20px 0;">${profile.vehicleRegistration}</h2>
            <img src="data:image/svg+xml;base64,${data}" width="80%" height="auto" style="max-width: 400px;"/>
            <p style="margin-top: 40px; font-size: 16px;">A printed copy should be clearly displayed inside your vehicle.</p>
          </body>
        </html>
      `;

      try {
        if (Platform.OS === 'web') {
          // On web, open the browser's print dialog.
          await Print.printAsync({ html: htmlContent });
        } else {
          // On native (Android), create a file and use the share dialog.
          const { uri } = await Print.printToFileAsync({ html: htmlContent });
          if (!(await Sharing.isAvailableAsync())) {
            Alert.alert("Sharing not available", "Sharing is not available on this device.");
            return;
          }
          await Sharing.shareAsync(uri);
        }
      } catch (error) {
        console.error("Error with PDF generation:", error);
        Alert.alert("Error", "An error occurred while preparing the document.");
      }
    });
  };

  // The rest of the component (loading state, JSX, styles) remains unchanged.
  if (!profile || !qrCodeData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#ccc', marginTop: 10 }}>Generating Code...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.scanText}>Scan this code to pay fare for:</Text>
        <Text style={styles.plateText}>{profile.vehicleRegistration}</Text>
        
        <View style={styles.qrContainer}>
          <QRCode
            value={qrCodeData}
            size={250}
            backgroundColor="#fff"
            color="#000"
            getRef={qrCodeRef}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadPdf}>
        <Ionicons name="download-outline" size={24} color="#fff" />
        <Text style={styles.buttonText}>DOWNLOAD AS PDF</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        A printed copy should be clearly displayed inside your vehicle.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
    alignItems: 'center',
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#444',
    borderRadius: 8,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  scanText: {
    fontSize: 16,
    color: '#ccc',
  },
  plateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
  },
  qrContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 5,
    marginTop: 20,
  },
  downloadButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default QrCodeScreen;
