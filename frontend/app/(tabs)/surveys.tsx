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
  Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Fonts } from '../../constants/colors';
import { isDesktop, getMaxContentWidth } from '../../utils/responsive';

const { width } = Dimensions.get('window');

interface Survey {
  id: string;
  title: string;
  description: string;
  created_at: string;
  end_date: string | null;
  is_closed: boolean;
  response_count: number;
  has_answered: boolean;
  featured: boolean;
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

  const handleToggleFeature = async (surveyId: string, currentFeatured: boolean) => {
    try {
      await api.put(`/api/surveys/${surveyId}/feature`);
      fetchSurveys();
      
      const message = currentFeatured 
        ? 'Destaque removido com sucesso' 
        : 'Sondagem destacada com sucesso';
      
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Sucesso', message);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Erro ao atualizar destaque';
      if (Platform.OS === 'web') {
        alert('Erro: ' + errorMsg);
      } else {
        Alert.alert('Erro', errorMsg);
      }
    }
  };

  const renderSurveyCard = ({ item }: { item: Survey }) => (
    <View style={[styles.card, item.is_closed && styles.cardClosed]}>
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={() => item.is_closed ? router.push(`/results?id=${item.id}`) : router.push(`/survey-detail?id=${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, item.is_closed && styles.iconContainerClosed]}>
            <Ionicons name={item.is_closed ? "lock-closed" : "clipboard-outline"} size={24} color={item.is_closed ? "#9ca3af" : "#1e3a5f"} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, item.is_closed && styles.cardTitleClosed]} numberOfLines={2}>
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
              {item.response_count} {item.response_count === 1 ? 'resposta' : 'respostas'}
            </Text>
          </View>
          
          {item.is_closed ? (
            <View style={styles.closedBadge}>
              <Ionicons name="lock-closed" size={16} color="#ef4444" />
              <Text style={styles.closedText}>Encerrada</Text>
            </View>
          ) : item.has_answered ? (
            <View style={styles.answeredBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.answeredText}>Respondida</Text>
            </View>
          ) : (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>Participar</Text>
              <Ionicons name="chevron-forward" size={16} color="#1e3a5f" />
            </View>
          )}
        </View>
        
        <View style={styles.cardDates}>
          <Text style={styles.cardDate}>Criada: {formatDate(item.created_at)}</Text>
          {item.end_date && (
            <Text style={[styles.cardDate, item.is_closed && styles.cardDateClosed]}>
              {item.is_closed ? 'Encerrou' : 'Termina'}: {formatDate(item.end_date)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1e3a5f" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {surveys.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="clipboard-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Sem Inquéritos</Text>
          <Text style={styles.emptyText}>Volte mais tarde para novos inquéritos</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <FlatList
            data={surveys}
            renderItem={renderSurveyCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            key={isDesktop ? 'desktop' : 'mobile'}
            numColumns={isDesktop ? 2 : 1}
            columnWrapperStyle={isDesktop ? styles.columnWrapper : undefined}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
            }
          />
        </View>
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
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  listContent: {
    padding: isDesktop ? 32 : 16,
    maxWidth: getMaxContentWidth(),
    width: '100%',
    alignSelf: 'center',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    width: isDesktop ? '48%' : '100%',
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
    fontFamily: Fonts.heading.bold,
    color: '#111827',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: Fonts.body.regular,
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
    fontFamily: Fonts.body.regular,
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
    fontFamily: Fonts.body.semiBold,
    color: '#10b981',
    marginLeft: 4,
  },
  closedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  closedText: {
    fontSize: 12,
    fontFamily: Fonts.body.semiBold,
    color: '#ef4444',
    marginLeft: 4,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingText: {
    fontSize: 14,
    fontFamily: Fonts.body.semiBold,
    color: '#1e3a5f',
    marginRight: 4,
  },
  cardDates: {
    marginTop: 8,
  },
  cardDate: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: '#9ca3af',
  },
  cardDateClosed: {
    color: '#ef4444',
  },
  cardClosed: {
    opacity: 0.8,
    borderColor: '#e5e7eb',
  },
  iconContainerClosed: {
    backgroundColor: '#f3f4f6',
  },
  cardTitleClosed: {
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
    fontFamily: Fonts.heading.bold,
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.body.regular,
    color: '#6b7280',
    textAlign: 'center',
  },
});
