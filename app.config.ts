import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  // The 'config' object is the one from your app.json, already loaded.
  // We can now modify it and return it.
  
  // The return type is 'ExpoConfig', which gives us type-checking.
  return {
    ...config,
    android: {
      ...config.android,
      
        googleSignIn: {
          // Your Firebase project's API key, loaded from your .env file
          apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
          
          // The certificate hash from './gradlew signingReport' for your standalone build
          certificateHash: "50:C9:66:86:3A:38:6E:AD:E3:14:95:62:E6:22:4A:8A:BA:23:59:E9"
        }
      
    }
  };
};
