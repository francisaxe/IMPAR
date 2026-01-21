import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, useWindowDimensions, Modal, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';

export default function TopNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Breakpoint para mobile: 768px
  const isMobile = width < 768;

  const menuItems = [
    { name: 'Início', path: '/(tabs)/home', icon: 'home-outline' as const },
    { name: 'Sondagens', path: '/(tabs)/surveys', icon: 'list-outline' as const },
    { name: 'Respostas', path: '/(tabs)/my-answers', icon: 'checkmark-circle-outline' as const },
    { 
      name: isOwner ? 'Criar' : 'Sugerir', 
      path: isOwner ? '/(tabs)/create' : '/(tabs)/suggest', 
      icon: isOwner ? 'add-circle-outline' as const : 'bulb-outline' as const 
    },
    { name: 'Sobre', path: '/(tabs)/sobre', icon: 'information-circle-outline' as const },
    { name: 'Perfil', path: '/(tabs)/profile', icon: 'person-outline' as const },
  ];

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path);
  };

  const navigateTo = (path: string) => {
    router.push(path as any);
    setMenuOpen(false);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.content, isMobile && styles.contentMobile]}>
        {/* Logo */}
        <TouchableOpacity 
          style={styles.logoContainer}
          onPress={() => navigateTo('/(tabs)/home')}
        >
          <Image 
            source={require('../assets/impar-logo.png')} 
            style={[styles.logoImage, isMobile && styles.logoImageMobile]}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Desktop Menu */}
        {!isMobile && (
          <View style={styles.menu}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.path}
                style={[
                  styles.menuItem,
                  isActive(item.path) && styles.menuItemActive
                ]}
                onPress={() => navigateTo(item.path)}
              >
                <Ionicons 
                  name={isActive(item.path) ? item.icon.replace('-outline', '') as any : item.icon} 
                  size={18} 
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
        )}

        {/* Mobile Hamburger Button */}
        {isMobile && (
          <TouchableOpacity 
            style={styles.hamburger}
            onPress={() => setMenuOpen(true)}
          >
            <Ionicons name="menu" size={28} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Mobile Menu Modal */}
      <Modal
        visible={menuOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuOpen(false)}>
          <View style={styles.mobileMenuContainer}>
            {/* Header do menu mobile */}
            <View style={styles.mobileMenuHeader}>
              <Image 
                source={require('../../assets/impar-logo.png')} 
                style={styles.logoImageMobile}
                resizeMode="contain"
              />
              <TouchableOpacity onPress={() => setMenuOpen(false)}>
                <Ionicons name="close" size={28} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Items do menu mobile */}
            <View style={styles.mobileMenuItems}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.path}
                  style={[
                    styles.mobileMenuItem,
                    isActive(item.path) && styles.mobileMenuItemActive
                  ]}
                  onPress={() => navigateTo(item.path)}
                >
                  <Ionicons 
                    name={isActive(item.path) ? item.icon.replace('-outline', '') as any : item.icon} 
                    size={24} 
                    color={isActive(item.path) ? Colors.primary : Colors.textSecondary} 
                  />
                  <Text style={[
                    styles.mobileMenuText,
                    isActive(item.path) && styles.mobileMenuTextActive
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* User info no mobile menu */}
            {user && (
              <View style={styles.mobileUserInfo}>
                <Ionicons name="person-circle" size={24} color={Colors.gray400} />
                <Text style={styles.mobileUserText}>{user.email}</Text>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
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
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  contentMobile: {
    paddingHorizontal: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    height: 32,
    width: 120,
  },
  logoImageMobile: {
    height: 28,
    width: 105,
  },
  menu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  menuItemActive: {
    backgroundColor: Colors.gray100,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  menuTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  hamburger: {
    padding: 8,
  },
  // Mobile menu styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  mobileMenuContainer: {
    backgroundColor: Colors.accent,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  mobileMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  mobileMenuItems: {
    paddingVertical: 8,
  },
  mobileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 16,
  },
  mobileMenuItemActive: {
    backgroundColor: Colors.gray100,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  mobileMenuText: {
    fontSize: 17,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  mobileMenuTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  mobileUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    marginTop: 8,
  },
  mobileUserText: {
    fontSize: 14,
    color: Colors.gray400,
  },
});
