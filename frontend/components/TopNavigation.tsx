import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';

export default function TopNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  
  const isWeb = Platform.OS === 'web';

  const menuItems = [
    { name: 'Início', path: '/(tabs)/home', icon: 'home' },
    { name: 'Sondagens', path: '/(tabs)/surveys', icon: 'list' },
    { name: 'Respostas', path: '/(tabs)/my-answers', icon: 'checkmark-circle' },
    { name: 'Sugerir', path: isOwner ? '/(tabs)/create' : '/(tabs)/suggest', icon: isOwner ? 'add-circle' : 'bulb' },
    { name: 'Perfil', path: '/(tabs)/profile', icon: 'person' },
  ];

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <TouchableOpacity 
          style={styles.logoContainer}
          onPress={() => router.push('/(tabs)/home')}
        >
          <Image 
            source={require('../assets/impar-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menu}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.path}
              style={[
                styles.menuItem,
                isActive(item.path) && styles.menuItemActive
              ]}
              onPress={() => router.push(item.path as any)}
            >
              <Ionicons 
                name={item.icon as any} 
                size={20} 
                color={isActive(item.path) ? Colors.primary : Colors.textSecondary} 
              />
              <Text style={[
                styles.menuText,
                isActive(item.path) && styles.menuTextActive
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.accent,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 40,
  },
  menu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  menuItemActive: {
    backgroundColor: Colors.gray100,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  menuTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
