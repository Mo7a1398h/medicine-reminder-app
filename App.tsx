import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './screens/HomeScreen';
import CalendarScreen from './screens/CalendarScreen';
import StatisticsScreen from './screens/StatisticsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'الرئيسية') {
              iconName = focused ? 'medical' : 'medical-outline';
            } else if (route.name === 'التقويم') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'الإحصائيات') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="الرئيسية" component={HomeScreen} />
        <Tab.Screen name="التقويم" component={CalendarScreen} />
        <Tab.Screen name="الإحصائيات" component={StatisticsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
