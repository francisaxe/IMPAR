import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../../constants/colors';

export default function SobreScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  
  // Calcular largura das imagens (3 lado a lado em desktop, empilhadas em mobile)
  const imageWidth = isDesktop ? (width - 128) / 3 - 16 : width - 64;
  const imageHeight = 200;

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

        {/* O PROBLEMA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O Problema</Text>
          
          <Text style={styles.sectionText}>
            Vivemos num tempo de abundância informativa e escassez de clareza. Nunca houve tanta informação disponível, nem tantos canais a produzi-la, mas essa quantidade não se traduziu numa melhor compreensão da realidade. A velocidade e a fragmentação transformaram a informação num fluxo constante de ruído.
          </Text>
          
          <Text style={styles.sectionText}>
            Grande parte do jornalismo contemporâneo passou a competir pela reação imediata — pelo clique, pela partilha, pela emoção — em detrimento do contexto, da verificação e da responsabilidade. Factos surgem sem enquadramento, opiniões confundem-se com informação e a urgência substitui o rigor.
          </Text>
          
          <Text style={styles.sectionText}>
            O problema não é a falta de informação, é a dificuldade crescente em compreender a realidade de forma clara, equilibrada e fundamentada.
          </Text>
          
          <Text style={[styles.sectionText, styles.highlightText]}>
            É neste contexto que a IMPAR nasce.
          </Text>
        </View>

        {/* Separador com imagens */}
        <View style={styles.imagesSection}>
          <View style={styles.separator} />
          
          <Text style={styles.imagesIntro}>
            Estes são resultados de algumas sondagens que nos foram apresentadas antes da primeira volta das eleições presidenciais de 2026.
          </Text>
          
          <View style={[styles.imagesContainer, isDesktop && styles.imagesContainerDesktop]}>
            <Image 
              source={require('../../assets/sondagem1.jpg')}
              style={[styles.sondagemImage, { width: isDesktop ? '31%' : '100%', height: imageHeight }]}
              resizeMode="cover"
            />
            <Image 
              source={require('../../assets/sondagem2.jpg')}
              style={[styles.sondagemImage, { width: isDesktop ? '31%' : '100%', height: imageHeight }]}
              resizeMode="cover"
            />
            <Image 
              source={require('../../assets/sondagem3.jpg')}
              style={[styles.sondagemImage, { width: isDesktop ? '31%' : '100%', height: imageHeight }]}
              resizeMode="cover"
            />
          </View>
          
          <View style={styles.separator} />
        </View>

        {/* A NOSSA RESPOSTA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>A Nossa Resposta</Text>
          
          <Text style={styles.sectionText}>
            A resposta da IMPAR é simples, mas exigente: entender qual a realidade em que vivemos e analisá-la com imparcialidade, independência e rigor.
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
  sectionTitle: {
    fontSize: 28,
    fontFamily: Fonts.heading.bold,
    color: Colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionText: {
    fontSize: 16,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    lineHeight: 26,
    marginBottom: 16,
    textAlign: 'justify',
  },
  highlightText: {
    fontFamily: Fonts.body.semiBold,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 0,
  },
  imagesSection: {
    marginBottom: 24,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.gray300,
    marginVertical: 24,
  },
  imagesIntro: {
    fontSize: 15,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  imagesContainer: {
    gap: 16,
  },
  imagesContainerDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sondagemImage: {
    borderRadius: 12,
    marginBottom: 16,
  },
});
