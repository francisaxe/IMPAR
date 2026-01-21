import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, useWindowDimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (confirm('Tem a certeza que deseja sair?')) {
        await logout();
        router.replace('/login');
      }
    } else {
      Alert.alert(
        'Sair',
        'Tem a certeza que deseja sair?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: async () => {
              await logout();
              router.replace('/login');
            },
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={[
        styles.content,
        isDesktop && styles.contentDesktop
      ]}>
        <View style={[styles.profileHeader, isDesktop && styles.profileHeaderDesktop]}>
          <View style={[styles.avatarContainer, isDesktop && styles.avatarContainerDesktop]}>
            <Ionicons name="person" size={isDesktop ? 64 : 48} color={Colors.primary} />
          </View>
          <Text style={[styles.name, isDesktop && styles.nameDesktop]}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.role === 'owner' && (
            <View style={styles.ownerBadge}>
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text style={styles.ownerText}>Administrador de Inquéritos</Text>
            </View>
          )}
        </View>

        <View style={[styles.infoSection, isDesktop && styles.infoSectionDesktop]}>
          <View style={styles.infoCard}>
            <Ionicons name="mail-outline" size={24} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#10b981" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tipo de Conta</Text>
              <Text style={styles.infoValue}>
                {user?.role === 'owner' ? 'Administrador' : 'Participante'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.logoutButton, isDesktop && styles.logoutButtonDesktop]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={styles.logoutText}>Terminar Sessão</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  content: {
    padding: 16,
  },
  contentDesktop: {
    padding: 32,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  profileHeaderDesktop: {
    padding: 48,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainerDesktop: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  nameDesktop: {
    fontSize: 28,
  },
  email: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  ownerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    marginLeft: 6,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoSectionDesktop: {
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutButtonDesktop: {
    maxWidth: 300,
    alignSelf: 'center',
    width: '100%',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 8,
  },
});
