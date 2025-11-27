import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

interface Survey {
  id: string;
  title: string;
  description: string;
  created_at: string;
  response_count: number;
  has_answered: boolean;
}

export default function SurveysScreen() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';

  const fetchSurveys = async () => {
    try {
      const response = await api.get('/api/surveys');
      setSurveys(response.data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchSurveys();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSurveys();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDeleteSurvey = async (surveyId: string, surveyTitle: string) => {
    const confirmDelete = Platform.OS === 'web'
      ? confirm(`Are you sure you want to delete "${surveyTitle}"? This will also delete all responses.`)
      : await new Promise((resolve) => {
          Alert.alert(
            'Delete Survey',
            `Are you sure you want to delete "${surveyTitle}"? This will also delete all responses.`,
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        });

    if (!confirmDelete) return;

    try {
      await api.delete(`/api/surveys/${surveyId}`);
      // Refresh the list
      fetchSurveys();
      
      if (Platform.OS === 'web') {
        alert('Survey deleted successfully');
      } else {
        Alert.alert('Success', 'Survey deleted successfully');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to delete survey';
      if (Platform.OS === 'web') {
        alert('Error: ' + errorMsg);
      } else {
        Alert.alert('Error', errorMsg);
      }
    }
  };

  const renderSurveyCard = ({ item }: { item: Survey }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={() => router.push(`/survey-detail?id=${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="clipboard-outline" size={24} color="#6366f1" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          {isOwner && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteSurvey(item.id, item.title);
              }}
            >
              <Ionicons name="trash-outline" size={22} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.cardStats}>
            <Ionicons name="people-outline" size={16} color="#6b7280" />
            <Text style={styles.cardStatsText}>
              {item.response_count} {item.response_count === 1 ? 'response' : 'responses'}
            </Text>
          </View>
          
          {item.has_answered ? (
            <View style={styles.answeredBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.answeredText}>Answered</Text>
            </View>
          ) : (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>Take Survey</Text>
              <Ionicons name="chevron-forward" size={16} color="#6366f1" />
            </View>
          )}
        </View>
        
        <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {surveys.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="clipboard-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No Surveys Yet</Text>
          <Text style={styles.emptyText}>Check back later for new surveys</Text>
        </View>
      ) : (
        <FlatList
          data={surveys}
          renderItem={renderSurveyCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366f1']} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTouchable: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardStatsText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  answeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  answeredText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
    marginLeft: 4,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    marginRight: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
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
