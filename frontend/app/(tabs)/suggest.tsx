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

  const handleSubmit = async () => {
    if (!questionText.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter a question');
      } else {
        Alert.alert('Error', 'Please enter a question');
      }
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/suggestions', {
        question_text: questionText,
        category: category.trim() || null,
        notes: notes.trim() || null,
      });

      // Clear form
      setQuestionText('');
      setCategory('');
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
            <View style={styles.section}>
              <Text style={styles.label}>
                Question Text <Text style={styles.required}>*</Text>
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
            <Ionicons name="information-circle" size={24} color="#6366f1" />
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
