import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  birth_date: string;
  gender: string;
  nationality: string;
  district: string;
  municipality: string;
  parish: string;
  marital_status: string;
  religion: string;
  education_level: string;
  profession: string;
  lived_abroad: boolean;
  abroad_duration: string;
  email_notifications: boolean;
  created_at: string;
}

export default function AdminUsersScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const downloadCSV = () => {
    if (users.length === 0) {
      if (Platform.OS === 'web') {
        alert('Não há utilizadores para exportar');
      } else {
        Alert.alert('Aviso', 'Não há utilizadores para exportar');
      }
      return;
    }

    // Create CSV content
    const headers = [
      'Nome',
      'Email',
      'Telemóvel',
      'Data Nascimento',
      'Género',
      'Nacionalidade',
      'Distrito',
      'Concelho',
      'Freguesia',
      'Estado Civil',
      'Religião',
      'Escolaridade',
      'Profissão',
      'Viveu no Estrangeiro',
      'Duração Estrangeiro',
      'Aceita Notificações',
      'Data Registo'
    ];

    const csvRows = [headers.join(';')];

    users.forEach(u => {
      const row = [
        u.name || '',
        u.email || '',
        u.phone || '',
        u.birth_date || '',
        u.gender || '',
        u.nationality || '',
        u.district || '',
        u.municipality || '',
        u.parish || '',
        u.marital_status || '',
        u.religion || '',
        u.education_level || '',
        u.profession || '',
        u.lived_abroad ? 'Sim' : 'Não',
        u.abroad_duration || '',
        u.email_notifications ? 'Sim' : 'Não',
        u.created_at ? new Date(u.created_at).toLocaleDateString('pt-PT') : ''
      ];
      csvRows.push(row.map(field => `"${field}"`).join(';'));
    });

    const csvContent = csvRows.join('\n');

    if (Platform.OS === 'web') {
      // Create and download file
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `utilizadores_impar_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      Alert.alert('Aviso', 'O download de CSV está disponível apenas na versão web');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const toggleExpand = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  // Check if current user is owner
  if (user?.role !== 'owner') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Acesso Negado</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="lock-closed" size={64} color="#d1d5db" />
          <Text style={styles.errorText}>Apenas o administrador pode aceder a esta página.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Utilizadores</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Utilizadores Registados</Text>
        <TouchableOpacity onPress={downloadCSV} style={styles.downloadButton}>
          <Ionicons name="download-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.scrollContentDesktop
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Download CSV Button */}
        <TouchableOpacity style={styles.downloadCSVButton} onPress={downloadCSV}>
          <Ionicons name="download-outline" size={20} color={Colors.primary} />
          <Text style={styles.downloadCSVText}>Exportar para CSV</Text>
        </TouchableOpacity>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Ionicons name="people" size={32} color={Colors.primary} />
            <Text style={styles.summaryNumber}>{users.length}</Text>
            <Text style={styles.summaryLabel}>Total de Utilizadores</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="mail" size={32} color="#10b981" />
            <Text style={styles.summaryNumber}>
              {users.filter(u => u.email_notifications).length}
            </Text>
            <Text style={styles.summaryLabel}>Aceitam Notificações</Text>
          </View>
        </View>

        {/* Users List */}
        {users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Ainda não há utilizadores registados.</Text>
          </View>
        ) : (
          users.map((user) => (
            <TouchableOpacity 
              key={user.id} 
              style={styles.userCard}
              onPress={() => toggleExpand(user.id)}
              activeOpacity={0.7}
            >
              <View style={styles.userHeader}>
                <View style={styles.userAvatar}>
                  <Ionicons name="person" size={24} color={Colors.primary} />
                </View>
                <View style={styles.userBasicInfo}>
                  <Text style={styles.userName}>{user.name || 'Sem nome'}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  {user.phone && (
                    <Text style={styles.userPhone}>{user.phone}</Text>
                  )}
                </View>
                <View style={styles.userBadges}>
                  {user.email_notifications && (
                    <View style={styles.notificationBadge}>
                      <Ionicons name="mail" size={14} color="#10b981" />
                    </View>
                  )}
                  <Ionicons 
                    name={expandedUser === user.id ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#6b7280" 
                  />
                </View>
              </View>

              {expandedUser === user.id && (
                <View style={styles.userDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Data de Nascimento:</Text>
                    <Text style={styles.detailValue}>{user.birth_date || '-'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Género:</Text>
                    <Text style={styles.detailValue}>{user.gender || '-'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Nacionalidade:</Text>
                    <Text style={styles.detailValue}>{user.nationality || '-'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Localização:</Text>
                    <Text style={styles.detailValue}>
                      {user.parish ? `${user.parish}, ${user.municipality}, ${user.district}` : '-'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Estado Civil:</Text>
                    <Text style={styles.detailValue}>{user.marital_status || '-'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Religião:</Text>
                    <Text style={styles.detailValue}>{user.religion || '-'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Escolaridade:</Text>
                    <Text style={styles.detailValue}>{user.education_level || '-'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Profissão:</Text>
                    <Text style={styles.detailValue}>{user.profession || '-'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Viveu no Estrangeiro:</Text>
                    <Text style={styles.detailValue}>
                      {user.lived_abroad ? `Sim (${user.abroad_duration || 'duração não especificada'})` : 'Não'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Aceita Notificações:</Text>
                    <Text style={[styles.detailValue, user.email_notifications && styles.detailValueGreen]}>
                      {user.email_notifications ? 'Sim' : 'Não'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Registado em:</Text>
                    <Text style={styles.detailValue}>{formatDate(user.created_at)}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.heading.bold,
    color: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: Fonts.body.regular,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
  },
  scrollContent: {
    padding: 16,
  },
  scrollContentDesktop: {
    padding: 32,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 32,
    fontFamily: Fonts.heading.bold,
    color: Colors.primary,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.body.regular,
    color: '#6b7280',
    marginTop: 16,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    overflow: 'hidden',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userBasicInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: Fonts.heading.semiBold,
    color: '#111827',
  },
  userEmail: {
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: '#6b7280',
    marginTop: 2,
  },
  userPhone: {
    fontSize: 13,
    fontFamily: Fonts.body.regular,
    color: '#9ca3af',
    marginTop: 2,
  },
  userBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBadge: {
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    padding: 6,
    marginRight: 8,
  },
  userDetails: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: Fonts.body.regular,
    color: '#6b7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: Fonts.body.semiBold,
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  detailValueGreen: {
    color: '#10b981',
  },
});
