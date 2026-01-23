import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { PORTUGAL_DATA } from '../constants/portugalData';

export default function RegisterScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [nationality, setNationality] = useState('');
  const [district, setDistrict] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [parish, setParish] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [religion, setReligion] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [profession, setProfession] = useState('');
  const [livedAbroad, setLivedAbroad] = useState('');
  const [abroadDuration, setAbroadDuration] = useState('');
  const [phone, setPhone] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [showMunicipalityPicker, setShowMunicipalityPicker] = useState(false);
  const [showParishPicker, setShowParishPicker] = useState(false);
  const [showMaritalPicker, setShowMaritalPicker] = useState(false);
  const [showAbroadPicker, setShowAbroadPicker] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const municipalities = district ? PORTUGAL_DATA.municipalities[district] || [] : [];
  const parishes = municipality ? PORTUGAL_DATA.getParishes(municipality) : [];

  const handleRegister = async () => {
    if (!name || !email || !password || !birthDate || !gender || !nationality || 
        !district || !municipality || !parish || !maritalStatus || !religion || 
        !educationLevel || !profession || !livedAbroad) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (livedAbroad === 'Sim' && !abroadDuration) {
      Alert.alert('Erro', 'Por favor, indique quanto tempo viveu no estrangeiro');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(process.env.EXPO_PUBLIC_BACKEND_URL + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          phone,
          birth_date: birthDate,
          gender,
          nationality,
          district,
          municipality,
          parish,
          marital_status: maritalStatus,
          religion,
          education_level: educationLevel,
          profession,
          lived_abroad: livedAbroad === 'Sim',
          abroad_duration: livedAbroad === 'Sim' ? abroadDuration : null,
          email_notifications: emailNotifications,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Falha no registro');
      }

      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      router.replace('/(tabs)/surveys');
    } catch (error: any) {
      Alert.alert('Falha no Registro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPicker = (
    show: boolean,
    setShow: (show: boolean) => void,
    value: string,
    setValue: (value: string) => void,
    options: string[],
    placeholder: string
  ) => (
    <>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShow(!show)}
      >
        <Text style={value ? styles.pickerText : styles.pickerPlaceholder}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={Colors.gray400} />
      </TouchableOpacity>
      {show && (
        <ScrollView style={styles.pickerContainer} nestedScrollEnabled>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.pickerOption}
              onPress={() => {
                setValue(option);
                setShow(false);
              }}
            >
              <Text style={styles.pickerOptionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.scrollContentDesktop
        ]}>
          <View style={[styles.formContainer, isDesktop && styles.formContainerDesktop]}>
            <View style={styles.header}>
              <Image 
                source={require('../assets/impar-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Criar Conta</Text>
              <Text style={styles.subtitle}>Registe-se na IMPAR</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>1. Nome Completo *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome completo"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={Colors.gray400}
                />
              </View>

              <View style={[styles.row, isDesktop && styles.rowDesktop]}>
                <View style={[styles.inputGroup, isDesktop && styles.halfWidth]}>
                  <Text style={styles.label}>Email *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={Colors.gray400}
                  />
                </View>

                <View style={[styles.inputGroup, isDesktop && styles.halfWidth]}>
                  <Text style={styles.label}>Palavra-passe *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Palavra-passe (mín 6 caracteres)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor={Colors.gray400}
                  />
                </View>
              </View>

              <View style={[styles.row, isDesktop && styles.rowDesktop]}>
                <View style={[styles.inputGroup, isDesktop && styles.halfWidth]}>
                  <Text style={styles.label}>2. Data de Nascimento *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/AAAA"
                    value={birthDate}
                    onChangeText={setBirthDate}
                    placeholderTextColor={Colors.gray400}
                  />
                </View>

                <View style={[styles.inputGroup, isDesktop && styles.halfWidth]}>
                  <Text style={styles.label}>3. Género *</Text>
                  {renderPicker(
                    showGenderPicker,
                    setShowGenderPicker,
                    gender,
                    setGender,
                    ['Masculino', 'Feminino'],
                    'Selecione o género'
                  )}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>4. Nacionalidade *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nacionalidade"
                  value={nationality}
                  onChangeText={setNationality}
                  placeholderTextColor={Colors.gray400}
                />
              </View>

              <Text style={styles.sectionTitle}>5. Onde Vive *</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Distrito *</Text>
                {renderPicker(
                  showDistrictPicker,
                  setShowDistrictPicker,
                  district,
                  (value) => {
                    setDistrict(value);
                    setMunicipality('');
                    setParish('');
                  },
                  PORTUGAL_DATA.districts,
                  'Selecione o distrito'
                )}
              </View>

              {district && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Concelho *</Text>
                  {renderPicker(
                    showMunicipalityPicker,
                    setShowMunicipalityPicker,
                    municipality,
                    (value) => {
                      setMunicipality(value);
                      setParish('');
                    },
                    municipalities,
                    'Selecione o concelho'
                  )}
                </View>
              )}

              {municipality && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Freguesia *</Text>
                  {renderPicker(
                    showParishPicker,
                    setShowParishPicker,
                    parish,
                    setParish,
                    parishes,
                    'Selecione a freguesia'
                  )}
                </View>
              )}

              <View style={[styles.row, isDesktop && styles.rowDesktop]}>
                <View style={[styles.inputGroup, isDesktop && styles.halfWidth]}>
                  <Text style={styles.label}>6. Estado Civil *</Text>
                  {renderPicker(
                    showMaritalPicker,
                    setShowMaritalPicker,
                    maritalStatus,
                    setMaritalStatus,
                    ['Solteiro', 'Casado', 'Divorciado', 'Viúvo'],
                    'Selecione o estado civil'
                  )}
                </View>

                <View style={[styles.inputGroup, isDesktop && styles.halfWidth]}>
                  <Text style={styles.label}>7. Religião *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Religião"
                    value={religion}
                    onChangeText={setReligion}
                    placeholderTextColor={Colors.gray400}
                  />
                </View>
              </View>

              <View style={[styles.row, isDesktop && styles.rowDesktop]}>
                <View style={[styles.inputGroup, isDesktop && styles.halfWidth]}>
                  <Text style={styles.label}>8. Nível de Escolaridade *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nível mais elevado completado"
                    value={educationLevel}
                    onChangeText={setEducationLevel}
                    placeholderTextColor={Colors.gray400}
                  />
                </View>

                <View style={[styles.inputGroup, isDesktop && styles.halfWidth]}>
                  <Text style={styles.label}>9. Profissão *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Profissão"
                    value={profession}
                    onChangeText={setProfession}
                    placeholderTextColor={Colors.gray400}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>10. Já viveu no estrangeiro? *</Text>
                {renderPicker(
                  showAbroadPicker,
                  setShowAbroadPicker,
                  livedAbroad,
                  setLivedAbroad,
                  ['Sim', 'Não'],
                  'Selecione'
                )}
              </View>

              {livedAbroad === 'Sim' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>10.2. Quanto tempo? *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: 2 anos, 6 meses"
                    value={abroadDuration}
                    onChangeText={setAbroadDuration}
                    placeholderTextColor={Colors.gray400}
                  />
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Registar</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Já tem conta? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={styles.link}>Entrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
    flexGrow: 1,
    padding: 24,
  },
  scrollContentDesktop: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  formContainer: {
    width: '100%',
  },
  formContainerDesktop: {
    maxWidth: 700,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 150,
    height: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  row: {
    width: '100%',
  },
  rowDesktop: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 16,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  pickerText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: Colors.gray400,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  pickerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  pickerOptionText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  button: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  link: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
