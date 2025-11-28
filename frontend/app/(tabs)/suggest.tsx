import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';

const QUESTION_TYPES = [
  { id: 'multiple_choice_single', label: 'Multiple Choice (Single Answer)' },
  { id: 'multiple_choice_multiple', label: 'Multiple Choice (Multiple Answers)' },
  { id: 'text_short', label: 'Short Text' },
  { id: 'text_long', label: 'Long Text / Paragraph' },
  { id: 'rating', label: 'Rating (1-5 Stars)' },
];

export default function SuggestQuestionScreen() {
  const [category, setCategory] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);

  const handleQuestionTypeSelect = (type: string) => {
    setQuestionType(type);
    setShowQuestionTypes(false);
    // Reset options when changing type
    if (type.includes('multiple_choice')) {
      setOptions(['', '']);
    }
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const updated = options.filter((_, i) => i !== index);
      setOptions(updated);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!questionType) {
      if (Platform.OS === 'web') {
        alert('Please select a question type');
      } else {
        Alert.alert('Error', 'Please select a question type');
      }
      return;
    }

    if (!questionText.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter the question text');
      } else {
        Alert.alert('Error', 'Please enter the question text');
      }
      return;
    }

    // Validate options for multiple choice
    if (questionType.includes('multiple_choice')) {
      const validOptions = options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        if (Platform.OS === 'web') {
          alert('Please provide at least 2 answer options');
        } else {
          Alert.alert('Error', 'Please provide at least 2 answer options');
        }
        return;
      }
    }

    setLoading(true);
    try {
      const payload: any = {
        category: category.trim() || null,
        question_type: questionType,
        question_text: questionText.trim(),
        notes: notes.trim() || null,
      };

      // Only include options for multiple choice questions
      if (questionType.includes('multiple_choice')) {
        payload.options = options.filter(opt => opt.trim());
      }

      await api.post('/api/suggestions', payload);

      // Clear form
      setCategory('');
      setQuestionType('');
      setQuestionText('');
      setOptions(['', '']);
      setNotes('');

      if (Platform.OS === 'web') {
        alert('Question suggestion submitted successfully! Thank you for your input.');
      } else {
        Alert.alert('Success', 'Question suggestion submitted successfully! Thank you for your input.');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to submit suggestion';
      if (Platform.OS === 'web') {
        alert('Error: ' + errorMsg);
      } else {
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="bulb" size={48} color="#f59e0b" />
            </View>
            <Text style={styles.title}>Suggest a Question</Text>
            <Text style={styles.subtitle}>
              Have an idea for a great survey question? Share it with us!
            </Text>
          </View>

          <View style={styles.form}>
            {/* 1. Category (Optional) */}
            <View style={styles.section}>
              <Text style={styles.label}>Category (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Customer Service, Product Feedback, etc."
                value={category}
                onChangeText={setCategory}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* 2. Question Type (Mandatory) */}
            <View style={styles.section}>
              <Text style={styles.label}>
                Question Type <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.input, styles.typeSelector]}
                onPress={() => setShowQuestionTypes(!showQuestionTypes)}
              >
                <Text style={questionType ? styles.typeSelectorText : styles.typeSelectorPlaceholder}>
                  {questionType
                    ? QUESTION_TYPES.find(t => t.id === questionType)?.label
                    : 'Select question type'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
              </TouchableOpacity>

              {showQuestionTypes && (
                <View style={styles.typeDropdown}>
                  {QUESTION_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={styles.typeOption}
                      onPress={() => handleQuestionTypeSelect(type.id)}
                    >
                      <Text style={styles.typeOptionText}>{type.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* 3. Question Text (Mandatory) */}
            <View style={styles.section}>
              <Text style={styles.label}>
                Question <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What question would you like to ask in a survey?"
                value={questionText}
                onChangeText={setQuestionText}
                multiline
                numberOfLines={4}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* 4. Answer Options (Conditional) */}
            {questionType && questionType.includes('multiple_choice') && (
              <View style={styles.section}>
                <Text style={styles.label}>Answer Options</Text>
                {options.map((option, index) => (
                  <View key={index} style={styles.optionRow}>
                    <TextInput
                      style={[styles.input, styles.optionInput]}
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChangeText={(text) => updateOption(index, text)}
                      placeholderTextColor="#9ca3af"
                    />
                    {options.length > 2 && (
                      <TouchableOpacity onPress={() => removeOption(index)} style={styles.removeButton}>
                        <Ionicons name="close-circle" size={24} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity style={styles.addOptionButton} onPress={addOption}>
                  <Ionicons name="add-circle-outline" size={20} color="#1e3a5f" />
                  <Text style={styles.addOptionText}>Add Option</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 5. Additional Notes (Optional) */}
            <View style={styles.section}>
              <Text style={styles.label}>Additional Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any context or explanation for your suggestion..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                placeholderTextColor="#9ca3af"
              />
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
                  <Ionicons name="paper-plane" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Submit Suggestion</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color="#1e3a5f" />
            <Text style={styles.infoText}>
              Your suggestions help us create better surveys. We review all submissions and may use your
              question in future surveys!
            </Text>
          </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
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
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeSelectorText: {
    fontSize: 16,
    color: '#111827',
  },
  typeSelectorPlaceholder: {
    fontSize: 16,
    color: '#9ca3af',
  },
  typeDropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  typeOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionInput: {
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  addOptionText: {
    fontSize: 14,
    color: '#1e3a5f',
    fontWeight: '600',
    marginLeft: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    padding: 18,
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4338ca',
    marginLeft: 12,
    lineHeight: 20,
  },
});
