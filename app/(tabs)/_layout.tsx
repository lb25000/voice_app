import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import HomeScreen from './index'; // Import home screen
import KeywordsScreen from './keywords'; // Import  keywords screen
import NewFormScreen from './new-form'; // Import new form screen

const Tab = createMaterialTopTabNavigator();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#454454',
          tabBarInactiveTintColor: '#abaaba',
          tabBarLabelStyle: { fontSize: 12 },
          tabBarStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            marginTop: 35,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tab.Screen
          name="Keywords"
          component={KeywordsScreen}
          options={{
            title: 'Keywords',
            tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
          }}
        />
        <Tab.Screen
          name="NewForm"
          options={{
            title: 'New Form',
            tabBarIcon: ({ color }) => <TabBarIcon name="add-circle" color={color} />,
          }}
        >
          {() => (
            <NewFormScreen
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
  );
}
