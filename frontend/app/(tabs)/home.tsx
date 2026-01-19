import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image 
            source={require('../../assets/impar-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Jornalismo Independente</Text>
        </View>

        {/* MISSÃO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flag" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>MISSÃO</Text>
          </View>
          <Text style={styles.sectionTextBold}>
            Restaurar a confiança na informação em Portugal, oferecendo jornalismo não só independente, 
            mas também rigoroso, verdadeiro e imparcial.
          </Text>
          <Text style={styles.sectionText}>
            A IMPAR existe para devolver ao público aquilo que se perdeu: a certeza de que a verdade está 
            acima de interesses políticos, económicos ou narrativos.
          </Text>
          <Text style={styles.sectionText}>
            A nossa missão é informar com integridade absoluta — sempre.
          </Text>
        </View>

        {/* VISÃO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="eye" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>VISÃO</Text>
          </View>
          <Text style={styles.sectionTextBold}>
            Ser a principal referência de confiança no panorama mediático português, elevando o padrão 
            da informação e redefinindo o que significa fazer jornalismo no século XXI.
          </Text>
          <Text style={styles.sectionText}>
            Queremos que, ao pensar em credibilidade, imparcialidade e transparência, Portugal pense em IMPAR.
          </Text>
          <Text style={styles.sectionText}>
            A visão é ambiciosa, mas clara: colocar o país a confiar novamente.
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
              <Text style={styles.valueTitle}>1. Verdade</Text>
            </View>
            <Text style={styles.valueText}>
              A verdade é o nosso fundamento. Não negociamos factos, não moldamos narrativas. 
              Procuramos a realidade tal como é — inteira.
            </Text>
          </View>

          <View style={styles.valueItem}>
            <View style={styles.valueHeader}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.valueTitle}>2. Imparcialidade</Text>
            </View>
            <Text style={styles.valueText}>
              Não tomamos partido. Apresentamos todos os lados da história com equilíbrio, sem favorecer 
              interesses ou opiniões pessoais. A nossa missão é informar, não persuadir.
            </Text>
          </View>

          <View style={styles.valueItem}>
            <View style={styles.valueHeader}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.valueTitle}>3. Independência</Text>
            </View>
            <Text style={styles.valueText}>
              Livre de lobbies e interesses externos. A informação só serve o público.
            </Text>
          </View>

          <View style={styles.valueItem}>
            <View style={styles.valueHeader}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.valueTitle}>4. Transparência</Text>
            </View>
            <Text style={styles.valueText}>
              Explicamos as nossas escolhas, assumimos os nossos erros e mostramos como trabalhamos. 
              A confiança constrói-se à vista de todos.
            </Text>
          </View>

          <View style={styles.valueItem}>
            <View style={styles.valueHeader}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.valueTitle}>5. Rigor</Text>
            </View>
            <Text style={styles.valueText}>
              Verificação, validação e método. Não publicamos cedo — publicamos certo.
            </Text>
          </View>

          <View style={styles.valueItem}>
            <View style={styles.valueHeader}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.valueTitle}>6. Responsabilidade</Text>
            </View>
            <Text style={styles.valueText}>
              O impacto das palavras conta. Colocamos o interesse público acima da velocidade, 
              do clique ou da polémica.
            </Text>
          </View>

          <View style={styles.valueItem}>
            <View style={styles.valueHeader}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.valueTitle}>7. Proximidade</Text>
            </View>
            <Text style={styles.valueText}>
              A IMPAR é feita com e para as pessoas. Escutamos, explicamos, envolvemos e servimos a comunidade.
            </Text>
          </View>

          <View style={styles.valueItem}>
            <View style={styles.valueHeader}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.valueTitle}>8. Coragem</Text>
            </View>
            <Text style={styles.valueText}>
              Para confrontar poderes, contrariar tendências, expor falhas e defender a verdade — 
              mesmo quando é incómoda.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Why Participate</Text>
          </View>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.benefitText}>Share your valuable opinions</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.benefitText}>Influence important decisions</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.benefitText}>See real-time results</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.benefitText}>Quick and easy surveys</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="rocket" size={24} color="#ef4444" />
            <Text style={styles.sectionTitle}>Get Started</Text>
          </View>
          <Text style={styles.sectionText}>
            Browse available surveys in the "Surveys" tab, complete them, and view aggregated results. 
            Track your participation in "My Answers" and see how your input contributes to the bigger picture.
          </Text>
        </View>

        <View style={styles.footer}>
          <Ionicons name="heart" size={20} color="#ef4444" />
          <Text style={styles.footerText}>Thank you for being part of our community!</Text>
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
