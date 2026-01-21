import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/colors';
import { View, Image, Text, StyleSheet, Platform } from 'react-native';
import TopNavigation from '../../components/TopNavigation';

function HeaderTitle({ title }: { title: string }) {
  return (
    <View style={styles.headerContainer}>
      <Image 
        source={require('../../assets/impar-logo.png')}
        style={styles.headerLogo}
        resizeMode="contain"
      />
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

export default function TabLayout() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const isWeb = Platform.OS === 'web';

  return (
    <>
      {isWeb && <TopNavigation />}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.gray400,
          tabBarStyle: isWeb ? { display: 'none' } : {
            backgroundColor: Colors.accent,
            borderTopWidth: 1,
            borderTopColor: Colors.gray200,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          headerStyle: {
            backgroundColor: isWeb ? 'transparent' : Colors.primary,
          },
          headerShown: !isWeb,
          headerTintColor: Colors.textWhite,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
      <Tabs.Screen
        name="surveys"
        options={{
          headerTitle: () => <HeaderTitle title="Inquéritos" />,
          tabBarLabel: 'Inquéritos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-answers"
        options={{
          headerTitle: () => <HeaderTitle title="Minhas Respostas" />,
          tabBarLabel: 'Respostas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          headerTitle: () => <HeaderTitle title="Início" />,
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          headerTitle: () => <HeaderTitle title="Criar Inquérito" />,
          tabBarLabel: 'Criar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
          href: isOwner ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="suggest"
        options={{
          headerTitle: () => <HeaderTitle title="Sugerir Questão" />,
          tabBarLabel: 'Sugerir',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bulb" size={size} color={color} />
          ),
          href: !isOwner ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerTitle: () => <HeaderTitle title="Perfil" />,
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 8,
  },
  headerLogo: {
    width: 80,
    height: 32,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textWhite,
  },
});
