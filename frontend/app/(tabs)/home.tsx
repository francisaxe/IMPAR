import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../../constants/colors';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={[
        styles.scrollContent,
        isDesktop && styles.scrollContentDesktop
      ]}>
        {/* Header com IMPAR centralizado */}
        <View style={[styles.header, isDesktop && styles.headerDesktop]}>
          <Image 
            source={require('../../assets/impar-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Jornalismo factual. Imparcialidade por método.</Text>
        </View>

        {/* Texto introdutório */}
        <View style={styles.introSection}>
          <Text style={styles.introText}>
            Vivemos num tempo de abundância informativa e escassez de clareza.
          </Text>
          <Text style={[styles.introText, { marginTop: 16, marginBottom: 0 }]}>
            A IMPAR nasce para examinar os factos com rigor, contexto e responsabilidade.
          </Text>
        </View>

        {/* Área para conteúdo do Administrador */}
        <View style={styles.adminSection}>
          <Text style={styles.adminPlaceholder}>
            Conteúdo em destaque
          </Text>
          <Text style={styles.adminSubtext}>
            O administrador poderá adicionar aqui sondagens, resultados ou notícias.
          </Text>
        </View>

        {/* PARTICIPA NAS NOSSAS SONDAGENS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Participa nas Nossas Sondagens</Text>
          </View>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.benefitText}>Partilhe as suas opiniões valiosas</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.benefitText}>Ajude-nos a descobrir a realidade</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.benefitText}>Veja resultados em tempo real</Text>
            </View>
          </View>
        </View>

        {/* COMO PARTICIPAR */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="rocket" size={24} color="#ef4444" />
            <Text style={styles.sectionTitle}>Como Participar</Text>
          </View>
          <Text style={styles.sectionText}>
            Navegue pelas sondagens disponíveis no separador "Sondagens", complete-as e veja os resultados agregados. 
            Acompanhe a sua participação em "Respostas" e veja como a sua contribuição faz a diferença.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  scrollContentDesktop: {
    padding: 32,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingVertical: 48,
  },
  headerDesktop: {
    paddingVertical: 64,
    marginBottom: 48,
  },
  logoImage: {
    width: 280,
    height: 70,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: Fonts.heading.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  introSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  introText: {
    fontSize: 16,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  adminSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 32,
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderStyle: 'dashed',
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
    marginBottom: 24,
  },
  adminPlaceholder: {
    fontSize: 20,
    fontFamily: Fonts.heading.semiBold,
    color: Colors.gray400,
    marginBottom: 8,
  },
  adminSubtext: {
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: Colors.gray400,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.heading.bold,
    color: Colors.primary,
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: 15,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  benefitsList: {
    marginTop: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 16,
    fontFamily: Fonts.body.regular,
    color: '#4b5563',
    marginLeft: 12,
    flex: 1,
  },
});
