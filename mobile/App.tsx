import "./global.css";

import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

import AppNavigator from "./navigation/AppNavigator";
import { initializePersistence } from "./services/persistenceService";


export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAppData() {
      try {
        await initializePersistence();

        
      } catch (error) {
        console.error("Failed to load app data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAppData();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-950">
        <ActivityIndicator
          size="large"
          color="#3B82F6"
        />

        <View className="mt-4" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}