import { Redirect } from 'expo-router';
import React from 'react';

const StartPage = () => {
  // This component will never be seen by the user.
  // The root _layout.tsx will immediately redirect them based on their auth state.
  // We can redirect to a sensible default like 'home', and the gatekeeper will
  // intercept and send them to the correct screen (e.g., '/login' if not authenticated).
  return <Redirect href="/(app)/home" />;
};

export default StartPage;
