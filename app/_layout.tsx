import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#0066cc',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          backgroundColor: '#ffffff'
        }
      }}
    >
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Oturumlar',
          tabBarLabel: 'Oturumlar',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🎮</Text>
          )
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Analiz',
          tabBarLabel: 'Analiz',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>📊</Text>
          )
        }}
      />
      <Tabs.Screen
        name="players"
        options={{
          title: 'Oyuncular',
          tabBarLabel: 'Oyuncular',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>👤</Text>
          )
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}