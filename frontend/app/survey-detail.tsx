import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';

interface Question {
  type: string;
  text: string;
  options?: string[];
  max_rating?: number;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  has_answered: boolean;
}

export default function SurveyDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      const response = await api.get(`/api/surveys/${id}`);
      setSurvey(response.data);
      
      if (response.data.has_answered) {
        Alert.alert(
          'Já Respondido',
          'Já respondeu a este inquérito. Ver resultados?',
          [
            { text: 'Voltar', onPress: () => router.back() },
            { text: 'Ver Resultados', onPress: () => router.replace(`/results?id=${id}`) },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar inquérito');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: any) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const handleSubmit = async () => {
    for (let i = 0; i < (survey?.questions.length || 0); i++) {
      if (answers[i] === undefined || answers[i] === '' || 
          (Array.isArray(answers[i]) && answers[i].length === 0)) {
        Alert.alert('Incompleto', `Por favor, responda à questão ${i + 1}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const formattedAnswers = Object.keys(answers).map(key => ({
        question_index: parseInt(key),
        answer: answers[parseInt(key)],
      }));

      await api.post(`/api/surveys/${id}/respond`, { answers: formattedAnswers });
      router.replace(`/results?id=${id}`);
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.detail || 'Falha ao submeter inquérito');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: Question, index: number) => {
    switch (question.type) {
      case 'multiple_choice_single':
        return (
          <View key={index} style={styles.questionCard}>
            <Text style={styles.questionNumber}>Questão {index + 1}</Text>
            <Text style={styles.questionText}>{question.text}</Text>
            {question.options?.map((option, optIndex) => (
              <TouchableOpacity
                key={optIndex}
                style={[
                  styles.optionButton,
                  answers[index] === option && styles.optionSelected,
                ]}
                onPress={() => handleAnswerChange(index, option)}
              >
                <Ionicons
                  name={answers[index] === option ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={answers[index] === option ? Colors.primary : '#9ca3af'}
                />
                <Text style={[
                  styles.optionText,
                  answers[index] === option && styles.optionTextSelected,
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'multiple_choice_multiple':
        return (
          <View key={index} style={styles.questionCard}>
            <Text style={styles.questionNumber}>Questão {index + 1}</Text>
            <Text style={styles.questionText}>{question.text}</Text>
            <Text style={styles.multipleNote}>Selecione todas as que se aplicam</Text>
            {question.options?.map((option, optIndex) => {
              const selected = Array.isArray(answers[index]) && answers[index].includes(option);
              return (
                <TouchableOpacity
                  key={optIndex}
                  style={[styles.optionButton, selected && styles.optionSelected]}
                  onPress={() => {
                    const currentAnswers = answers[index] || [];
                    if (currentAnswers.includes(option)) {
                      handleAnswerChange(index, currentAnswers.filter((a: string) => a !== option));
                    } else {
                      handleAnswerChange(index, [...currentAnswers, option]);
                    }
                  }}
                >
                  <Ionicons
                    name={selected ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={selected ? Colors.primary : '#9ca3af'}
                  />
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case 'text_short':
        return (
          <View key={index} style={styles.questionCard}>
            <Text style={styles.questionNumber}>Questão {index + 1}</Text>
            <Text style={styles.questionText}>{question.text}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Escreva a sua resposta aqui"
              value={answers[index] || ''}
              onChangeText={(text) => handleAnswerChange(index, text)}
              placeholderTextColor="#9ca3af"
            />
          </View>
        );

      case 'text_long':
        return (
          <View key={index} style={styles.questionCard}>
            <Text style={styles.questionNumber}>Questão {index + 1}</Text>
            <Text style={styles.questionText}>{question.text}</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              placeholder="Escreva a sua resposta aqui"
              value={answers[index] || ''}
              onChangeText={(text) => handleAnswerChange(index, text)}
              multiline
              numberOfLines={4}
              placeholderTextColor="#9ca3af"
            />
          </View>
        );

      case 'rating':
        return (
          <View key={index} style={styles.questionCard}>
            <Text style={styles.questionNumber}>Questão {index + 1}</Text>
            <Text style={styles.questionText}>{question.text}</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  onPress={() => handleAnswerChange(index, rating)}
                  style={styles.ratingButton}
                >
                  <Ionicons
                    name={answers[index] >= rating ? 'star' : 'star-outline'}
                    size={40}
                    color={answers[index] >= rating ? '#fbbf24' : '#d1d5db'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {answers[index] && (
              <Text style={styles.ratingText}>{answers[index]} / 5</Text>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!survey) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Responder Inquérito</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.scrollContentDesktop
        ]}>
          <View style={styles.surveyHeader}>
            <Text style={styles.surveyTitle}>{survey.title}</Text>
            {survey.description && (
              <Text style={styles.surveyDescription}>{survey.description}</Text>
            )}
          </View>

          {survey.questions.map((question, index) => renderQuestion(question, index))}

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting || survey.has_answered}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="paper-plane" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Submeter Inquérito</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
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
    maxWidth: 800,
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
    marginBottom: 8,
  },
  surveyDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  questionCard: {
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
    marginBottom: 16,
  },
  multipleNote: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: Colors.gray200,
  },
  optionSelected: {
    backgroundColor: '#eef2ff',
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  textAreaInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  ratingButton: {
    marginHorizontal: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 18,
    marginTop: 8,
    marginBottom: 32,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
});
