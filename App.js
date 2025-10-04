import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import WorkoutScreen from './screens/WorkoutScreen';
import FormCheckScreen from './screens/FormCheckScreen';
import ProgressScreen from './screens/ProgressScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#1a1a1a',
              borderTopWidth: 0,
              elevation: 0,
              height: 80,
              paddingBottom: 20,
              paddingTop: 15,
              borderTopColor: '#333',
              borderTopWidth: 1,
            },
            tabBarActiveTintColor: '#ff4757',
            tabBarInactiveTintColor: '#888',
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
              marginTop: 5,
            },
          }}
        >
          <Tab.Screen
            name="Coach"
            component={WorkoutScreen}
            options={{
              tabBarLabel: 'COACH',
              tabBarIcon: ({ focused }) => (
                <Text style={{ fontSize: 16, color: focused ? '#ff4757' : '#888' }}>💬</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Form"
            component={FormCheckScreen}
            options={{
              tabBarLabel: 'FORM CHECK',
              tabBarIcon: ({ focused }) => (
                <Text style={{ fontSize: 16, color: focused ? '#ff4757' : '#888' }}>📹</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Progress"
            component={ProgressScreen}
            options={{
              tabBarLabel: 'PROGRESS',
              tabBarIcon: ({ focused }) => (
                <Text style={{ fontSize: 16, color: focused ? '#ff4757' : '#888' }}>📈</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: 'PROFILE',
              tabBarIcon: ({ focused }) => (
                <Text style={{ fontSize: 16, color: focused ? '#ff4757' : '#888' }}>👤</Text>
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
