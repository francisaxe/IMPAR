import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../../constants/colors';

export default function SobreScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={[
        styles.scrollContent,
        isDesktop && styles.scrollContentDesktop
      ]}>
        {/* Header com IMPAR centralizado - mesmo tamanho que Início */}
        <View style={[styles.header, isDesktop && styles.headerDesktop]}>
          <Image 
            source={require('../../assets/impar-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Jornalismo factual. Imparcialidade por método</Text>
        </View>

        {/* MISSÃO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flag" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>MISSÃO</Text>
          </View>
          <Text style={styles.sectionText}>
            A missão da IMPAR é examinar os factos com rigor, apresentá-los com clareza e publicá-los com imparcialidade, 
            para que o público possa compreender a realidade sem distorção.
          </Text>
          <Text style={styles.sectionText}>
            Não competimos pela rapidez nem pela reação imediata. Comprometemo-nos com a precisão, o contexto e a 
            responsabilidade editorial, colocando o interesse público acima do ruído informativo.
          </Text>
        </View>

        {/* VISÃO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="eye" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>VISÃO</Text>
          </View>
          <Text style={styles.sectionText}>
            A IMPAR ambiciona tornar-se uma referência de confiança no jornalismo factual, num tempo marcado pela 
            desinformação, pela polarização e pelo sensacionalismo.
          </Text>
          <Text style={styles.sectionText}>
            Acreditamos num jornalismo onde a informação é avaliada pela sua exatidão, profundidade e responsabilidade 
            — e não pela velocidade, pelo impacto emocional ou por agendas externas.
          </Text>
        </View>

        {/* VALORES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="diamond" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>VALORES</Text>
          </View>
          
          <View style={styles.valueItem}>
            <View style={styles.valueHeader}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.valueTitle}>Verdade</Text>
            </View>
            <Text style={styles.valueText}>
              A verdade é o nosso fundamento. Não negociamos factos nem moldamos narrativas. Procuramos a realidade 
              tal como é — inteira, complexa e verificável.
            </Text>
          </View>

          <View style={styles.valueItem}>
            <View style={styles.valueHeader}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.valueTitle}>Imparcialidade</Text>
            </View>
            <Text style={styles.valueText}>
              Não tomamos partido. Apresentamos os factos e os diferentes lados com equilíbrio, distância crítica e 
              respeito pelo leitor. O nosso papel é informar, não persuadir.
            </Text>
          </View>

          <View style={styles.valueItem}>
            <View style={styles.valueHeader}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.valueTitle}>Independência</Text>
            </View>
            <Text style={styles.valueText}>
              Somos independentes de pressões políticas, económicas ou ideológicas. A informação que publicamos serve 
              apenas o interesse público.
            </Text>
          </View>

          <View style={styles.valueItem}>
            <View style={styles.valueHeader}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.valueTitle}>Rigor</Text>
            </View>
            <Text style={styles.valueText}>
              Trabalhamos com método, verificação e validação contínua. Não publicamos cedo — publicamos certo.
            </Text>
          </View>

          <View style={[styles.valueItem, { borderBottomWidth: 0 }]}>
            <View style={styles.valueHeader}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.valueTitle}>Transparência e Responsabilidade</Text>
            </View>
            <Text style={styles.valueText}>
              Explicamos como trabalhamos, assumimos os nossos erros e corrigimo-los de forma clara e pública. 
              Sabemos que as palavras têm impacto e agimos com consciência desse peso.
            </Text>
          </View>
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 12,
  },
  valueItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  valueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 8,
  },
  valueText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    paddingLeft: 28,
  },
});
