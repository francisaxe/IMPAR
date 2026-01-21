import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, useWindowDimensions } from 'react-native';
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
          <Text style={styles.subtitle}>Jornalismo factual. Imparcialidade por método</Text>
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
    maxWidth: 900,
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
  },
  introText: {
    fontSize: 18,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
    lineHeight: 28,
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
});
