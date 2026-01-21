import { Tabs } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/colors';
import { StyleSheet } from 'react-native';
import TopNavigation from '../../components/TopNavigation';

export default function TabLayout() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';

  return (
    <>
      <TopNavigation />
      <Tabs
        screenOptions={{
          tabBarStyle: { display: 'none' },
          headerShown: false,
        }}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="surveys" />
        <Tabs.Screen name="my-answers" />
        <Tabs.Screen 
          name="create" 
          options={{ href: isOwner ? undefined : null }}
        />
        <Tabs.Screen 
          name="suggest" 
          options={{ href: !isOwner ? undefined : null }}
        />
        <Tabs.Screen name="sobre" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({});
