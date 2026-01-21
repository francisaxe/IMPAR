import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

interface Question {
  type: string;
  text: string;
  options?: string[];
  max_rating?: number;
}

const QUESTION_TYPES = [
  { id: 'multiple_choice_single', label: 'Escolha Múltipla (Uma)', icon: 'radio-button-on' },
  { id: 'multiple_choice_multiple', label: 'Escolha Múltipla (Várias)', icon: 'checkbox' },
  { id: 'text_short', label: 'Texto Curto', icon: 'text' },
  { id: 'text_long', label: 'Texto Longo', icon: 'document-text' },
  { id: 'rating', label: 'Avaliação (1-5)', icon: 'star' },
];

export default function CreateSurveyScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);

  const addQuestion = (type: string) => {
    const newQuestion: Question = {
      type,
      text: '',
      ...(type.includes('multiple_choice') && { options: ['', ''] }),
      ...(type === 'rating' && { max_rating: 5 }),
    };
    setQuestions([...questions, newQuestion]);
    setShowQuestionTypes(false);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].options) {
      updated[questionIndex].options!.push('');
      setQuestions(updated);
    }
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    if (updated[questionIndex].options) {
      updated[questionIndex].options![optionIndex] = value;
      setQuestions(updated);
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].options && updated[questionIndex].options!.length > 2) {
      updated[questionIndex].options!.splice(optionIndex, 1);
      setQuestions(updated);
    }
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'Por favor, insira um título para o inquérito');
      return;
    }

    if (questions.length === 0) {
      Alert.alert('Erro', 'Por favor, adicione pelo menos uma questão');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        Alert.alert('Erro', `O texto da questão ${i + 1} é obrigatório`);
        return;
      }

      if (q.type.includes('multiple_choice')) {
        if (!q.options || q.options.length < 2) {
          Alert.alert('Erro', `A questão ${i + 1} deve ter pelo menos 2 opções`);
          return;
        }
        const validOptions = q.options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
          Alert.alert('Erro', `A questão ${i + 1} deve ter pelo menos 2 opções preenchidas`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      await api.post('/api/surveys', { title, description, questions });
      setTitle('');
      setDescription('');
      setQuestions([]);
      
      if (Platform.OS === 'web') {
        alert('Inquérito criado com sucesso!');
      } else {
        Alert.alert('Sucesso', 'Inquérito criado com sucesso!');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Falha ao criar inquérito';
      if (Platform.OS === 'web') {
        alert('Erro: ' + errorMsg);
      } else {
        Alert.alert('Erro', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    return QUESTION_TYPES.find(t => t.id === type)?.label || type;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.scrollContentDesktop
        ]}>
          <TouchableOpacity
            style={styles.viewSuggestionsButton}
            onPress={() => router.push('/view-suggestions')}
          >
            <Ionicons name="bulb" size={20} color="#f59e0b" />
            <Text style={styles.viewSuggestionsText}>Ver Sugestões de Utilizadores</Text>
            <Ionicons name="chevron-forward" size={20} color="#f59e0b" />
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.label}>Título do Inquérito *</Text>
            <TextInput
              style={styles.input}
              placeholder="Insira o título do inquérito"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Insira a descrição do inquérito"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Questões</Text>
            {questions.map((question, qIndex) => (
              <View key={qIndex} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>Questão {qIndex + 1}</Text>
                  <TouchableOpacity onPress={() => removeQuestion(qIndex)}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.questionType}>{getQuestionTypeLabel(question.type)}</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Insira o texto da questão"
                  value={question.text}
                  onChangeText={(text) => updateQuestion(qIndex, 'text', text)}
                  placeholderTextColor="#9ca3af"
                />

                {question.type.includes('multiple_choice') && (
                  <View style={styles.optionsContainer}>
                    <Text style={styles.optionsLabel}>Opções:</Text>
                    {question.options?.map((option, oIndex) => (
                      <View key={oIndex} style={styles.optionRow}>
                        <TextInput
                          style={[styles.input, styles.optionInput]}
                          placeholder={`Opção ${oIndex + 1}`}
                          value={option}
                          onChangeText={(text) => updateOption(qIndex, oIndex, text)}
                          placeholderTextColor="#9ca3af"
                        />
                        {question.options!.length > 2 && (
                          <TouchableOpacity onPress={() => removeOption(qIndex, oIndex)}>
                            <Ionicons name="close-circle" size={24} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                    <TouchableOpacity
                      style={styles.addOptionButton}
                      onPress={() => addOption(qIndex)}
                    >
                      <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                      <Text style={styles.addOptionText}>Adicionar Opção</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            <TouchableOpacity
              style={styles.addQuestionButton}
              onPress={() => setShowQuestionTypes(!showQuestionTypes)}
            >
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
              <Text style={styles.addQuestionText}>Adicionar Questão</Text>
            </TouchableOpacity>

            {showQuestionTypes && (
              <View style={[styles.questionTypesContainer, isDesktop && styles.questionTypesDesktop]}>
                {QUESTION_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={styles.questionTypeButton}
                    onPress={() => addQuestion(type.id)}
                  >
                    <Ionicons name={type.icon as any} size={20} color={Colors.primary} />
                    <Text style={styles.questionTypeText}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.submitButtonText}>Criar Inquérito</Text>
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
  keyboardView: {
    flex: 1,
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
  viewSuggestionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  viewSuggestionsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
    marginLeft: 8,
    marginRight: 8,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  questionType: {
    fontSize: 12,
    color: Colors.primary,
    marginBottom: 12,
    fontWeight: '600',
  },
  optionsContainer: {
    marginTop: 12,
  },
  optionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    marginRight: 8,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  addOptionText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#c7d2fe',
    borderStyle: 'dashed',
  },
  addQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  questionTypesContainer: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  questionTypesDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  questionTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: Colors.gray50,
  },
  questionTypeText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
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
