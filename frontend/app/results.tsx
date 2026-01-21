import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-chart-kit';
import { Colors } from '../constants/colors';

interface QuestionResult {
  question_index: number;
  question_text: string;
  question_type: string;
  results: any;
}

interface SurveyResults {
  survey_id: string;
  title: string;
  total_responses: number;
  aggregated_results: QuestionResult[];
}

export default function ResultsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const chartWidth = isDesktop ? Math.min(width - 128, 600) : width - 64;
  const [results, setResults] = useState<SurveyResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      const response = await api.get(`/api/surveys/${id}/results`);
      setResults(response.data);
    } catch (error: any) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMultipleChoiceResults = (result: QuestionResult) => {
    const data = result.results;
    const labels = Object.keys(data);
    const values = Object.values(data) as number[];

    if (values.every(v => v === 0)) {
      return <Text style={styles.noDataText}>Sem respostas ainda</Text>;
    }

    const chartData = {
      labels: labels.map(l => l.length > 15 ? l.substring(0, 15) + '...' : l),
      datasets: [{ data: values }],
    };

    return (
      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          width={chartWidth}
          height={220}
          yAxisSuffix=""
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(30, 58, 95, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
            style: { borderRadius: 16 },
            propsForLabels: { fontSize: 12 },
          }}
          style={styles.chart}
          fromZero
        />
        <View style={styles.statsContainer}>
          {labels.map((label, idx) => (
            <View key={idx} style={styles.statRow}>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={styles.statValue}>{values[idx]} votos</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderRatingResults = (result: QuestionResult) => {
    const { average, distribution } = result.results;

    if (!distribution || Object.keys(distribution).length === 0) {
      return <Text style={styles.noDataText}>Sem respostas ainda</Text>;
    }

    const labels = ['1', '2', '3', '4', '5'];
    const values = labels.map(l => distribution[l] || 0);

    const chartData = {
      labels,
      datasets: [{ data: values }],
    };

    return (
      <View style={styles.chartContainer}>
        <View style={styles.averageContainer}>
          <Text style={styles.averageLabel}>Média de Avaliação</Text>
          <View style={styles.averageValue}>
            <Text style={styles.averageNumber}>{average.toFixed(1)}</Text>
            <Ionicons name="star" size={32} color="#fbbf24" />
          </View>
        </View>

        <BarChart
          data={chartData}
          width={chartWidth}
          height={220}
          yAxisSuffix=""
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(251, 191, 36, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
            style: { borderRadius: 16 },
          }}
          style={styles.chart}
          fromZero
        />

        <View style={styles.statsContainer}>
          {labels.map((label, idx) => (
            <View key={idx} style={styles.statRow}>
              <View style={styles.starRow}>
                {[...Array(parseInt(label))].map((_, i) => (
                  <Ionicons key={i} name="star" size={14} color="#fbbf24" />
                ))}
              </View>
              <Text style={styles.statValue}>{values[idx]} respostas</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderTextResults = (result: QuestionResult) => {
    const { count } = result.results;

    return (
      <View style={styles.textResultsContainer}>
        <View style={styles.textResultCard}>
          <Ionicons name="chatbox-ellipses" size={32} color={Colors.primary} />
          <Text style={styles.textResultCount}>{count}</Text>
          <Text style={styles.textResultLabel}>Respostas de Texto</Text>
        </View>
      </View>
    );
  };

  const renderQuestionResult = (result: QuestionResult) => {
    return (
      <View key={result.question_index} style={styles.resultCard}>
        <Text style={styles.questionNumber}>Questão {result.question_index + 1}</Text>
        <Text style={styles.questionText}>{result.question_text}</Text>

        {result.question_type === 'multiple_choice_single' && renderMultipleChoiceResults(result)}
        {result.question_type === 'multiple_choice_multiple' && renderMultipleChoiceResults(result)}
        {result.question_type === 'rating' && renderRatingResults(result)}
        {(result.question_type === 'text_short' || result.question_type === 'text_long') &&
          renderTextResults(result)}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!results) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resultados do Inquérito</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[
        styles.scrollContent,
        isDesktop && styles.scrollContentDesktop
      ]}>
        <View style={styles.surveyHeader}>
          <Text style={styles.surveyTitle}>{results.title}</Text>
          <View style={styles.responseCount}>
            <Ionicons name="people" size={24} color={Colors.primary} />
            <Text style={styles.responseCountText}>
              {results.total_responses} {results.total_responses === 1 ? 'Resposta' : 'Respostas'}
            </Text>
          </View>
        </View>

        {results.aggregated_results.map(renderQuestionResult)}
      </ScrollView>
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
  scrollContent: {
    padding: 16,
  },
  scrollContentDesktop: {
    padding: 32,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  surveyHeader: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  surveyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  responseCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    padding: 12,
    borderRadius: 12,
  },
  responseCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  statsContainer: {
    width: '100%',
    marginTop: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  averageContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    width: '100%',
  },
  averageLabel: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 8,
  },
  averageValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#92400e',
    marginRight: 8,
  },
  starRow: {
    flexDirection: 'row',
    marginRight: 8,
  },
  textResultsContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  textResultCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#eef2ff',
    borderRadius: 16,
    width: '100%',
  },
  textResultCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 12,
  },
  textResultLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  noDataText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
});
