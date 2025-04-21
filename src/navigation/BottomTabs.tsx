import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MedicineReminder } from '../screens/MedicineReminder';
import { SleepExercise } from '../screens/SleepExercise';
import { DietPlans } from '../screens/DietPlans';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

export const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="MedicineReminder"
        component={MedicineReminder}
        options={{
          title: 'الأدوية',
          tabBarIcon: ({ color }: { color: string }) => (
            <Icon name="pill" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="SleepExercise"
        component={SleepExercise}
        options={{
          title: 'النوم والرياضة',
          tabBarIcon: ({ color }: { color: string }) => (
            <Icon name="bed-clock" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="DietPlans"
        component={DietPlans}
        options={{
          title: 'الحميات',
          tabBarIcon: ({ color }: { color: string }) => (
            <Icon name="food-apple" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
