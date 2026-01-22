import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

interface MyResponse {
  survey_id: string;
  survey_title: string;
  submitted_at: string;
}

export default function MyAnswersScreen() {
  const [responses, setResponses] = useState<MyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const fetchMyResponses = async () => {
    try {
      const response = await api.get('/api/my-responses');
      setResponses(response.data);
    } catch (error) {
      console.error('Error fetching my responses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyResponses();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMyResponses();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyResponses();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderResponseCard = ({ item }: { item: MyResponse }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/results?id=${item.survey_id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#10b981" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.survey_title}
          </Text>
          <Text style={styles.cardDate}>
            Respondido em {formatDate(item.submitted_at)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {responses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbox-ellipses-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Sem Respostas</Text>
          <Text style={styles.emptyText}>Comece a responder inquéritos para ver as suas respostas aqui</Text>
        </View>
      ) : (
        <FlatList
          data={responses}
          renderItem={renderResponseCard}
          keyExtractor={(item) => item.survey_id}
          contentContainerStyle={[
            styles.listContent,
            isDesktop && styles.listContentDesktop
          ]}
          numColumns={1}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  listContentDesktop: {
    padding: 32,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});
