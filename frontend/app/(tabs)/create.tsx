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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Question {
  type: string;
  text: string;
  options?: string[];
  max_rating?: number;
}

const QUESTION_TYPES = [
  { id: 'multiple_choice_single', label: 'Multiple Choice (Single)', icon: 'radio-button-on' },
  { id: 'multiple_choice_multiple', label: 'Multiple Choice (Multiple)', icon: 'checkbox' },
  { id: 'text_short', label: 'Short Text', icon: 'text' },
  { id: 'text_long', label: 'Long Text', icon: 'document-text' },
  { id: 'rating', label: 'Rating (1-5)', icon: 'star' },
];

export default function CreateSurveyScreen() {
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
      Alert.alert('Error', 'Please enter a survey title');
      return;
    }

    if (questions.length === 0) {
      Alert.alert('Error', 'Please add at least one question');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        Alert.alert('Error', `Question ${i + 1} text is required`);
        return;
      }

      if (q.type.includes('multiple_choice')) {
        if (!q.options || q.options.length < 2) {
          Alert.alert('Error', `Question ${i + 1} must have at least 2 options`);
          return;
        }
        const validOptions = q.options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
          Alert.alert('Error', `Question ${i + 1} must have at least 2 non-empty options`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      await api.post('/api/surveys', {
        title,
        description,
        questions,
      });

      Alert.alert('Success', 'Survey created successfully!');
      setTitle('');
      setDescription('');
      setQuestions([]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create survey');
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.label}>Survey Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter survey title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter survey description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Questions</Text>
            {questions.map((question, qIndex) => (
              <View key={qIndex} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>Question {qIndex + 1}</Text>
                  <TouchableOpacity onPress={() => removeQuestion(qIndex)}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.questionType}>{getQuestionTypeLabel(question.type)}</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter question text"
                  value={question.text}
                  onChangeText={(text) => updateQuestion(qIndex, 'text', text)}
                  placeholderTextColor="#9ca3af"
                />

                {question.type.includes('multiple_choice') && (
                  <View style={styles.optionsContainer}>
                    <Text style={styles.optionsLabel}>Options:</Text>
                    {question.options?.map((option, oIndex) => (
                      <View key={oIndex} style={styles.optionRow}>
                        <TextInput
                          style={[styles.input, styles.optionInput]}
                          placeholder={`Option ${oIndex + 1}`}
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
                      <Ionicons name="add-circle-outline" size={20} color="#6366f1" />
                      <Text style={styles.addOptionText}>Add Option</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            <TouchableOpacity
              style={styles.addQuestionButton}
              onPress={() => setShowQuestionTypes(!showQuestionTypes)}
            >
              <Ionicons name="add-circle" size={24} color="#6366f1" />
              <Text style={styles.addQuestionText}>Add Question</Text>
            </TouchableOpacity>

            {showQuestionTypes && (
              <View style={styles.questionTypesContainer}>
                {QUESTION_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={styles.questionTypeButton}
                    onPress={() => addQuestion(type.id)}
                  >
                    <Ionicons name={type.icon as any} size={20} color="#6366f1" />
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
                <Text style={styles.submitButtonText}>Create Survey</Text>
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
    backgroundColor: '#f9fafb',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
    borderColor: '#e5e7eb',
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
    borderColor: '#e5e7eb',
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
    color: '#6366f1',
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
    color: '#6366f1',
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
    color: '#6366f1',
    marginLeft: 8,
  },
  questionTypesContainer: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  questionTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
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
    backgroundColor: '#6366f1',
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
