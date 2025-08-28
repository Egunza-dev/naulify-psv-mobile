import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  // The 'config' object is the one from your app.json, already loaded.
  // We can now modify it and return it.
  
  // The return type is 'ExpoConfig', which gives us type-checking.
  return {
    ...config,
    android: {
      ...config.android,     
              
    }
  };
};
