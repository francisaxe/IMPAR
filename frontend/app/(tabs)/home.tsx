import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, useWindowDimensions, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Fonts } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

interface FeaturedItem {
  id: string;
  type: 'survey' | 'news';
  title: string;
  description: string;
  created_at: string;
  response_count?: number;
  is_closed?: boolean;
  image_url?: string;
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { user } = useAuth();
  const router = useRouter();
  const isOwner = user?.role === 'owner';
  
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeaturedContent = async () => {
    try {
      const response = await api.get('/api/featured');
      setFeaturedItems(response.data);
    } catch (error) {
      console.error('Error fetching featured content:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeaturedContent();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFeaturedContent();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFeaturedContent();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleFeaturedItemPress = (item: FeaturedItem) => {
    if (item.type === 'survey') {
      if (item.is_closed) {
        router.push(`/results?id=${item.id}`);
      } else {
        router.push(`/survey-detail?id=${item.id}`);
      }
    }
    // News items don't navigate anywhere for now
  };

  const renderFeaturedCard = (item: FeaturedItem) => (
    <TouchableOpacity 
      key={item.id}
      style={styles.featuredCard}
      onPress={() => handleFeaturedItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.featuredHeader}>
        <View style={[
          styles.featuredTypeBadge,
          item.type === 'survey' ? styles.surveyBadge : styles.newsBadge
        ]}>
          <Ionicons 
            name={item.type === 'survey' ? 'clipboard' : 'newspaper'} 
            size={14} 
            color={item.type === 'survey' ? Colors.primary : '#10b981'} 
          />
          <Text style={[
            styles.featuredTypeText,
            item.type === 'survey' ? styles.surveyTypeText : styles.newsTypeText
          ]}>
            {item.type === 'survey' ? 'Sondagem' : 'Notícia'}
          </Text>
        </View>
        <Ionicons name="star" size={16} color="#f59e0b" />
      </View>
      
      <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.featuredDescription} numberOfLines={3}>{item.description}</Text>
      
      <View style={styles.featuredFooter}>
        <Text style={styles.featuredDate}>{formatDate(item.created_at)}</Text>
        {item.type === 'survey' && (
          <View style={styles.responseInfo}>
            <Ionicons name="people-outline" size={14} color="#6b7280" />
            <Text style={styles.responseCount}>{item.response_count || 0}</Text>
          </View>
        )}
      </View>
      
      {item.type === 'survey' && item.is_closed && (
        <View style={styles.closedOverlay}>
          <Text style={styles.closedText}>Encerrada</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.scrollContentDesktop
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
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

        {/* Área de Destaques */}
        <View style={styles.featuredSection}>
          <View style={styles.featuredSectionHeader}>
            <Ionicons name="star" size={24} color="#f59e0b" />
            <Text style={styles.featuredSectionTitle}>Em Destaque</Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : featuredItems.length > 0 ? (
            <View style={[styles.featuredGrid, isDesktop && styles.featuredGridDesktop]}>
              {featuredItems.map(renderFeaturedCard)}
            </View>
          ) : (
            <View style={styles.emptyFeatured}>
              <Ionicons name="star-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyFeaturedText}>
                Ainda não há conteúdo em destaque.
              </Text>
              {isOwner && (
                <Text style={styles.emptyFeaturedHint}>
                  Vá às "Sondagens" e clique na estrela para destacar.
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Gestão de Destaques - Apenas para Owner */}
        {isOwner && featuredItems.length > 0 && (
          <View style={styles.manageSection}>
            <View style={styles.manageSectionHeader}>
              <Ionicons name="settings-outline" size={20} color={Colors.primary} />
              <Text style={styles.manageSectionTitle}>Gerir Destaques</Text>
            </View>
            <Text style={styles.manageHint}>
              {featuredItems.length}/3 destaques ativos. Para remover, vá às "Sondagens" e clique na estrela.
            </Text>
            <View style={styles.currentFeatured}>
              {featuredItems.map((item) => (
                <View key={item.id} style={styles.featuredListItem}>
                  <Ionicons 
                    name={item.type === 'survey' ? 'clipboard' : 'newspaper'} 
                    size={16} 
                    color={Colors.primary} 
                  />
                  <Text style={styles.featuredListTitle} numberOfLines={1}>{item.title}</Text>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                </View>
              ))}
            </View>
          </View>
        )}

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
  // Featured Section
  featuredSection: {
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
  featuredSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featuredSectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.heading.bold,
    color: Colors.primary,
    marginLeft: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  featuredGrid: {
    gap: 16,
  },
  featuredGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featuredCard: {
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
    position: 'relative',
    overflow: 'hidden',
  },
  featuredCardDesktop: {
    width: '31%',
    marginRight: '2%',
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuredTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  surveyBadge: {
    backgroundColor: '#eef2ff',
  },
  newsBadge: {
    backgroundColor: '#d1fae5',
  },
  featuredTypeText: {
    fontSize: 12,
    fontFamily: Fonts.body.semiBold,
    marginLeft: 4,
  },
  surveyTypeText: {
    color: Colors.primary,
  },
  newsTypeText: {
    color: '#10b981',
  },
  featuredTitle: {
    fontSize: 16,
    fontFamily: Fonts.heading.bold,
    color: '#111827',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredDate: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: '#9ca3af',
  },
  responseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responseCount: {
    fontSize: 12,
    fontFamily: Fonts.body.semiBold,
    color: '#6b7280',
    marginLeft: 4,
  },
  closedOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  closedText: {
    fontSize: 10,
    fontFamily: Fonts.body.semiBold,
    color: '#ef4444',
  },
  emptyFeatured: {
    alignItems: 'center',
    padding: 32,
  },
  emptyFeaturedText: {
    fontSize: 16,
    fontFamily: Fonts.body.regular,
    color: '#9ca3af',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyFeaturedHint: {
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: Colors.primary,
    marginTop: 8,
    textAlign: 'center',
  },
  // Manage Section (Owner only)
  manageSection: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  manageSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  manageSectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.heading.semiBold,
    color: Colors.primary,
    marginLeft: 8,
  },
  manageHint: {
    fontSize: 13,
    fontFamily: Fonts.body.regular,
    color: '#92400e',
    marginBottom: 12,
  },
  currentFeatured: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
  },
  featuredListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  featuredListTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: '#374151',
    marginLeft: 8,
    marginRight: 8,
  },
  // Regular Sections
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
