import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const isLargeDesktop = width >= 1024;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={[
        styles.scrollContent,
        isDesktop && styles.scrollContentDesktop
      ]}>
        <View style={[styles.header, isDesktop && styles.headerDesktop]}>
          <Image 
            source={require('../../assets/impar-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Jornalismo Factual</Text>
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

          <View style={styles.valueItem}>
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Porquê Participar</Text>
          </View>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.benefitText}>Partilhe as suas opiniões valiosas</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.benefitText}>Influencie decisões importantes</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.benefitText}>Veja resultados em tempo real</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.benefitText}>Inquéritos rápidos e fáceis</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="rocket" size={24} color="#ef4444" />
            <Text style={styles.sectionTitle}>Como Começar</Text>
          </View>
          <Text style={styles.sectionText}>
            Navegue pelos inquéritos disponíveis no separador "Inquéritos", complete-os e veja os resultados agregados. 
            Acompanhe a sua participação em "Minhas Respostas" e veja como a sua contribuição faz a diferença.
          </Text>
        </View>

        <View style={styles.footer}>
          <Ionicons name="heart" size={20} color="#ef4444" />
          <Text style={styles.footerText}>Obrigado por fazer parte da nossa comunidade!</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 24,
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
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
  sectionTextBold: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 26,
    marginBottom: 16,
    fontWeight: '600',
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
    color: '#4b5563',
    marginLeft: 12,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
  },
  footerText: {
    fontSize: 16,
    color: '#991b1b',
    marginLeft: 8,
    fontWeight: '600',
  },
});
