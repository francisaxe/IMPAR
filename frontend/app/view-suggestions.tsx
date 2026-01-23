import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../constants/colors';

interface Suggestion {
  id: string;
  user_name: string;
  category: string | null;
  question_type: string | null;
  question_text: string;
  options: string[] | null;
  notes: string | null;
  created_at: string;
  status: string;
}

export default function ViewSuggestionsScreen() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/api/suggestions');
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSuggestions();
  };

  const handleDeleteSuggestion = async (suggestionId: string) => {
    const confirmDelete = Platform.OS === 'web'
      ? confirm('Tem a certeza que quer apagar esta sugestão?')
      : await new Promise((resolve) => {
          Alert.alert(
            'Apagar Sugestão',
            'Tem a certeza que quer apagar esta sugestão?',
            [
              { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Apagar', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        });

    if (!confirmDelete) return;

    try {
      await api.delete(`/api/suggestions/${suggestionId}`);
      fetchSuggestions();
      
      if (Platform.OS === 'web') {
        alert('Sugestão apagada com sucesso');
      } else {
        Alert.alert('Sucesso', 'Sugestão apagada com sucesso');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Erro ao apagar sugestão';
      if (Platform.OS === 'web') {
        alert('Erro: ' + errorMsg);
      } else {
        Alert.alert('Erro', errorMsg);
      }
    }
  };

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

  const getQuestionTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'multiple_choice_single': 'Escolha Múltipla (Uma)',
      'multiple_choice_multiple': 'Escolha Múltipla (Várias)',
      'text_short': 'Texto Curto',
      'text_long': 'Texto Longo',
      'rating': 'Avaliação (1-5)',
    };
    return types[type] || type;
  };

  const renderSuggestion = ({ item }: { item: Suggestion }) => (
    <View style={[styles.card, isDesktop && styles.cardDesktop]}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="bulb" size={24} color="#f59e0b" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user_name}</Text>
          <Text style={styles.date}>{formatDate(item.created_at)}</Text>
        </View>
      </View>

      <View style={styles.badgesContainer}>
        {item.category && (
          <View style={styles.categoryBadge}>
            <Ionicons name="pricetag" size={14} color={Colors.primary} />
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}
        {item.question_type && (
          <View style={styles.typeBadge}>
            <Ionicons name="help-circle" size={14} color="#10b981" />
            <Text style={styles.typeText}>{getQuestionTypeLabel(item.question_type)}</Text>
          </View>
        )}
      </View>

      <Text style={styles.questionText}>{item.question_text}</Text>

      {item.options && item.options.length > 0 && (
        <View style={styles.optionsContainer}>
          <Text style={styles.optionsLabel}>Opções Sugeridas:</Text>
          {item.options.map((option, index) => (
            <View key={index} style={styles.optionItem}>
              <Ionicons name="ellipse" size={6} color="#6b7280" />
              <Text style={styles.optionText}>{option}</Text>
            </View>
          ))}
        </View>
      )}

      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notas:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
    </View>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sugestões de Utilizadores</Text>
        <View style={{ width: 40 }} />
      </View>

      {suggestions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bulb-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Sem Sugestões</Text>
          <Text style={styles.emptyText}>
            As sugestões dos utilizadores aparecerão aqui quando forem submetidas
          </Text>
        </View>
      ) : (
        <FlatList
          data={suggestions}
          renderItem={renderSuggestion}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            isDesktop && styles.listContentDesktop
          ]}
          key={isDesktop ? 'desktop' : 'mobile'}
          numColumns={isDesktop ? 2 : 1}
          columnWrapperStyle={isDesktop ? styles.columnWrapper : undefined}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  listContentDesktop: {
    padding: 32,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  columnWrapper: {
    justifyContent: 'space-between',
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
  },
  cardDesktop: {
    width: '48%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
    marginLeft: 4,
  },
  optionsContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  optionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingLeft: 8,
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  questionText: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
    marginBottom: 12,
  },
  notesContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
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
