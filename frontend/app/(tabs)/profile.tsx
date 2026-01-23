import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Platform, 
  useWindowDimensions, 
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../../constants/colors';
import api from '../../utils/api';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  birth_date: string;
  gender: string;
  nationality: string;
  district: string;
  municipality: string;
  parish: string;
  marital_status: string;
  religion: string;
  education_level: string;
  profession: string;
  lived_abroad: boolean;
  abroad_duration: string;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const isOwner = user?.role === 'owner';
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [saving, setSaving] = useState(false);
  
  // Modal para candidatura à equipa (para utilizadores normais)
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamMessage, setTeamMessage] = useState('');
  const [submittingApplication, setSubmittingApplication] = useState(false);
  
  // Candidaturas à equipa (para owner)
  const [teamApplications, setTeamApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  useEffect(() => {
    fetchProfile();
    if (isOwner) {
      fetchTeamApplications();
    }
  }, [isOwner]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/profile');
      setProfile(response.data);
      setEditedProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamApplications = async () => {
    setLoadingApplications(true);
    try {
      const response = await api.get('/api/admin/team-applications');
      setTeamApplications(response.data);
    } catch (error) {
      console.error('Error fetching team applications:', error);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    const confirmDelete = Platform.OS === 'web'
      ? confirm('Tem a certeza que quer apagar esta candidatura?')
      : await new Promise((resolve) => {
          Alert.alert(
            'Apagar Candidatura',
            'Tem a certeza que quer apagar esta candidatura?',
            [
              { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Apagar', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        });

    if (!confirmDelete) return;

    try {
      await api.delete(`/api/admin/team-applications/${applicationId}`);
      fetchTeamApplications();
      if (Platform.OS === 'web') {
        alert('Candidatura apagada com sucesso');
      } else {
        Alert.alert('Sucesso', 'Candidatura apagada com sucesso');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Erro ao apagar candidatura';
      if (Platform.OS === 'web') {
        alert('Erro: ' + errorMsg);
      } else {
        Alert.alert('Erro', errorMsg);
      }
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/api/profile', editedProfile);
      setProfile({ ...profile, ...editedProfile } as UserProfile);
      setEditing(false);
      if (Platform.OS === 'web') {
        alert('Perfil atualizado com sucesso!');
      } else {
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        alert('Erro ao atualizar perfil');
      } else {
        Alert.alert('Erro', 'Erro ao atualizar perfil');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitTeamApplication = async () => {
    if (!teamMessage.trim()) {
      if (Platform.OS === 'web') {
        alert('Por favor, escreva uma mensagem');
      } else {
        Alert.alert('Erro', 'Por favor, escreva uma mensagem');
      }
      return;
    }

    setSubmittingApplication(true);
    try {
      await api.post('/api/team-application', { message: teamMessage });
      setShowTeamModal(false);
      setTeamMessage('');
      if (Platform.OS === 'web') {
        alert('Candidatura enviada com sucesso! Entraremos em contacto em breve.');
      } else {
        Alert.alert('Sucesso', 'Candidatura enviada com sucesso! Entraremos em contacto em breve.');
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        alert('Erro ao enviar candidatura');
      } else {
        Alert.alert('Erro', 'Erro ao enviar candidatura');
      }
    } finally {
      setSubmittingApplication(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (confirm('Tem a certeza que deseja sair?')) {
        await logout();
        router.replace('/login');
      }
    } else {
      Alert.alert(
        'Sair',
        'Tem a certeza que deseja sair?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: async () => {
              await logout();
              router.replace('/login');
            },
          },
        ]
      );
    }
  };

  const renderInfoRow = (label: string, value: string, field: string) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {editing ? (
        <TextInput
          style={styles.infoInput}
          value={editedProfile[field as keyof UserProfile]?.toString() || ''}
          onChangeText={(text) => setEditedProfile({ ...editedProfile, [field]: text })}
          placeholderTextColor="#9ca3af"
        />
      ) : (
        <Text style={styles.infoValue}>{value || '-'}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={[
          styles.content,
          isDesktop && styles.contentDesktop
        ]}>
          {/* Header do Perfil */}
          <View style={[styles.profileHeader, isDesktop && styles.profileHeaderDesktop]}>
            <View style={[styles.avatarContainer, isDesktop && styles.avatarContainerDesktop]}>
              <Ionicons name="person" size={isDesktop ? 64 : 48} color={Colors.primary} />
            </View>
            <Text style={[styles.name, isDesktop && styles.nameDesktop]}>{profile?.name}</Text>
            <Text style={styles.email}>{profile?.email}</Text>
            {user?.role === 'owner' && (
              <View style={styles.ownerBadge}>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={styles.ownerText}>Administrador</Text>
              </View>
            )}
          </View>

          {/* Dados Pessoais */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dados Pessoais</Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => editing ? handleSaveProfile() : setEditing(true)}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <>
                    <Ionicons 
                      name={editing ? "checkmark" : "pencil"} 
                      size={18} 
                      color={Colors.primary} 
                    />
                    <Text style={styles.editButtonText}>
                      {editing ? 'Guardar' : 'Editar'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            
            {editing && (
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setEditing(false);
                  setEditedProfile(profile || {});
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            )}

            {renderInfoRow('Nome', profile?.name || '', 'name')}
            {renderInfoRow('Data de Nascimento', profile?.birth_date || '', 'birth_date')}
            {renderInfoRow('Género', profile?.gender || '', 'gender')}
            {renderInfoRow('Nacionalidade', profile?.nationality || '', 'nationality')}
            {renderInfoRow('Distrito', profile?.district || '', 'district')}
            {renderInfoRow('Concelho', profile?.municipality || '', 'municipality')}
            {renderInfoRow('Freguesia', profile?.parish || '', 'parish')}
            {renderInfoRow('Estado Civil', profile?.marital_status || '', 'marital_status')}
            {renderInfoRow('Religião', profile?.religion || '', 'religion')}
            {renderInfoRow('Nível de Escolaridade', profile?.education_level || '', 'education_level')}
            {renderInfoRow('Profissão', profile?.profession || '', 'profession')}
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Viveu no Estrangeiro</Text>
              <Text style={styles.infoValue}>{profile?.lived_abroad ? 'Sim' : 'Não'}</Text>
            </View>
            
            {profile?.lived_abroad && renderInfoRow('Duração no Estrangeiro', profile?.abroad_duration || '', 'abroad_duration')}
          </View>

          {/* Secção Juntar à Equipa (para utilizadores normais) */}
          {!isOwner && (
            <View style={styles.teamSection}>
              <Ionicons name="people" size={32} color={Colors.primary} />
              <Text style={styles.teamTitle}>Quer fazer parte da equipa IMPAR?</Text>
              <TouchableOpacity 
                style={styles.teamButton}
                onPress={() => setShowTeamModal(true)}
              >
                <Text style={styles.teamButtonText}>Clique aqui</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Secção Candidaturas à Equipa (para owner) */}
          {isOwner && (
            <View style={styles.applicationsSection}>
              <View style={styles.applicationsSectionHeader}>
                <Ionicons name="people" size={24} color={Colors.primary} />
                <Text style={styles.applicationsSectionTitle}>Candidaturas à Equipa</Text>
                <View style={styles.applicationsBadge}>
                  <Text style={styles.applicationsBadgeText}>{teamApplications.length}</Text>
                </View>
              </View>
              
              {loadingApplications ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 16 }} />
              ) : teamApplications.length === 0 ? (
                <View style={styles.emptyApplications}>
                  <Ionicons name="mail-outline" size={32} color="#d1d5db" />
                  <Text style={styles.emptyApplicationsText}>Nenhuma candidatura recebida</Text>
                </View>
              ) : (
                teamApplications.map((app) => (
                  <View key={app.id} style={styles.applicationCard}>
                    <View style={styles.applicationHeader}>
                      <View style={styles.applicationAvatar}>
                        <Ionicons name="person" size={18} color={Colors.primary} />
                      </View>
                      <View style={styles.applicationInfo}>
                        <Text style={styles.applicationName}>{app.user_name}</Text>
                        <Text style={styles.applicationEmail}>{app.user_email}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteApplicationButton}
                        onPress={() => handleDeleteApplication(app.id)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.applicationMessage}>"{app.message}"</Text>
                    <Text style={styles.applicationDate}>
                      {new Date(app.created_at).toLocaleDateString('pt-PT', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Secção Administração (apenas para owner) */}
          {isOwner && (
            <View style={styles.adminSection}>
              <Text style={styles.adminSectionTitle}>Administração</Text>
              <TouchableOpacity 
                style={styles.adminButton}
                onPress={() => router.push('/admin-users')}
              >
                <Ionicons name="people-circle" size={24} color={Colors.primary} />
                <View style={styles.adminButtonContent}>
                  <Text style={styles.adminButtonTitle}>Ver Utilizadores Registados</Text>
                  <Text style={styles.adminButtonSubtitle}>Aceder aos dados e emails dos utilizadores</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          )}

          {/* Botão Terminar Sessão */}
          <TouchableOpacity style={[styles.logoutButton, isDesktop && styles.logoutButtonDesktop]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text style={styles.logoutText}>Terminar Sessão</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Candidatura */}
      <Modal
        visible={showTeamModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowTeamModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDesktop && styles.modalContentDesktop]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Juntar-se à Equipa IMPAR</Text>
              <TouchableOpacity onPress={() => setShowTeamModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalLabel}>
              Fale-nos um pouco sobre si, e porque se quer juntar à nossa equipa.
            </Text>
            
            <TextInput
              style={styles.modalTextArea}
              placeholder="Escreva aqui a sua mensagem..."
              value={teamMessage}
              onChangeText={setTeamMessage}
              multiline
              numberOfLines={6}
              placeholderTextColor="#9ca3af"
              textAlignVertical="top"
            />
            
            <TouchableOpacity 
              style={[styles.submitButton, submittingApplication && styles.submitButtonDisabled]}
              onPress={handleSubmitTeamApplication}
              disabled={submittingApplication}
            >
              {submittingApplication ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Enviar Candidatura</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  contentDesktop: {
    padding: 32,
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  profileHeaderDesktop: {
    padding: 48,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainerDesktop: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  name: {
    fontSize: 24,
    fontFamily: Fonts.heading.bold,
    color: '#111827',
    marginBottom: 4,
  },
  nameDesktop: {
    fontSize: 28,
  },
  email: {
    fontSize: 16,
    fontFamily: Fonts.body.regular,
    color: '#6b7280',
    marginBottom: 12,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  ownerText: {
    fontSize: 14,
    fontFamily: Fonts.body.semiBold,
    color: '#f59e0b',
    marginLeft: 6,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.heading.bold,
    color: Colors.primary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: Fonts.body.semiBold,
    color: Colors.primary,
    marginLeft: 4,
  },
  cancelButton: {
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: '#ef4444',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: '#6b7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: Fonts.body.semiBold,
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  infoInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: '#111827',
    textAlign: 'right',
    backgroundColor: Colors.gray50,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  teamSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gray200,
    alignItems: 'center',
  },
  teamTitle: {
    fontSize: 18,
    fontFamily: Fonts.heading.semiBold,
    color: Colors.primary,
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  teamButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  teamButtonText: {
    fontSize: 16,
    fontFamily: Fonts.body.semiBold,
    color: '#fff',
  },
  // Candidaturas à Equipa (para owner)
  applicationsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  applicationsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  applicationsSectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.heading.bold,
    color: Colors.primary,
    marginLeft: 12,
    flex: 1,
  },
  applicationsBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  applicationsBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.body.bold,
    color: '#fff',
  },
  emptyApplications: {
    alignItems: 'center',
    padding: 24,
  },
  emptyApplicationsText: {
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: '#9ca3af',
    marginTop: 8,
  },
  applicationCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  applicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  applicationAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  applicationInfo: {
    flex: 1,
  },
  applicationName: {
    fontSize: 14,
    fontFamily: Fonts.body.semiBold,
    color: '#111827',
  },
  applicationEmail: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: '#6b7280',
  },
  deleteApplicationButton: {
    padding: 8,
  },
  applicationMessage: {
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: '#374151',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 20,
  },
  applicationDate: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: '#9ca3af',
  },
  adminSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  adminSectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.heading.bold,
    color: Colors.primary,
    marginBottom: 16,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  adminButtonContent: {
    flex: 1,
    marginLeft: 12,
  },
  adminButtonTitle: {
    fontSize: 15,
    fontFamily: Fonts.body.semiBold,
    color: '#111827',
  },
  adminButtonSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.body.regular,
    color: '#6b7280',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 32,
  },
  logoutButtonDesktop: {
    maxWidth: 300,
    alignSelf: 'center',
    width: '100%',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: Fonts.body.semiBold,
    color: '#ef4444',
    marginLeft: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
  },
  modalContentDesktop: {
    padding: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.heading.bold,
    color: Colors.primary,
  },
  modalLabel: {
    fontSize: 15,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  modalTextArea: {
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: Fonts.body.regular,
    color: '#111827',
    borderWidth: 1,
    borderColor: Colors.gray200,
    minHeight: 150,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: Fonts.body.semiBold,
    color: '#fff',
  },
});
