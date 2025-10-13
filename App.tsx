import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';

function MainApp() {
  return (
    <View style={styles.container}>
      <Text>Welcome to Fitiva!</Text>
      <Text>Mobile-first fitness app for seniors</Text>
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});